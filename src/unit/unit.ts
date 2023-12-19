

export abstract class Unit {
  health = 0;
  maxHealth = 0;
  ad = 0;
  armor = 0;

  calcRawPhysicHit(value: number): number {
    return (1 - this.armor/(100 + this.armor)) * value;
  }
}