import { MasterYi } from "../MasterYi/MasterYi";

test('Champion health init', () => {
  const yi = new MasterYi().init();
  expect(yi.health).toBe(669);
  expect(yi.maxHealth).toBe(669);

  yi.level = 10;
  yi.init();
  expect(yi.health).toBe(1443);
  expect(yi.maxHealth).toBe(1443);

  yi.level = 5;
  yi.init();
  expect(yi.health).toBe(978);
  expect(yi.maxHealth).toBe(978);

  yi.level = 14;
  yi.init();
  expect(yi.health).toBe(1878);
  expect(yi.maxHealth).toBe(1878);

  yi.level = 18;
  yi.init();
  expect(yi.health).toBe(2369);
  expect(yi.maxHealth).toBe(2369);
});

test('Champion ad init', () => {
  const yi = new MasterYi().init();
  expect(yi.ad).toBeCloseTo(65);

  yi.level = 10;
  yi.init();
  expect(yi.ad).toBeCloseTo(82.03);

  yi.level = 5;
  yi.init();
  expect(yi.ad).toBeCloseTo(71.8);

  yi.level = 14;
  yi.init();
  expect(yi.ad).toBeCloseTo(91.6);

  yi.level = 18;
  yi.init();
  expect(yi.ad).toBeCloseTo(102.4);
});

test('Champion armor init', () => {
  const yi = new MasterYi().init();
  expect(yi.armor).toBeCloseTo(33);

  yi.level = 10;
  yi.init();
  expect(yi.armor).toBeCloseTo(65.51);

  yi.level = 5;
  yi.init();
  expect(yi.armor).toBeCloseTo(45.98);

  yi.level = 14;
  yi.init();
  expect(yi.armor).toBeCloseTo(83.78);

  yi.level = 18;
  yi.init();
  expect(yi.armor).toBeCloseTo(104.4);
});