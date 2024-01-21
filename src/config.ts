import * as dotenv from "dotenv";
import {Config} from "./iterface/config.js";
import {DriverEnum} from "./enum/driver.js";
dotenv.config();

let dirver: DriverEnum;
switch (process.env.DRIVER) {
  case DriverEnum.openai:
    dirver = DriverEnum.openai;
    break;
  case DriverEnum.iflytek:
    dirver = DriverEnum.iflytek;
    break;
  default:
    dirver = DriverEnum.openai;
}
export const config: Config = {
  chatPrivateTriggerKeyword: process.env.CHAT_PRIVATE_TRIGGER_KEYWORD || "",
  chatTriggerRule: process.env.CHAT_TRIGGER_RULE || "",
  disableGroupMessage: process.env.DISABLE_GROUP_MESSAGE === "true",
  blockWords: process.env.BLOCK_WORDS?.split(",") || [],
  chatBlockWords: process.env.CHAT_BLOCK_WORDS?.split(",") || [],
  //帮我初始化 driver
  driver: dirver,
};
