import {ContactImpl, RoomImpl} from "wechaty/dist/esm/src/mods/impls";

type Speaker = RoomImpl | ContactImpl;

export interface ICommand {
    name: string;
    description: string;
    exec: (talker: Speaker, text: string) => Promise<void>;
}