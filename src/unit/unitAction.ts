import { Defered, Rejection } from "../defered";
import { Unit } from "./unit";

export class UnitAction {
  constructor(readonly unit: Unit) {}

  private attackAnimationPromise?: Defered;
  get isAttacking() { return !!this.attackAnimationPromise; }

  private attackAnimation() {
    return this.unit.sim.waitFor((1 / this.unit.as) * this.unit.attackAnimation * 1000);
  }
  async attack(target: Unit) {
    try {
      if (this.attackAnimationPromise) {
        await this.attackAnimationPromise;
      } else {
        this.attackAnimationPromise = this.attackAnimation();
        await this.attackAnimationPromise;
        target.interaction.takeDamage(this.unit.calcRawPhysicHit(this.unit.ad));
      }
    } catch {
      
    } finally {
      this.attackAnimationPromise = undefined;
    }
  }
  cancelAttack() {
    this.attackAnimationPromise?.reject(Rejection.Canceled);
    this.attackAnimationPromise = undefined;
  }
}