// server.js
import express from 'express';
const app = express();
const port = 3000;
import { config } from "dotenv";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
const model = new ChatOpenAI({ model: "gpt-3.5-turbo" });

config();

app.get('/prompt', async (req, res) => {
  const messages = [
    new SystemMessage("Translate the following from English into Italian"),
    new HumanMessage(req.query.prompt),  
  ];
  const response = await model.invoke(messages);
  res.send(response.content);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});