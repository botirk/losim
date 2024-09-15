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

const askQuestion = async <T>(question: string, converter: (answer: string) => T): Promise<T> => {
  if (typeof window === "undefined") {
    const rli = (await import("node:readline/promises")).createInterface(process.stdin, process.stdout);
    const answer = converter(await rli.question(question + "\n"));
    rli.close();
    return answer;
  } else {
    return await new Promise((res) => {
      const questionEl = document.querySelector("#question");
      if (questionEl) questionEl.textContent = question;
      
      const input = document.querySelector("input");
      if (input) {
        const cb = (e) => {
          if (e.key === 'Enter') {
            input.value = "";
            input.removeEventListener("keydown", cb);
            res(converter(input.value));
          }
        }
        input.addEventListener("keydown", cb);
      }
    });
  }
}

const getSetup = async (): Promise<SimulateBestItemsSetup> => {
  const champQ = champions.reduce((prev, cur, i) => prev + `${i} ${new cur().name}\r\n`, "") + "Pick a champion (number or string) Master Yi default";
  const Champion = await askQuestion<new() => Champion>(champQ, (answer) => champions[answer] || champions.find((champ) => new champ().name.toLowerCase() === answer.toLowerCase()) || MasterYi);

  const itemsCount = await askQuestion<number>("Count of items (1-6) 1 default", (a) => {
    let result = parseInt(a);
    if (isNaN(result)) result = 1;
    return Math.max(1, Math.min(6, Math.floor(result)));
  });

  const level = await askQuestion<number>("Select champion level (1-18) 9 default", (a) => {
    let result = parseInt(a);
    if (isNaN(result)) result = 9;
    return Math.max(1, Math.min(18, Math.floor(result)));
  });

  const shouldRunAway = await askQuestion<boolean>("Should dummy run away (y/n) n default", (a) => a[0] === "y" ? true : false);

  return {
    level,
    shouldRunAway,
    Champion,
    itemsCount,
    withBoots: false,
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

