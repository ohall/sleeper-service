// server.js
import express from 'express';
const port = 3000;
import { config } from "dotenv";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import pkg from 'express-oauth2-jwt-bearer';
const { auth, attemptSilentLogin } = pkg;
import logger from "./logger.js";
config();
const app = express();
app.use(express.json());

const jwtCheck = auth({
  audience: 'https://dev-x0mw43xpbysu3ay2.us.auth0.com/api/v2/',
  issuerBaseURL: 'https://dev-x0mw43xpbysu3ay2.us.auth0.com/',
  tokenSigningAlg: 'RS256',
});

const model = new ChatOpenAI({ model: "gpt-3.5-turbo" });

app.post('/prompt', jwtCheck, async (req, res) => {
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