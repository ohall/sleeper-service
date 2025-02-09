// server.js
import express from "express";
const port = process.env.PORT || 3000;
import { stopSlack, startSlack } from "./src/slackbot.js";
import { config } from "dotenv";
import pkg from "express-oauth2-jwt-bearer";
const { auth } = pkg;
import logger from "./src/logger.js";
import { gpt35Turbo } from "./src/openai.js";
import { scheduleMenu } from "./src/menu.js";
import scheduleEducationalContent from "./src/school.js";
import { connect, disconnect } from "./src/services/db.js";
config();
const app = express();
app.use(express.json());
connect();
scheduleMenu();
startSlack();
scheduleEducationalContent();

const jwtCheck = auth({
  audience: "https://dev-x0mw43xpbysu3ay2.us.auth0.com/api/v2/",
  issuerBaseURL: "https://dev-x0mw43xpbysu3ay2.us.auth0.com/",
  tokenSigningAlg: "RS256",
});

app.post("/prompt", jwtCheck, async (req, res) => {
  const response = await gpt35Turbo(
    req.body?.system || "You are a helpful assistant.",
    req.body?.user || "No prompt provided.",
  );
  res.send(response);
});

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});

process.on("SIGTERM", async () => {
  try {
    await stopSlack();
    await disconnect();
    process.exit(0);
  } catch (error) {
    logger.error("Error stopping app:", error);
    process.exit(1);
  }
});
