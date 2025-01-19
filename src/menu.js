import cron from "node-cron";
import { gpt35TurboStructured } from "./openai.js";
import { config } from "dotenv";
import logger from "./logger.js";
import prompts from "../configs/prompts.js";
import { slack } from "./slackbot.js";
config();

// const MENU_CHANNEL = "#weekly-menu";
const MENU_CHANNEL = "#bot-test";
// Schedule for Friday at 2pm
const MENU_INTERVAL = "0 14 * * 5";
// const MENU_INTERVAL = "* * * * *";
const systemPrompt = prompts.meal_planning.system;

slack.action(/.*/, async ({ ack, body, client, logger }) => {
  ack();
  // console.log(`HERE: ${JSON.stringify(body, null, 2)}`);
  try {
    // Get the original message timestamp from the button action
    const messageTs = body.message.ts;
    const channel = body.channel.id;
    const reaction =
      body.actions[0].text.text === ":+1:" ? "thumbsup" : "thumbsdown";
    const value = body.actions[0].value;
    
    await slack.client.reactions.add({
      channel: channel,
      name: reaction,
      timestamp: messageTs,
    });
  } catch (error) {
    logger.error("Error adding reaction:", error);
  }
});

function createMenuElements(meals) {
  if (Array.isArray(meals)) {
    meals.forEach(async (item) => {
      await slack.client.chat.postMessage({
        channel: MENU_CHANNEL,
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
    const weeklyMenu = await gpt35TurboStructured(
      systemPrompt,
      prompts.meal_planning.user,
      prompts.meal_planning.schema,
    );

    await slack.client.chat.postMessage({
      channel: MENU_CHANNEL,
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

export default () => {
  generateMenu();
  cron.schedule(MENU_INTERVAL, generateMenu);
};
