import {
  gpt35Turbo,
  gpt4o,
  gpt4oMini,
  gpt4,
  gpt4Turbo,
  gpt4oRealtimePreview,
} from "./openai.js";
import prompts from "../configs/prompts.js";
export default async (message) => {
  const prompt = prompts.routing;
  const routingResponse = await gpt35Turbo(prompt);
  return routingResponse + message;
};
