import { champions } from "../champions/champions";
import { simulateBestNextItems } from "../simulation/simulateBestItems";
import { Champion } from "../champions/champion/champion";
import { MasterYi } from "../champions/MasterYi/MasterYi";

interface SimulateBestItemsSetup {
  Champion: new() => Champion,
  itemsCount: number,
  level: number,
  shouldRunAway: boolean,
  withBoots: boolean,
}

const getSetupNode = async (): Promise<SimulateBestItemsSetup> => {
  if (typeof require !== undefined) {
    const rli = require("node:readline/promises").createInterface(process.stdin, process.stdout);

    for (const i in champions) rli.write(`${i} ${new champions[i]().name}\n`);
    const champName = await rli.question("Pick a champion (number or string) Master Yi default\n");
    const Champion: new() => Champion = champions[champName] || champions.find((champ) => new champ().name.toLowerCase() === champName.toLowerCase()) || MasterYi;

    let itemsCount = parseInt(await rli.question("Count of items (1-6) 1 default\n"));
    if (isNaN(itemsCount)) itemsCount = 1;
    itemsCount = Math.max(1, Math.min(6, Math.floor(itemsCount)));

    let level = parseInt(await rli.question("Select champion level (1-18) 9 default\n"));
    if (isNaN( level))  level = 9;
    level = Math.max(1, Math.min(18, Math.floor(level)));

    const shouldRunAway = (await rli.question("Should dummy run away (y/n) n default\n"))[0] === "y" ? true : false;

    rli.close();

    return {
      level,
      shouldRunAway,
      Champion,
      itemsCount,
      withBoots: false,
    }
  }
}

const getSetupBrowser = (): SimulateBestItemsSetup => {
  let champNames = champions.reduce((prev, cur, i) => prev + `${i} ${new cur().name}\n`, "");
  const champName = prompt(champNames + "Pick a champion (number or string) Master Yi default");
  const Champion: new() => Champion = champions[champName] || champions.find((champ) => new champ().name.toLowerCase() === champName.toLowerCase()) || MasterYi;

  let itemsCount = parseInt(prompt("Count of items (1-6) 1 default\n"));
  if (isNaN(itemsCount)) itemsCount = 1;
  itemsCount = Math.max(1, Math.min(6, Math.floor(itemsCount)));

  let level = parseInt(prompt("Select champion level (1-18) 9 default\n"));
  if (isNaN( level))  level = 9;
  level = Math.max(1, Math.min(18, Math.floor(level)));

  const shouldRunAway = (prompt("Should dummy run away (y/n) n default\n"))[0] === "y" ? true : false;

  return {
    level,
    shouldRunAway,
    Champion,
    itemsCount,
    withBoots: false,
  }
}

const getSetup = async (): Promise<SimulateBestItemsSetup> => {
  if (typeof window !== 'undefined') {
    return getSetupBrowser();
  } else {
    return await getSetupNode();
  }
}

const writeResult = (str: string) => {
  if (typeof window !== 'undefined') {
    document.body.innerText = str;
  } else {
    console.log(str);
  }
}

(async () => {
  const setup = await getSetup();

  const result = await simulateBestNextItems((sim) => {
    const champ = new setup.Champion();
    champ.level = setup.level;
    champ.init(sim);
    champ.levelUp();
    return champ;
  }, setup.itemsCount, setup.shouldRunAway);

  let resultStr = "";
  if (result.length > 0) {
    for (const subresult of result) {
      for (const itemn in subresult.items) {
        resultStr += `item${Number(itemn) + 1}: '${subresult.items[itemn].name}' `;;
      }
      resultStr += `timetokill: ${(subresult.result.ttk / 1000).toFixed(2)} dps: ${subresult.result.dps1.toFixed(2)}\r\n`;
    }
  } else {
    resultStr += `Simulation failed, no items simulated\r\n`;
  }

  writeResult(resultStr);
})();

