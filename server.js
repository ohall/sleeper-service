// server.js
import express from 'express';
const app = express();
app.use(express.json());
const port = 3000;
import { config } from "dotenv";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import logger from "./logger.js";

const model = new ChatOpenAI({ model: "gpt-3.5-turbo" });

config();

app.post('/prompt', async (req, res) => {
  const messages = [
    new SystemMessage(req.body?.system || "You are helping to debug an http request."),
    new HumanMessage(req.body?.user || "No prompt provided."),  
  ];
  logger.info(`Request: ${JSON.stringify(req.body)}`);
  const response = await model.invoke(messages);
  logger.info(`Response: ${response.content}`);
  res.send(response.content);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});