import { MasterYi } from "../champions/MasterYi/MasterYi";

test("Unit.calcRawPhysicHit", () => {
  const yi = new MasterYi().init();
  expect(yi.calcRawPhysicHit(0)).toBe(0);
  expect(yi.calcRawPhysicHit(10)).toBe((1 - yi.armor/(100 + yi.armor)) * 10);
});