import { MasterYi } from "../champions/MasterYi/MasterYi";

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