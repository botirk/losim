import fs from "node:fs/promises";
import { createTree } from "./ttt/bot/index.ts";

await fs.writeFile('ttt/bot/createTree.json', JSON.stringify(createTree(undefined, 1)))

