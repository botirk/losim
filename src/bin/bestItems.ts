import { champions } from "../champions/champions";
import { Champion } from "../champions/champion/champion";
import { MasterYi } from "../champions/MasterYi/MasterYi";
import { BestEquipsConfig, simulateBestNextSetup } from "../simulation/simulateEquips";

interface SimulateBestItemsSetup {
  withBoots: boolean,
  config: BestEquipsConfig<Champion>,
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
            input.removeEventListener("keydown", cb);
            res(converter(input.value));
            input.value = "";
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

  const config = new BestEquipsConfig();

  config.count = await askQuestion<number>("Count of items (1-6) 1 default", (a) => {
    let result = parseInt(a);
    if (isNaN(result)) result = 1;
    return Math.max(1, Math.min(6, Math.floor(result)));
  });

  const level = await askQuestion<number>("Select champion level (1-18) 9 default", (a) => {
    let result = parseInt(a);
    if (isNaN(result)) result = 9;
    return Math.max(1, Math.min(18, Math.floor(result)));
  });

  config.champ1 = (sim) => {
    const champ = new Champion();
    champ.level = level;
    champ.init(sim);
    champ.levelUp();
    return champ;
  }

  config.sustain1 = await askQuestion<boolean>("Should test sustain (y/n) y default", (a) => a[0] === "n" ? false : true);
  if (config.sustain1) config.undying2 = true;

  config.dummyRunsAway = await askQuestion<boolean>("Should dummy run away (y/n) y default", (a) => a[0] === "n" ? false : true);

  return {
    withBoots: false,
    config,
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

  writeResult("Simulation in progress...\r\n");

  const result = await simulateBestNextSetup(setup.config);

  let resultStr = "";
  if (result.length > 0) {
    for (let i = 0; i < 10 && i < result.length; i += 1) {
      if (result[i].keystone) resultStr += `keystone: '${result[i].keystone.name}' `;
      for (const itemn in result[i].items) {
        resultStr += `item${Number(itemn) + 1}: '${result[i].items[itemn].name}' `;;
      }
      if (setup.config.sustain1) resultStr += `damage: ${result[i].result.damage1.toFixed(2)} sustained: ${(result[i].result.ttk / 1000).toFixed(2)}\r\n\r\n`;
      else resultStr += `timetokill: ${(result[i].result.ttk / 1000).toFixed(2)} dps: ${result[i].result.dps1.toFixed(2)}\r\n\r\n`;
    }
    
  } else {
    resultStr += `Simulation failed, no items simulated\r\n`;
  }

  writeResult(resultStr);
})();

