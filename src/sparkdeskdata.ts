import {ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum} from "openai";
import {User} from "./driver/iflytek/user.js";
import { sparkDeskConfig } from "./sparkdeskconfig.js";
import {SparkDesk, TextValue} from "./driver/iflytek/index.js";

/**
 * 使用内存作为数据库
 */

class SparkDeskDB {
    private static data: User[] = [];

    private sparkDesk = new SparkDesk(sparkDeskConfig);


    /**
     * 添加一个用户, 如果用户已存在则返回已存在的用户
     * @param username
     */
    public addUser(username: string): User {
        let existUser = SparkDeskDB.data.find((user) => user.uid === username);
        if (existUser) {
            console.log(`用户${username}已存在`);
            return existUser;
        }
        const user = new User(this.sparkDesk, username , this.sparkDesk.tokenLength);

        SparkDeskDB.data.push(user);
        return user;
    }

    /**
     * 根据用户名获取用户, 如果用户不存在则添加用户
     * @param username
     */
    public getUserByUsername(username: string): User {
        return SparkDeskDB.data.find((user) => user.uid === username) || this.addUser(username);
    }

    /**
     * 获取用户的聊天记录
     * @param username
     */
    public getChatMessage(username: string): Array<TextValue> {
        return this.getUserByUsername(username).getHistory();
    }

    /**
     * 设置用户的prompt
     * @param username
     * @param prompt
     */
    public setPrompt(username: string, prompt: string): void {
        const user = this.getUserByUsername(username);
        // if (user) {
        //     user.chatMessage.find(
        //         (msg) => msg.role === ChatCompletionRequestMessageRoleEnum.System
        //     )!.content = prompt;
        // }
    }

    /**
     * 添加用户输入的消息
     * @param username
     * @param message
     */
    public addUserMessage(username: string, message: string): void {
        // const user = this.getUserByUsername(username);
        // if (user) {
        //     while (isTokenOverLimit(user.chatMessage)) {
        //         // 删除从第2条开始的消息(因为第一条是prompt)
        //         user.chatMessage.splice(1, 1);
        //     }
        //     user.chatMessage.push({
        //         role: ChatCompletionRequestMessageRoleEnum.User,
        //         content: message,
        //     });
        // }
    }

    /**
     * 添加ChatGPT的回复
     * @param username
     * @param message
     */
    public addAssistantMessage(username: string, message: string): void {
        // const user = this.getUserByUsername(username);
        // if (user) {
        //     while (isTokenOverLimit(user.chatMessage)) {
        //         // 删除从第2条开始的消息(因为第一条是prompt)
        //         user.chatMessage.splice(1, 1);
        //     }
        //     user.chatMessage.push({
        //         role: ChatCompletionRequestMessageRoleEnum.Assistant,
        //         content: message,
        //     });
        // }
    }

    /**
     * 清空用户的聊天记录, 并将prompt设置为默认值
     * @param username
     */
    public clearHistory(username: string): void {
        // const user = this.getUserByUsername(username);
        // if (user) {
        //     user.chatMessage = [
        //         {
        //             role: ChatCompletionRequestMessageRoleEnum.System,
        //             content: "You are a helpful assistant."
        //         }
        //     ];
        // }
    }

    public getAllData(): User[] {
        return SparkDeskDB.data;
    }
}

const SparkDeskDBUtils = new SparkDeskDB();
export default SparkDeskDBUtils;