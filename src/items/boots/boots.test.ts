import { MasterYi } from "../../champions/MasterYi/index";
import { boots } from "./index";

test("boots", async () => {
  for (const boot of boots) {
    const yi = new MasterYi().init();
    let ms = yi.ms;

    expect(yi.applyEquip(boot)).toBe(true);
    expect(yi.ms).toBeGreaterThan(ms);
    ms = yi.ms;

    expect(yi.applyEquip(boots[0])).toBe(false);
    expect(yi.ms).toBe(ms);
  }
});