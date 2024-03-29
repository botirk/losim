import seedrandom from "seedrandom";
import { Unit } from "../../unit/unit";
import { EnemyTargetAction, TargetCast } from "../../unit/action/action";
import { Buff } from "../../unit/buff";
import { DamageType } from "../../unit/unitInteraction";


export class MasterYiQMark extends Buff {
  level: number;
  damage: number;
  critDamage: number;

  constructor(owner: Unit, action: MasterYiQ, private readonly random: seedrandom.PRNG) {
    super(MasterYiQ.qname, owner, false, action.owner);
    this.level = action.level;
    this.damage = MasterYiQ.markDamage(this.src, this.level);
    this.critDamage = MasterYiQ.markCritDamage(this.src, this.level);
  }

  fade(): void {
    if (!this.isActive) return;
    if (this.owner.targetable.value) {
      const isCrit = (this.src.crit >= (this.random() * 100));
      const damage = (isCrit) ? this.damage + this.critDamage : this.damage;
      const modifier = (this.owner.buffsNamed(MasterYiQ.qname).length > 1) ? 0.25 : 1;
      
      this.owner.interaction.takeDamage({ src: this.src, type: DamageType.PHYSIC, value: damage * modifier, isCrit });
      this.src.action.attack.procOnHitUnit(this.owner, 0.75 * modifier);
    }
    super.fade();
  }
}

export class MasterYiQCast extends TargetCast<MasterYiQ> {
  constructor(action: MasterYiQ, option: Unit, private readonly random: seedrandom.PRNG) {
    super(action, option)
  }
  protected async onStartCast() {
    this.action.owner.targetable.value = false;

    const marks: MasterYiQMark[] = [];
    for (let time = 0; time < MasterYiQ.markTime * 4; time += MasterYiQ.markTime) {
      const result = await Promise.any([ this.wait(), this.action.owner.sim.waitFor(MasterYiQ.markTime) ]);
      if (result) {
        let nextTarget = this.option;
        if (nextTarget.buffNamed(MasterYiQ.qname)) {
          const potentialNextTarget = this.action.owner.sim.units.filter((u) => u !== nextTarget && this.action.targetable(u) && !u.buffNamed(MasterYiQ.qname))[0];
          if (potentialNextTarget) nextTarget = potentialNextTarget;
        }
        marks.push(new MasterYiQMark(nextTarget, this.action, this.random));
      } else {
        break;
      }
    }
    // appear near target
    if (this.action.owner.pos <= this.option.pos) this.action.owner.pos = this.option.pos - MasterYiQ.appearDistance; else this.action.owner.pos = this.option.pos + MasterYiQ.appearDistance;
    // final wait become targetable
    this.action.owner.targetable.value = true;
    // proc wait - when alive
    if (!this.action.owner.dead.value && this.option.targetable.value) await this.action.owner.sim.waitFor(MasterYiQ.markProcTime);
    // proc
    for (const mark of marks) mark.fade();
  }
}

export class MasterYiQ extends EnemyTargetAction<MasterYiQCast> {
  static readonly qname = "Alpha Strike";
  static markDamage(owner: Unit, level: number) {
    return level * 30 + owner.ad * 0.5;
  }
  static markCritDamage(owner: Unit, level: number) {
    return (10.5 * level + owner.ad * 0.175) * (1 + owner.bonusCritDamage / 100);
  }
  static readonly markTime = 231;
  static readonly markProcTime = 164;
  static readonly appearDistance = 75;

  constructor(unit: Unit) {
    super(MasterYiQ.qname, unit);
    unit.action.attack.onCast(() => this.remainingCooldown -= 1000 * unit.abilityHasteModifier);
  }

  
  readonly maxLevel: number = 5;
  readonly minLevel: number = 1;
  readonly isCancelableByUser: boolean = false;
  readonly isCooldownFinishedOnInterrupt: boolean = false;
  readonly isUltimate: boolean = false;

  get maxRange(): number {
    return 600;
  }
  get manaCost(): number {
    if (this.level === 0) return 0;
    return 45 + this.level * 5;
  }

  get castTime(): number {
    if (this.level === 0) return 0;
    return MasterYiQ.markTime * 4 + MasterYiQ.markProcTime + 1;
  }
  get cooldownTime(): number {
    if (this.level === 0) return 0;
    return (20500 - this.level * 500) * this.owner.abilityHasteModifier * this.abilityHasteModifier;
  }

  random: seedrandom.PRNG = seedrandom();
  async cast(option: Unit) {
    return await new MasterYiQCast(this, option, this.random).init();
  }
}
