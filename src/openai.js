import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import logger from "./logger.js";
let model;

// https://platform.openai.com/docs/models
const createChatWithModel = (modelType) => {
  return (system, user) => {
    model = new ChatOpenAI({ model: modelType });
    return openai(system, user);
  };
};

const createStructuredChatWithModel = (modelType) => {
  return (system, user, schema) => {
    model = new ChatOpenAI({ model: modelType }).withStructuredOutput(schema);
    return openai(system, user);
  };
};

const gpt35Turbo = createChatWithModel("gpt-3.5-turbo");
const gpt35TurboStructured = createStructuredChatWithModel("gpt-3.5-turbo");
const gpt4o = createChatWithModel("gpt-4o");
const gpt4oMini = createChatWithModel("gpt-4o-mini");
const gpt4 = createChatWithModel("gpt-4");
const gpt4Turbo = createChatWithModel("gpt-4-turbo");
const gpt4oRealtimePreview = createChatWithModel("gpt-4o-realtime-preview");

async function openai(system, user) {
  const messages = [new SystemMessage(system), new HumanMessage(user)];
  logger.info(`Messages: ${JSON.stringify(messages)}`);
  let response = await model.invoke(messages);
  if (!response || Object.keys(response).length === 0) {
    logger.info("Empty response received, retrying...");
    response = await model.invoke(messages);
  }
  logger.info(`Response: ${JSON.stringify(response)}`);
  return response.content ? response.content : response;
}

export {
  gpt35Turbo,
  gpt4o,
  gpt4oMini,
  gpt4,
  gpt4Turbo,
  gpt4oRealtimePreview,
  gpt35TurboStructured,
};
