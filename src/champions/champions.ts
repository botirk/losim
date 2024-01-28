import { MasterYi } from "./MasterYi/MasterYi";
import { Nunu } from "./Nunu/Nunu";
import { Champion } from "./champion/champion";

export const champions: (new () => Champion)[] = [
  MasterYi,
  Nunu,
];