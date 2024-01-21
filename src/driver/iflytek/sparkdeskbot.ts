import {ContactInterface, RoomInterface} from "wechaty/impls";
import SparkDeskDBUtils from "./data.js";
import {createHash} from 'crypto';
import {BaseBot} from "../basebot.js";

export class SparkDeskBot extends BaseBot {


  async onPrivateMessage(talker: ContactInterface, text: string) {
    const user =  SparkDeskDBUtils.getUserByUsername(createHash('md5').update(talker.id).digest('hex'));
    const response = await  user.speak(text);
    console.log(`prompt_tokens:${response.getPromptTokens()},completion_tokens:${response.getCompletionTokens()},total_tokens:${response.getTotalTokens()}`)
    await this.trySay(talker, response.getAllContent());
  }

  async onGroupMessage(
    talker: ContactInterface,
    text: string,
    room: RoomInterface
  ) {
    const user = SparkDeskDBUtils.getUserByUsername(createHash('md5').update(await room.topic()).digest('hex'));
    const response = await  user.speak(text);
    console.log(`prompt_tokens:${response.getPromptTokens()},completion_tokens:${response.getCompletionTokens()},total_tokens:${response.getTotalTokens()}`)
    const result = `@${talker.name()} ${text}\n\n------\n ${response.getAllContent()}`;
    await this.trySay(room, result);
  }
}
