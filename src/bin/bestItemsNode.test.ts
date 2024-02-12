
test("bestItems", async () => {
  const { $ } = await import("zx");
  const command = $`npm run bestItems`;
  command.quiet();
  command.stdin.write("\n");
  command.stdout.on("data", () => {
    command.stdin.write("\n");
  });
  const result = await command;
  const lines = result.stdout.split("\n");
  expect(lines.length).toBeGreaterThan(9);
  const items = lines.filter(line => line.includes("item1"));
  expect(items.length).toBeGreaterThan(5);
  const damage = items.map((item) => item.match(/damage: \d+/));
  const damageNumbers = damage.map(d => d[0].match(/\d+/));
  expect(damageNumbers.length).toBeGreaterThan(5);

  const log = {};
  for (const dNum of damageNumbers) {
    const pdNum = parseFloat(dNum[0]);
    expect(log[pdNum]).toBeUndefined();
    log[pdNum] = true;
  }
}, 30000)