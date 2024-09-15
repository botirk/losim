import { Unit } from "../../unit/unit";
import { Action, TargetCast } from "../../unit/action";
import { Buff } from "../../unit/buff";
import { DamageType } from "../../unit/unitInteraction";

export class MasterYiQMark extends Buff {
  damage = MasterYiQ.markDamage(this.src, this.level);

  constructor(owner: Unit, src: Unit, readonly level: number) {
    level = Math.max(0, Math.min(5, level));
    super(MasterYiQ.qname, owner, false, src);
  }

  fade(): void {
    if (!this.isActive) return;
    if (this.owner.targetable) {
      if (this.owner.buffsNamed(MasterYiQ.qname).length === 1) {
        this.owner.interaction.takeDamage({ src: this.src, type: DamageType.PHYSIC, value: this.damage });
        this.src.action.attack.procOnHitUnit(this.owner, 0.75);
      } else {
        this.owner.interaction.takeDamage({ src: this.src, type: DamageType.PHYSIC, value: this.damage * 0.25 });
        this.src.action.attack.procOnHitUnit(this.owner, 0.1875);
      }
    }
    super.fade();
  }
}

export class MasterYiQCast extends TargetCast {
  protected async onStartCast() {
    this.action.owner.targetable = false;

    const marks: MasterYiQMark[] = [];
    for (let time = 0; time < MasterYiQ.markTime * 4; time += MasterYiQ.markTime) {
      const result = await Promise.any([ this.wait(), this.action.owner.sim.waitFor(MasterYiQ.markTime) ]);
      if (result) {
        marks.push(new MasterYiQMark(this.option, this.action.owner, this.action.level));
      } else {
        break;
      }
    }
    // final wait become targetable
    this.action.owner.targetable = true;
    // proc wait - when alive
    if (!this.action.owner.dead && this.option.targetable) await this.action.owner.sim.waitFor(MasterYiQ.markProcTime);
    // proc
    for (const mark of marks) mark.fade();
  }
}

export class MasterYiQ extends Action<Unit> {
  constructor(unit: Unit) {
    super(MasterYiQ.qname, unit);
  }

  static readonly qname = "Alpha Strike";
  readonly maxLevel: number = 5;
  readonly minLevel: number = 1;
  readonly isCancelableByUser: boolean = false;
  readonly isCooldownFinishedOnInterrupt: boolean = false;

  get castTime(): number {
    if (this.level === 0) return 0;
    return MasterYiQ.markTime * 4 + MasterYiQ.markProcTime + 1;
  }
  get cooldownTime(): number {
    if (this.level === 0) return 0;
    return 20500 - this.level * 500;
  }

  static markDamage(owner: Unit, level: number) {
    return level * 30 + owner.ad * 0.5;
  }
  static markTime = 231;
  static markProcTime = 164;

  async cast(option: Unit) {
    return await new MasterYiQCast(this, option).init();
  }
}
