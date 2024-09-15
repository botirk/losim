import { MasterYi } from "../../champions/MasterYi/MasterYi";
import { Simulation } from "../../simulation/simulation";
import { Action, AnyCast, EnemyTargetAction } from "./action";

export const selfActionManaTest = (name: string, getAction: (sim: Simulation) => Action<void, AnyCast>) => {
  test(`${name} selfActionManaTest`, async () => {
    const sim = new Simulation().start(5000);
    const action = getAction(sim);
    action.level = action.minLevel;
    action.owner.mana = 0;
    expect(await action.cast()).toBe(false);

    action.owner.mana = 10000;
    expect(await action.cast()).toBe(true);
    expect(action.owner.mana).toBeLessThan(10000);
  });
}

export const selfActionLevelTest = (name: string, getAction: (sim: Simulation) => Action<void, AnyCast>) => {
  test(`${name} selfActionLevelTest`, async () => {
    const sim = new Simulation().start(5000);
    const enemy = new MasterYi().init(sim);
    const action = getAction(sim);

    action.level = action.minLevel - 1;
    expect(await action.cast()).toBe(false);
    expect(action.isCooldown).toBe(false);

    action.level = action.minLevel;
    const cast = action.cast();
    expect(action.isCooldown).toBe(true);
    expect(await cast).toBe(true);
  });
}

export const enemyActionManaTest = (name: string, getAction: (sim: Simulation) => EnemyTargetAction<AnyCast>) => {
  test(`${name} enemyActionManaTest`, async () => {
    const sim = new Simulation().start(5000);
    const enemy = new MasterYi().init(sim);
    const action = getAction(sim);
    action.level = action.minLevel;
    action.owner.mana = 0;
    expect(await action.cast(enemy)).toBe(false);

    action.owner.mana = 10000;
    expect(await action.cast(enemy)).toBe(true);
    expect(action.owner.mana).toBeLessThan(10000);
  });
}

export const enemyActionLevelTest = (name: string, getAction: (sim: Simulation) => EnemyTargetAction<AnyCast>) => {
  test(`${name} enemyActionLevelTest`, async () => {
    const sim = new Simulation().start(5000);
    const enemy = new MasterYi().init(sim);
    const action = getAction(sim);

    action.level = action.minLevel - 1;
    expect(await action.cast(enemy)).toBe(false);
    expect(action.isCooldown).toBe(false);

    action.level = action.minLevel;
    const cast = action.cast(enemy);
    expect(action.isCooldown).toBe(true);
    expect(await cast).toBe(true);
  });
}

export const enemyActionTargetableTest = (name: string, getAction: (sim: Simulation) => EnemyTargetAction<AnyCast>) => {
  test(`${name} enemyActionTargetableTest`, async () => {
    const sim = new Simulation().start(5000);
    const enemy = new MasterYi().init(sim);
    const action = getAction(sim);
    action.level = action.minLevel;

    enemy.targetable = false;
    expect(await action.cast(enemy)).toBe(false);
    expect(action.isCooldown).toBe(false);

    enemy.targetable = true;
    const cast = action.cast(enemy);
    expect(action.isCooldown).toBe(true);
    expect(await cast).toBe(true);
  });
}
