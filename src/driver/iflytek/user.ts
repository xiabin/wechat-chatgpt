import {OnMessage, SparkDesk} from "./SparkDesk.js";
import {TextValue} from "./payload.js";
import {Parameter} from "./parameter.js";
import {Response} from './response.js'
import {ASSISTANT, USER} from "./role.js";


export class User {

    /**
     * 历史问答信息
     * @protected
     */
    protected history: Array<TextValue> = []

    /**
     *
     * @param spark
     * @param uid 用户ID
     * @param tokenLength history 的长度，只计算 content 字段的累计值. max 8192
     */
    constructor(protected spark: SparkDesk, public uid: string, public tokenLength: number = 1024) {

    }

    /**
     * 向星火大模型提出问题
     */
    public async speak(content: string, parameter?: Parameter): Promise<Response>
    public async speak(content: string, parameter: Parameter, onMessage?: OnMessage): Promise<Response>
    public async speak(content: string, parameter: Parameter = Parameter.createFromVersion(this.spark.version), onMessage?: OnMessage): Promise<Response> {

        if (content.length <= 0) {
            throw new Error("内容不可以为空.")
        }

        const response = await this.spark.request({
            header: {
                app_id: this.spark.APPID,
                uid: this.uid
            },
            parameter: parameter.toValue(),
            payload: {
                message: {
                    text: [
                        ...this.getHistory(),
                        {role: USER, content: content}
                    ]
                }
            }
        }, 60E3, onMessage)


        this.history.push({role: USER, content: content});
        this.history.push({role: ASSISTANT, content: response.getAllContent()});

        return response;
    }

    public getHistory(length: number = this.tokenLength): Array<TextValue> {
        const returnValue: Array<TextValue> = [];
        const currentLength = 0;
        for (let textValue of this.history) {
            if (currentLength + textValue.content.length <= length) {
                returnValue.push(textValue);
            } else {
                return returnValue;
            }
        }
        return returnValue;
    }

}