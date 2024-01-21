import {BaseBot} from "./../basebot.js";
import {ICommand} from "../../iterface/command.js";
import DBUtils from "./data.js";
import {chatgpt} from "./openai.js";
import {RoomImpl} from "wechaty/dist/esm/src/mods/impls";
import {ContactInterface, RoomInterface} from "wechaty/impls";



export class ChatGPTBot extends BaseBot {

    constructor() {
        super();
        this.commands =[];

    }

    async getGPTMessage(talkerName: string, text: string): Promise<string> {
        let gptMessage = await chatgpt(talkerName, text);
        if (gptMessage !== "") {
            DBUtils.addAssistantMessage(talkerName, gptMessage);
            return gptMessage;
        }
        return "Sorry, please try again later. 😔";
    }





    // Check whether the message contains the blocked words. if so, the message will be ignored. if so, return true

    // Filter out the message that does not need to be processed


    async onPrivateMessage(talker: ContactInterface, text: string) {
        // const gptMessage = await this.getGPTMessage(talker.name(), text);
        // await this.trySay(talker, gptMessage);
    }
    async onGroupMessage(
        talker: ContactInterface,
        text: string,
        room: RoomInterface
    ) {
        // const gptMessage = await this.getGPTMessage(await room.topic(), text);
        // const result = `@${talker.name()} ${text}\n\n------\n ${gptMessage}`;
        // await this.trySay(room, result);
    }


}
