import cron from 'node-cron';
import { gpt35Turbo } from "./openai.js";
import { config } from "dotenv";
import logger from "./logger.js";
import prompts from "../configs/prompts.js";
import { slack } from "./slackbot.js";
config();

const MENU_CHANNEL = '#weekly-menu';
// Schedule for Friday at 2pm
const MENU_INTERVAL = '0 14 * * 5';
// const MENU_INTERVAL = '* * * * *';

const systemPrompt = prompts.meal_planning.system;

export default () => {
    cron.schedule(MENU_INTERVAL, async () => {
        try {
            logger.info('Generating weekly menu...');
            const weeklyMenu = await gpt35Turbo(systemPrompt, prompts.meal_planning.user);
            
            await slack.client.chat.postMessage({
                channel: MENU_CHANNEL,
                text: "Here's your menu for next week! 📝\n\n" + weeklyMenu
            });
            
            logger.info('Weekly menu posted successfully');
        } catch (error) {
            logger.error('Error generating/posting weekly menu:', error);
        }
    });
}


