import { runFile } from "../src/run.ts";
import { Config } from "../src/config.ts";

Deno.test("runFile", async (test) => {
  await test.step("file1", async () => {
    await runFile(
      "scripts/code1.ts",
      new Config("commander.toml").getLanguageConfig("ts")!,
    );
  });
  await test.step("file2", async () => {
    await runFile(
      "scripts/code2.ts",
      new Config("commander.toml").getLanguageConfig("ts")!,
    );
  });
  await test.step("file3", async () => {
    await runFile(
      "scripts/code3.ts",
      new Config("commander.toml").getLanguageConfig("ts")!,
    );
  });
});
