import logger from "./logger.js";
import pkg from '@slack/bolt';
const { App } = pkg;
import { config } from "dotenv";
import openai from "../scripts/prompt.js";
import prompts from "../configs/prompts.js"
config();

const slack = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN
});

slack.message(/.*/, async ({ message, say }) => {
  logger.info('Received message event:', message);
  const system = prompts.user_message.system;
  await say(await openai(system, message.text));
});

slack.event('app_mention', async ({ event, say }) => {
  logger.info('Received mention event:', event);
  const system = prompts.mention_message.system;
  await say({
    text: await openai(system, event.text),
    thread_ts: event.ts
  });
});

async function startSlack() {
  await slack.start(process.env.PORT+1 || 3001);
  logger.info(`⚡️ Slack bot is running on port ${process.env.PORT+1}`);
}

function stopSlack() {
  slack.stop();
  logger.info('Slack bot stopped');
}

export { startSlack, stopSlack };