import { MasterYi } from "../champions/MasterYi/MasterYi";

test("Unit.calcRawPhysicHit", () => {
  const yi = new MasterYi().init();
  expect(yi.calcRawPhysicHit(0)).toBe(0);
  expect(yi.calcRawPhysicHit(10)).toBe((1 - yi.armor/(100 + yi.armor)) * 10);
});

test("Unit.onBonusASChange", () => {
  const yi = new MasterYi().init();
  let changed = false;
  expect(yi.bonusAs).toBe(0);
  yi.onBonusASChange((newBonusAS) => {
    if (newBonusAS === 1) changed = true;
  });
  yi.bonusAs = 1;
  expect(yi.bonusAs).toBe(1);
  expect(changed).toBe(true);
});