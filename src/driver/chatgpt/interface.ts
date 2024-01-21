import {ChatCompletionRequestMessage} from "openai";
import {Config} from "../../iterface/config";

export interface IConfig extends Config{
  api?: string;
  openai_api_key: string;
  model: string;
  chatTriggerRule: string;
  disableGroupMessage: boolean;
  temperature: number;
  blockWords: string[];
  chatBlockWords: string[];
  chatPrivateTriggerKeyword: string;
}
export interface User {
  username: string,
  chatMessage: Array<ChatCompletionRequestMessage>,
}