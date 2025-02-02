import cron from "node-cron";
import { gpt35TurboStructured } from "./openai.js";
import { config } from "dotenv";
import logger from "./logger.js";
import prompts from "../configs/prompts.js";
import { slack, writeToCanvas } from "./slackbot.js";
import { currentWeek, currentYear } from "./utils.js";
import { updateOne, findOne } from "./services/db.js";
import { appConfigs } from "../configs/appConfigs.js";
import { gpt35Turbo } from "./openai.js";
config();

// Schedule for Friday at 2pm
const MENU_INTERVAL = "0 14 * * 5";
// const MENU_INTERVAL = "* * * * *";
const systemPrompt = prompts.meal_planning.system;

const LIKE_REACTION = "like_meal";

const handleLikeDislikeReaction = async ({
  reaction,
  menuItem,
  channel,
  messageTs,
}) => {
  console.log(
    `reaction: ${reaction}, menuItem: ${menuItem}, channel: ${channel}, messageTs: ${messageTs}`,
  );
  // Connect to DB and update appropriate collection based on reaction
  const result = await updateOne(
    reaction === LIKE_REACTION
      ? appConfigs.weeklyMealsCollection
      : appConfigs.dislikedMealsCollection,
    reaction === LIKE_REACTION ? { week: currentWeek, year: currentYear } : {},
    {
      $addToSet: { meals: menuItem },
      $setOnInsert: { created_at: new Date() },
    },
  );

  logger.info(
    `Added ${menuItem} to ${reaction === LIKE_REACTION ? appConfigs.weeklyMealsCollection : appConfigs.dislikedMealsCollection} ${JSON.stringify(result)}`,
  );

  // Remove button from message on selection
  await slack.client.chat.update({
    channel: channel,
    ts: messageTs,
    blocks: [{ type: "section", text: { type: "plain_text", text: menuItem } }],
  });

  // Add reaction to message
  await slack.client.reactions.add({
    channel: channel,
    name: reaction === LIKE_REACTION ? "thumbsup" : "thumbsdown",
    timestamp: messageTs,
  });
};

const handleRecordRecipes = async (channel, messageTs) => {
  logger.info("Recording recipes...");

  // Add loading indicator
  await slack.client.reactions.add({
    channel: channel,
    name: "hourglass_flowing_sand",
    timestamp: messageTs
  });


  // Get this week's meals from MongoDB
  const weeklyMeals = await findOne(appConfigs.weeklyMealsCollection, {
    week: currentWeek,
    year: currentYear,
  });

  if (!weeklyMeals || !weeklyMeals.meals || weeklyMeals.meals.length === 0) {
    logger.info("No meals found for this week");
    return;
  }

  // Get ingredients and recipes from AI
  const prompt = `For these meals: ${weeklyMeals ? weeklyMeals.meals.join(", ") : ""} 
  ${prompts.shopping_list.user}`;

  const response = await gpt35Turbo(
    "You are an assistant that can help me plan my meals and shopping list.",
    prompt,
  );

  await writeToCanvas(
    `Meal Plan - Week of ${new Date().toLocaleDateString()}`,
    response,
    channel,
  );
  // await writeToCanvas("Recipes Recorded", "Recipes Recorded", channel);

  await slack.client.chat.update({
    channel: channel,
    ts: messageTs,
    blocks: [
      {
        type: "section",
        text: { type: "plain_text", text: "Recipes Recorded" },
      },
    ],
  });

  // Remove loading indicator
  await slack.client.reactions.remove({
    channel: channel,
    name: "hourglass_flowing_sand",
    timestamp: messageTs
  });
};

const handleMenuReaction = async (body) => {
  // Get the original message timestamp from the button action
  const messageTs = body.message.ts;
  const channel = body.channel.id;
  const menuItem = body.message.blocks[0].text.text;
  const reaction = body.actions[0].value;
  console.log(`reaction: ${reaction}`);
  switch (reaction) {
    case "like_meal":
    case "dislike_meal":
      await handleLikeDislikeReaction({
        reaction,
        menuItem,
        channel,
        messageTs,
      });
      break;
    case "record_recipes":
      await handleRecordRecipes(channel, messageTs);
      break;
  }
};

const createTextBlock = (text) => {
  return {
    type: "section",
    text: {
      type: "plain_text",
      text: text,
    },
  };
};

const createButtonElement = (value, text) => {
  return {
    type: "button",
    text: {
      type: "plain_text",
      text: text,
    },
    value: value,
  };
};

async function createMenuElements(meals) {
  if (!Array.isArray(meals)) {
    return;
  }

  await Promise.all(
    meals.map(async (item) => {
      await slack.client.chat.postMessage({
        channel: appConfigs.weeklyMenuChannel,
        text: "Weekly Menu",
        dispatch_action: true,
        blocks: [
          createTextBlock(item),
          {
            type: "actions",
            elements: [
              createButtonElement("like_meal", "👍"),
              createButtonElement("dislike_meal", "👎"),
            ],
          },
        ],
      });
    }),
  );

  await slack.client.chat.postMessage({
    channel: appConfigs.weeklyMenuChannel,
    text: "Weekly Menu",
    dispatch_action: true,
    blocks: [
      {
        type: "actions",
        elements: [createButtonElement("record_recipes", "📝 Shopping List")],
      },
    ],
  });
}

async function generateMenu() {
  try {
    logger.info("Generating weekly menu...");

    const dislikedMeals = await findOne(appConfigs.dislikedMealsCollection, {
      meals: 1,
    });

    const lastWeekMeals = await findOne(
      appConfigs.weeklyMealsCollection,
      {
        week: currentWeek - 1,
        year: currentYear,
      },
      { meals: 1, _id: 0 },
    );

    const dislikedMealsString =
      dislikedMeals?.meals &&
      Array.isArray(dislikedMeals.meals) &&
      dislikedMeals.meals.length > 0
        ? dislikedMeals.meals.join(", ")
        : "";

    const lastWeekMealsString =
      lastWeekMeals?.meals &&
      Array.isArray(lastWeekMeals.meals) &&
      lastWeekMeals.meals.length > 0
        ? lastWeekMeals.meals.join(", ")
        : "";

    const weeklyMenu = await gpt35TurboStructured(
      systemPrompt,
      prompts.meal_planning.user + dislikedMealsString + lastWeekMealsString,
      prompts.meal_planning.schema,
    );

    await slack.client.chat.postMessage({
      channel: appConfigs.weeklyMenuChannel,
      text: "Weekly Menu",
      dispatch_action: true,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*WEEKLY MENU*",
          },
        },
      ],
    });

    createMenuElements(weeklyMenu.meals);

    logger.info("Weekly menu posted successfully");
  } catch (error) {
    logger.error("Error generating/posting weekly menu:", error);
  }
}

const scheduleMenu = () => {
  cron.schedule(MENU_INTERVAL, generateMenu);
};

export { scheduleMenu, generateMenu, handleMenuReaction };
