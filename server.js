// server.js
import express from 'express';
const port = process.env.EXPRESS_PORT || 3000;
import { config } from "dotenv";
import pkg from 'express-oauth2-jwt-bearer';
const { auth } = pkg;
import logger from "./src/logger.js";
import { startSlack, stopSlack } from "./src/slackbot.js";
import openai from "./scripts/prompt.js";
config();
const app = express();
app.use(express.json());
startSlack();

const jwtCheck = auth({
  audience: 'https://dev-x0mw43xpbysu3ay2.us.auth0.com/api/v2/',
  issuerBaseURL: 'https://dev-x0mw43xpbysu3ay2.us.auth0.com/',
  tokenSigningAlg: 'RS256',
});


app.post('/prompt', jwtCheck, async (req, res) => {
  const response = await openai(req.body?.system || "You are a helpful assistant.", 
    req.body?.user || "No prompt provided.");
  res.send(response);
});

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});

process.on('SIGTERM', async () => {
  try {
    await stopSlack();
    process.exit(0);
  } catch (error) {
    logger.error('Error stopping app:', error);
    process.exit(1);
  }
});