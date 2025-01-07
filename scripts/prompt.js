import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import logger from "../src/logger.js";
const model = new ChatOpenAI({ model: "gpt-3.5-turbo" });

async function openai(system, user) {
    const messages = [
        new SystemMessage(system),
        new HumanMessage(user),  
    ];
    logger.info(`Messages: ${messages}`);
    const response = await model.invoke(messages);
    logger.info(`Response: ${response.content}`);
    return response.content;
}

export default openai;