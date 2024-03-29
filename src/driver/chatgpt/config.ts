import * as dotenv from "dotenv";
dotenv.config();
import { IConfig } from "./interface.js";
import {DriverEnum} from "../../enum/driver.js";

export const config: IConfig = {
  driver: DriverEnum[DriverEnum.openai],
  api: process.env.API,
  openai_api_key: process.env.OPENAI_API_KEY || "123456789",
  model: process.env.MODEL || "gpt-3.5-turbo",
  chatPrivateTriggerKeyword: process.env.CHAT_PRIVATE_TRIGGER_KEYWORD || "",
  chatTriggerRule: process.env.CHAT_TRIGGER_RULE || "",
  disableGroupMessage: process.env.DISABLE_GROUP_MESSAGE === "true",
  temperature: process.env.TEMPERATURE ? parseFloat(process.env.TEMPERATURE) : 0.6,
  blockWords: process.env.BLOCK_WORDS?.split(",") || [],
  chatBlockWords: process.env.CHATGPT_BLOCK_WORDS?.split(",") || []
};
