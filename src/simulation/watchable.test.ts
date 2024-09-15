import { Watchable } from "./watchable";


test("Watchable", async () => {
  const vari = new Watchable(0);
  expect(vari.value).toBe(0);

  vari.value = 1;
  expect(vari.value).toBe(1);

  let proc = undefined as number | undefined, old = undefined as number | undefined;
  vari.callback((o, n) => {
    old = o;
    proc = n;
  });

  vari.value = 2;
  expect(old).toBe(1);
  expect(proc).toBe(2);

  const prom = vari.promise(new Promise<void>((res) => setTimeout(() => res(), 100)));
  vari.value = 10;
  const res = await prom;
  expect(res[1]).toBe(10);
  expect(res[0]).toBe(2);
});