import { Unit } from "./unit";

export class UnitAction {
  constructor(readonly unit: Unit) {}

  async attackAnimation() {
    await this.unit.sim.waitFor((1 / this.unit.as) * this.unit.attackAnimation * 1000);
  }

  async attack(target: Unit) {
    await this.attackAnimation();
    target.health -= this.unit.calcRawPhysicHit(this.unit.ad);
  }
}