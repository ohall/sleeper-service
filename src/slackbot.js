import logger from "./logger.js";
import pkg from "@slack/bolt";
const { App } = pkg;
import { config } from "dotenv";
import { gpt35Turbo } from "./openai.js";
import prompts from "../configs/prompts.js";
import { generateMenu, handleMenuReaction } from "./menu.js";
import { appConfigs } from "../configs/appConfigs.js";
import messageRouter from "./messageRouter.js";
config();

const slack = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

slack.action(/.*/, async ({ ack, body }) => {
  ack();
  await handleMenuReaction(body);
});

slack.message(/.*/, async ({ message, say }) => {
  logger.info("Received message event:", message);
  if (message.text.includes("menu")) {
    await generateMenu();
  }
  await say(await gpt35Turbo(prompts.user_message.system, message.text));
  // await say(await messageRouter(prompts.routing.system, message.text));
});

slack.event("app_mention", async ({ event, say }) => {
  logger.info("Received mention event:", event);
  console.log(`event.text: ${event.text}, channel_name: ${event.channel_name}`);
  if (
    event.text.includes("menu") &&
    event.channel_name === appConfigs.weeklyMenuChannel
  ) {
    await generateMenu();
  } else {
    const system = prompts.mention_message.system;
    await say({
      text: await gpt35Turbo(system, event.text),
      thread_ts: event.ts,
    });
  }
});

async function startSlack() {
  await slack.start(process.env.PORT + 1 || 3001);
  logger.info(`⚡️ Slack bot is running on port ${process.env.PORT + 1}`);
}

function stopSlack() {
  slack.stop();
  logger.info("Slack bot stopped");
}

export { startSlack, stopSlack, slack };
