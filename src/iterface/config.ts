import {DriverEnum} from "../enum/driver.js";

export interface Config{
    chatTriggerRule: string;
    disableGroupMessage: boolean;
    blockWords: string[];
    chatBlockWords: string[];
    chatPrivateTriggerKeyword: string;

    //定义一个枚举变量 用来表示驱动类型
    driver: DriverEnum;
}