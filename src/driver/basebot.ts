import {config} from "../config.js";
import {ContactImpl, ContactInterface, RoomImpl, RoomInterface} from "wechaty/impls";
import {Message} from "wechaty";
import {FileBox} from "file-box";
import {dalle} from "./chatgpt/openai.js";
import {regexpEncode} from "./chatgpt/utils.js";
import {ICommand} from "../iterface/command.js";

enum MessageType {
    Unknown = 0,
    Attachment = 1, // Attach(6),
    Audio = 2, // Audio(1), Voice(34)
    Contact = 3, // ShareCard(42)
    ChatHistory = 4, // ChatHistory(19)
    Emoticon = 5, // Sticker: Emoticon(15), Emoticon(47)
    Image = 6, // Img(2), Image(3)
    Text = 7, // Text(1)
    Location = 8, // Location(48)
    MiniProgram = 9, // MiniProgram(33)
    GroupNote = 10, // GroupNote(53)
    Transfer = 11, // Transfers(2000)
    RedEnvelope = 12, // RedEnvelopes(2001)
    Recalled = 13, // Recalled(10002)
    Url = 14, // Url(5)
    Video = 15, // Video(4), Video(43)
    Post = 16, // Moment, Channel, Tweet, etc
}

const SINGLE_MESSAGE_MAX_SIZE = 500;
type Speaker = RoomImpl | ContactImpl;

export abstract class BaseBot {
    config = config;
    chatPrivateTriggerKeyword = config.chatPrivateTriggerKeyword;
    chatTriggerRule = config.chatTriggerRule ? new RegExp(config.chatTriggerRule) : undefined;
    disableGroupMessage = config.disableGroupMessage || false;
    botName: string = "";
    ready = false;
    protected commands: ICommand[] = [];


    setBotName(botName: string) {
        this.botName = botName;
    }

    get chatGroupTriggerRegEx(): RegExp {
        return new RegExp(`^@${regexpEncode(this.botName)}\\s`);
    }

    get chatPrivateTriggerRule(): RegExp | undefined {
        const {chatPrivateTriggerKeyword, chatTriggerRule} = this;
        let regEx = chatTriggerRule
        if (!regEx && chatPrivateTriggerKeyword) {
            regEx = new RegExp(regexpEncode(chatPrivateTriggerKeyword))
        }
        return regEx
    }

    /**
     * EXAMPLE:
     *       /cmd help
     *       /cmd prompt <PROMPT>
     *       /cmd img <PROMPT>
     *       /cmd clear
     * @param contact
     * @param rawText
     */
    async command(contact: any, rawText: string): Promise<void> {
        const [commandName, ...args] = rawText.split(/\s+/);
        const command = this.commands.find(
            (command) => command.name === commandName
        );
        if (command) {
            await command.exec(contact, args.join(" "));
        }
    }
    // Check whether the ChatGPT processing can be triggered
    triggerGPTMessage(text: string, privateChat: boolean = false): boolean {
        const {chatTriggerRule} = this;
        let triggered = false;
        if (privateChat) {
            const regEx = this.chatPrivateTriggerRule
            triggered = regEx ? regEx.test(text) : true;
        } else {
            triggered = this.chatGroupTriggerRegEx.test(text);
            // group message support `chatTriggerRule`
            if (triggered && chatTriggerRule) {
                triggered = chatTriggerRule.test(text.replace(this.chatGroupTriggerRegEx, ""))
            }
        }
        if (triggered) {
            console.log(`🎯 Triggered ChatGPT: ${text}`);
        }
        return triggered;
    }

    isNonsense(
        talker: ContactInterface,
        messageType: MessageType,
        text: string
    ): boolean {
        return (
            talker.self() ||
            // TODO: add doc support
            !(messageType == MessageType.Text || messageType == MessageType.Audio) ||
            talker.name() === "微信团队" ||
            // 语音(视频)消息
            text.includes("收到一条视频/语音聊天消息，请在手机上查看") ||
            // 红包消息
            text.includes("收到红包，请在手机上查看") ||
            // Transfer message
            text.includes("收到转账，请在手机上查看") ||
            // 位置消息
            text.includes("/cgi-bin/mmwebwx-bin/webwxgetpubliclinkimg") ||
            // 聊天屏蔽词
            this.checkchatBlockWords(text)
        );
    }
    async onMessage(message: Message) {
        const talker = message.talker();
        const rawText = message.text();
        const room = message.room();
        const messageType = message.type();
        const privateChat = !room;
        if (privateChat) {
            console.log(`🤵 Contact: ${talker.name()} 💬 Text: ${rawText}`)
        } else {
            const topic = await room.topic()
            console.log(`🚪 Room: ${topic} 🤵 Contact: ${talker.name()} 💬 Text: ${rawText}`)
        }
        if (this.isNonsense(talker, messageType, rawText)) {
            return;
        }
        if (messageType == MessageType.Audio) {
            // 保存语音文件
            // const fileBox = await message.toFileBox();
            // let fileName = "./public/" + fileBox.name;
            // await fileBox.toFile(fileName, true).catch((e) => {
            //   console.log("保存语音失败",e);
            //   return;
            // });
            // Whisper
            // whisper("",fileName).then((text) => {
            //   message.say(text);
            // })
            return;
        }
        if (rawText.startsWith("/cmd ")) {
            console.log(`🤖 Command: ${rawText}`)
            const cmdContent = rawText.slice(5) // 「/cmd 」一共5个字符(注意空格)
            if (privateChat) {
                await this.command(talker, cmdContent);
            } else {
                await this.command(room, cmdContent);
            }
            return;
        }
        // 使用DallE生成图片
        if (rawText.startsWith("/img")) {
            console.log(`🤖 Image: ${rawText}`)
            const imgContent = rawText.slice(4)
            if (privateChat) {
                let url = await dalle(talker.name(), imgContent) as string;
                const fileBox = FileBox.fromUrl(url)
                message.say(fileBox)
            } else {
                let url = await dalle(await room.topic(), imgContent) as string;
                const fileBox = FileBox.fromUrl(url)
                message.say(fileBox)
            }
            return;
        }
        if (this.triggerGPTMessage(rawText, privateChat)) {
            const text = this.cleanMessage(rawText, privateChat);
            if (privateChat) {
                return await this.onPrivateMessage(talker, text);
            } else {
                if (!this.disableGroupMessage) {
                    return await this.onGroupMessage(talker, text, room);
                } else {
                    return;
                }
            }
        } else {
            return;
        }
    }

    // remove more times conversation and mention
    cleanMessage(rawText: string, privateChat: boolean = false): string {
        let text = rawText;
        const item = rawText.split("- - - - - - - - - - - - - - -");
        if (item.length > 1) {
            text = item[item.length - 1];
        }

        const {chatTriggerRule, chatPrivateTriggerRule} = this;

        if (privateChat && chatPrivateTriggerRule) {
            text = text.replace(chatPrivateTriggerRule, "")
        } else if (!privateChat) {
            text = text.replace(this.chatGroupTriggerRegEx, "")
            text = chatTriggerRule ? text.replace(chatTriggerRule, "") : text
        }
        // remove more text via - - - - - - - - - - - - - - -
        return text
    }

    // Check if the message returned by chatgpt contains masked words]
    checkchatBlockWords(message: string): boolean {
        if (config.chatBlockWords.length == 0) {
            return false;
        }
        return config.chatBlockWords.some((word) => message.includes(word));
    }

    // The message is segmented according to its size
    async trySay(
        talker: RoomInterface | ContactInterface,
        mesasge: string
    ): Promise<void> {
        const messages: Array<string> = [];
        if (this.checkchatBlockWords(mesasge)) {
            console.log(`🚫 Blocked ChatGPT: ${mesasge}`);
            return;
        }
        let message = mesasge;
        while (message.length > SINGLE_MESSAGE_MAX_SIZE) {
            messages.push(message.slice(0, SINGLE_MESSAGE_MAX_SIZE));
            message = message.slice(SINGLE_MESSAGE_MAX_SIZE);
        }
        messages.push(message);
        for (const msg of messages) {
            await talker.say(msg);
        }
    }

    abstract onPrivateMessage(talker: ContactInterface, text: string): Promise<void>;

    abstract onGroupMessage(
        talker: ContactInterface,
        text: string,
        room: RoomInterface
    ): Promise<void>;

}
