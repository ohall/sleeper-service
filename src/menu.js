import cron from "node-cron";
import { gpt35TurboStructured } from "./openai.js";
import { config } from "dotenv";
import logger from "./logger.js";
import prompts from "../configs/prompts.js";
import { slack } from "./slackbot.js";
import { currentWeek, currentYear } from "./utils.js";
import { updateOne, findOne } from "./services/db.js";
import { appConfigs } from "../configs/appConfigs.js";
config();

// Schedule for Friday at 2pm
const MENU_INTERVAL = "0 14 * * 5";
// const MENU_INTERVAL = "* * * * *";
const systemPrompt = prompts.meal_planning.system;

const DISLIKE_REACTION = "thumbsdown";
const LIKE_REACTION = "thumbsup";

const handleMenuReaction = async ({ ack, body }) => {
  ack();
  // Get the original message timestamp from the button action
  const messageTs = body.message.ts;
  const channel = body.channel.id;
  const reaction =
    body.actions[0].text.text === ":+1:" ? LIKE_REACTION : DISLIKE_REACTION;
  const menuItem = body.actions[0].value;
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
    name: reaction,
    timestamp: messageTs,
  });
};

function createMenuElements(meals) {
  if (Array.isArray(meals)) {
    meals.forEach(async (item) => {
      await slack.client.chat.postMessage({
        channel: appConfigs.weeklyMenuChannel,
        text: "Weekly Menu",
        dispatch_action: true,
        blocks: [
          {
            type: "section",
            text: {
              type: "plain_text",
              text: item,
            },
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "👍",
                },
                style: "primary",
                value: item,
              },
              {
                type: "button",
                text: {
                  type: "plain_text",
                  emoji: true,
                  text: "👎",
                },
                style: "danger",
                value: item,
              },
            ],
          },
        ],
      });
    });
  }
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
    const dislikedMealsString = Array.isArray(dislikedMeals)
      ? dislikedMeals.meals.join(", ")
      : "";
    const lastWeekMealsString = Array.isArray(lastWeekMeals)
      ? lastWeekMeals.meals.join(", ")
      : lastWeekMeals.meals;
    console.log(dislikedMealsString);
    console.log(lastWeekMealsString);
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
