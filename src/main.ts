import {WechatyBuilder} from "wechaty";
import QRCode from "qrcode";
import {config} from "./config.js";
import {SparkDeskBot} from "./driver/iflytek/sparkdeskbot.js";
import {ChatGPTBot} from "./driver/chatgpt/chatgptbot.js";
import {DriverEnum} from "./enum/driver.js";
import {BaseBot} from "./driver/basebot";

let  messgageBot: BaseBot;


switch (config.driver) {
  case DriverEnum.openai:
    messgageBot = new ChatGPTBot();
    break;
  case DriverEnum.iflytek:
    messgageBot = new SparkDeskBot();
    break;
  default:
    messgageBot = new ChatGPTBot();
    break;
}
const bot =  WechatyBuilder.build({
  name: "wechat-assistant", // generate xxxx.memory-card.json and save login data for the next login
  puppet: "wechaty-puppet-wechat",
  puppetOptions: {
    uos: true
  }
});
async function main() {

  const initializedAt = Date.now()
  bot
    .on("scan", async (qrcode, status) => {
      const url = `https://wechaty.js.org/qrcode/${encodeURIComponent(qrcode)}`;
      console.log(`Scan QR Code to login: ${status}\n${url}`);
      console.log(
        await QRCode.toString(qrcode, { type: "terminal", small: true })
      );
    })
    .on("login", async (user) => {
      messgageBot.setBotName(user.name());
      console.log(`User ${user} logged in`);
      console.log(`私聊触发关键词: ${config.chatPrivateTriggerKeyword}`);
      console.log(`已设置 ${config.blockWords.length} 个聊天关键词屏蔽. ${config.blockWords}`);
    })
    .on("message", async (message) => {
      if (message.date().getTime() < initializedAt) {
        return;
      }
      if (message.text().startsWith("/ping")) {
        await message.say("pong");
        return;
      }
      try {
        await messgageBot.onMessage(message);
      } catch (e) {
        console.error(e);
      }
    });
  try {
    await bot.start();
  } catch (e) {
    console.error(
      `⚠️ Bot start failed, can you log in through wechat on the web?: ${e}`
    );
  }
}
main();
