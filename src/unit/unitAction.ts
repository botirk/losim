import { Rejection, WheelItem } from "../defered";
import { Unit } from "./unit";

export class UnitAction {
  constructor(readonly unit: Unit) {}

  private attackAnimationPromise?: WheelItem;
  get isAttacking() { return !!this.attackAnimationPromise; }

  private attackRewindPromise?: WheelItem;
  get isAttackRewind() { return !!this.attackRewindPromise; }

  async waitAttackRewind() {
    try {
      if (this.attackRewindPromise && !this.attackRewindPromise.isProcced) await this.attackRewindPromise;
    } catch {
      
    } finally {
      if (this.attackRewindPromise?.isProcced) this.attackRewindPromise = undefined;
    }
  }
  async attack(target: Unit) {
    if (target.dead) return;
    if (this.isAttackRewind) await this.waitAttackRewind();
    const ownerDeath = this.unit.interaction.onDeath(), targetDeath = target.interaction.onDeath();
    ownerDeath.then(() => this.cancelAttack()).catch(() => {});
    targetDeath.then(() => this.cancelAttack()).catch(() => {});
    try {
      if (this.attackAnimationPromise) {
        await this.attackAnimationPromise;
      } else {
        this.attackAnimationPromise = this.unit.sim.waitFor((1 / this.unit.as) * this.unit.attackAnimation * 1000);
        await this.attackAnimationPromise;
        target.interaction.takeDamage(this.unit.calcRawPhysicHit(this.unit.ad));
        this.attackRewindPromise = this.unit.sim.waitFor((1 / this.unit.as) * (1 - this.unit.attackAnimation) * 1000);
        this.attackRewindPromise.then(() => { this.attackAnimationPromise = undefined }).catch(() => {});
      }
    } catch {
      
    } finally {
      this.attackAnimationPromise = undefined;
      targetDeath.reject(Rejection.RemoveEventListener);
      ownerDeath.reject(Rejection.RemoveEventListener);
    }
  }
  cancelAttack() {
    this.attackAnimationPromise?.reject(Rejection.Canceled);
    this.attackAnimationPromise = undefined;
  }
}