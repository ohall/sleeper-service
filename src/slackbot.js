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
  console.log(`event ${JSON.stringify(event, null, 2)}`);
  if (event.text.includes("menu")) {
    await generateMenu();
  } else {
    const system = prompts.mention_message.system;
    await say({
      text: await gpt35Turbo(system, event.text),
      thread_ts: event.ts,
    });
  }
});

async function writeToCanvas(title, text, channelId) {
  try {
    console.log(`text: ${text}`);
    const documentContent = {
      type: "markdown",
      markdown: "documment text",
    };

    //https://api.slack.com/methods/canvases.create
    const result = await slack.client.canvases.create({
      channel_id: channelId,
      title: title,
      document_content: documentContent,
    });

    console.log(
      `title: ${title}, channelId: ${channelId}, text: ${text}, result: ${JSON.stringify(result, null, 2)}`,
    );

    //https://api.slack.com/methods/canvases.access.set
    await slack.client.canvases.access.set({
      canvas_id: result.canvas_id,
      access_level: "write",
      channel_ids: [channelId],
    });

    await slack.client.chat.postMessage({
      channel: channelId,
      text: `https://${appConfigs.slackWorkspace}.slack.com/docs/${appConfigs.slackTeamId}/${result.canvas_id}`,
    });

    // https://api.slack.com/methods/canvases.sections.lookup
    // const sections = await slack.client.canvases.sections.lookup({
    //   canvas_id: result.canvas_id,
    //   criteria: { section_types: ["any_header"] },
    // });

    //https://api.slack.com/methods/canvases.edit
    // await slack.client.canvases.edit({
    //   canvas_id: result.canvas_id,
    //   changes: [
    //     {
    //       operation: "insert_after",
    //       section_id: sections[0].id,
    //       document_content: {
    //         type: "markdown",
    //         markdown: text,
    //       },
    //     },
    //   ],
    // });

    logger.info("Successfully wrote to canvas");
    return result;
  } catch (error) {
    logger.error("Error writing to canvas:", error);
    throw error;
  }
}

async function startSlack() {
  await slack.start(process.env.PORT + 1 || 3001);
  logger.info(`⚡️ Slack bot is running on port ${process.env.PORT + 1}`);
}

function stopSlack() {
  slack.stop();
  logger.info("Slack bot stopped");
}

export { startSlack, stopSlack, slack, writeToCanvas };
