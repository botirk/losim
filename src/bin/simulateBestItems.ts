import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { champions } from "../champions/champions";
import { simulateBestNextItem, simulateBestBoot, simulateBestNextItems } from "../simulation/simulateBestItems";
import { Champion } from "../champions/champion/champion";
import { MasterYi } from "../champions/MasterYi/MasterYi";

const rli = readline.createInterface(stdin, stdout);

(async () => {
  for (const i in champions) rli.write(`${i} ${new champions[i]().name}\n`);
  const champName = await rli.question("Pick a champion (number or string) Master Yi default\n");
  const Champion = champions[champName] || champions.find((champ) => new champ().name.toLowerCase() === champName.toLowerCase()) || MasterYi;

  const countItemsStr = await rli.question("Count of items (1-6) 1 default\n");
  let parsedCountItemsStr = Number(countItemsStr);
  if (isNaN(parsedCountItemsStr)) parsedCountItemsStr = 1;
  const countItems = Math.max(1, Math.min(6, Math.floor(parsedCountItemsStr)));

  const levelStr = await rli.question("Select champion level (1-18) 9 default\n");
  let parsedLevelStr = Number(levelStr);
  if (isNaN(parsedLevelStr)) parsedLevelStr = 10;
  const level = Math.max(1, Math.min(18, Math.floor(parsedLevelStr)));

  const shouldRunAway = (await rli.question("Should dummy run away (y/n) n default\n"))[0] === "y" ? true : false;

  //const withBoots = (await rli.question("Find best boots (y/n) n default\n"))[0] === "y" ? true : false;

  const result = await simulateBestNextItems((sim) => {
    const champ = new Champion();
    champ.level = level;
    champ.init(sim);
    return champ;
  }, countItems, shouldRunAway);

  if (result.length > 0) {
    for (const subresult of result) {
      for (const itemn in subresult.items) {
        rli.write(`item${Number(itemn) + 1}: '${subresult.items[itemn].name}' `);
      }
      rli.write(`timetokill: ${(subresult.result.ttk / 1000).toFixed(2)} dps: ${subresult.result.dps1.toFixed(2)}\n`);
    }
  } else {
    rli.write(`Simulation failed, no items simulated\n`);
  }

  rli.close();
})();

