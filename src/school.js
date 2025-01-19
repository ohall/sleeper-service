import cron from "node-cron";
import { gpt35Turbo } from "./openai.js";
import logger from "./logger.js";
import { slack } from "./slackbot.js";
import prompts from "../configs/prompts.js";

const SCHOOL_CHANNEL = "#sleepy-school";
const SCHOOL_INTERVAL = "0 7 * * *";
// const SCHOOL_INTERVAL = '* * * * *';

// Schedule to run every morning at 7am
const scheduleEducationalContent = () => {
  cron.schedule(
    SCHOOL_INTERVAL,
    async () => {
      try {
        // Ask GPT to generate educational content suggestions
        const prompt = prompts.educational_content.user;

        const response = await gpt35Turbo(
          prompts.educational_content.system,
          prompt,
        );

        // Post to Slack
        try {
          await slack.client.chat.postMessage({
            channel: SCHOOL_CHANNEL, // Make sure this channel exists
            text: "🎓 *Today's Content Picks for Kids!* 📚\n\n" + response,
            blocks: [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: "🎓 *Today's Educational Content Picks for Kids!* 📚",
                },
              },
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: response,
                },
              },
            ],
          });
          logger.info("Educational content posted successfully");
        } catch (error) {
          logger.error("Error posting educational content to Slack:", error);
        }
      } catch (error) {
        logger.error("Error generating educational content:", error);
      }
    },
    {
      timezone: "America/New_York",
    },
  );
};

export default scheduleEducationalContent;
