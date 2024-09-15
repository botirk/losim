import { StackBuff } from "../../unit/buff";
import { Item } from "../../unit/equip";
import { Unit } from "../../unit/unit";
import { DamageType } from "../../unit/unitInteraction";

export class GuinsooBuff extends StackBuff {
  static duration = 3000;
  static phantomDuration = 3000;
  static maxStacks = 4;
  static bonusAsPerStack = 8;

  protected readonly maxStacks: number = GuinsooBuff.maxStacks;

  constructor(owner: Unit) {
    super(guinsoo.name, owner, GuinsooBuff.duration, true);
  }

  protected onLoseStats(): void {
    this.owner.bonusAs.value -= this.stacks * GuinsooBuff.bonusAsPerStack;
  }
  protected onGainStats(): void {
    this.owner.bonusAs.value += this.stacks * GuinsooBuff.bonusAsPerStack;
  }
}

export class GuinsooPhantomBuff extends StackBuff {
  static pname = GuinsooBuff.name + "Phantom";
  static duration = 6000;
  static pause = 150;

  protected readonly maxStacks: number = 2;

  constructor(owner: Unit) {
    super(GuinsooPhantomBuff.pname, owner, GuinsooPhantomBuff.duration, true);
  }
}

export const guinsoo: Item = {
  name: "Guinsoo's Rageblade",
  unique: true,
  type: "item",
  isFinished: true,
  bonusAd: 30,
  bonusAs: 25,
  // TODO: AP
  apply: (unit) => {
    unit.action.attack.onHitUnit((t, m) => t.interaction.takeDamage({ src: unit, type: DamageType.MAGIC, value: 30 * m }));
    unit.action.attack.onCast((t) => {
      const buff = unit.buffNamed(guinsoo.name);
      if (!(buff instanceof GuinsooBuff)) {
        new GuinsooBuff(unit);
      } else {
        if (buff.isMaxStacks) {
          const pbuff = unit.buffNamed(GuinsooPhantomBuff.pname);
          if (!(pbuff instanceof GuinsooPhantomBuff)) {
            new GuinsooPhantomBuff(unit);
          } else {
            if (pbuff.isMaxStacks) {
              unit.sim.waitFor(GuinsooPhantomBuff.pause).then(() => {
                if (!unit.dead.value && t.targetable.value) unit.action.attack.procOnHitUnit(t, 1);
              });
              pbuff.fade();
            } else {
              pbuff.stack();
            }
          }
        }
        buff.stack();
      }
    });
  },
}