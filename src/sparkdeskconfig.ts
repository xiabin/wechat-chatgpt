import * as dotenv from "dotenv";
import {SparkDeskOption} from "./driver/iflytek";
import {IConfig} from "./interface";

dotenv.config();

export const sparkDeskConfig: SparkDeskOption = {
    APIKey: process.env.IFLYTEK_SPARK_APIKEY || '',
    APISecret: process.env.IFLYTEK_SPARK_APISECRET || '',
    APPID: process.env.IFLYTEK_SPARK_APPID || '',
    version: process.env.IFLYTEK_SPARK_VERSION ? parseInt(process.env.IFLYTEK_SPARK_VERSION, 10) as 1 | 2 | 3 : 3,
    tokenLength : process.env.IFLYTEK_SPARK_TOKENLENGTH ? parseInt(process.env.IFLYTEK_SPARK_TOKENLENGTH, 10) : 64
}