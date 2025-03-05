import { assert, assertEquals, assertFalse } from "@std/assert";
import { Config, LanguageConfig } from "../src/config.ts";
import { join } from "@std/path";

Deno.test("Config", async (test) => {
  const tempDir = await Deno.makeTempDir();

  await test.step("initializes with default languages", () => {
    const config = new Config();
    assertEquals(config.supportedExtensions(), ["ts", "js"]);
    assertEquals(config.getLanguageConfig("ts")?.runner, "deno");
    assertEquals(config.getLanguageConfig("js")?.runner, "node");
  });

  await test.step("loads valid config file", async () => {
    const configPath = join(tempDir, "test_config.toml");
    const tomlContent = `
      [languages.py]
      runner = "python"
      flags = ["-v"]
      directories = ["src"]
    `;
    await Deno.writeTextFile(configPath, tomlContent);
    const config = new Config(configPath);
    await config.load();

    const pyConfig = config.getLanguageConfig("py");
    assert(pyConfig !== undefined, "Python config should be defined");
    assertEquals(pyConfig, {
      runner: "python",
      flags: ["-v"],
      directories: ["src"],
    });

    assertEquals(config.getLanguageConfig("ts")?.runner, "deno");
  });

  await test.step("handles invalid config data", async () => {
    const configPath = join(tempDir, "test_config.toml");
    const tomlContent = `
      [languages.rb]
      runner = 123
      flags = "not-an-array"
      directories = ["lib"]
    `;
    await Deno.writeTextFile(configPath, tomlContent);
    const config = new Config(configPath);
    await config.load();

    const rbConfig = config.getLanguageConfig("rb");
    assert(rbConfig !== undefined, "Ruby config should be defined");
    assertEquals(rbConfig, {
      runner: "unknown",
      flags: [],
      directories: ["lib"],
    });
  });

  await test.step("saves config to file", async () => {
    const configPath = join(tempDir, "test_config.toml");
    const config = new Config(configPath);
    config.addLanguage("py", {
      runner: "python",
      flags: ["-O"],
      directories: ["src"],
    });
    const saved = await config.save();
    assert(saved, "Config should save successfully");

    const content = await Deno.readTextFile(configPath);
    assert(content.includes('runner = "python"'));
    assert(content.includes('flags = ["-O"]'));
    assert(content.includes('directories = ["src"]'));
  });

  await test.step("adds new language", () => {
    const config = new Config();
    const newConfig: LanguageConfig = {
      runner: "ruby",
      flags: [],
      directories: ["lib"],
    };
    config.addLanguage("rb", newConfig);
    assertEquals(config.getLanguageConfig("rb"), newConfig);
    assert(config.supportedExtensions().includes("rb"));
  });

  await test.step("removes existing language", () => {
    const config = new Config();
    assert(config.removeLanguage("ts"));
    assertEquals(config.getLanguageConfig("ts"), undefined);
    assertFalse(config.supportedExtensions().includes("ts"));
  });

  await test.step("remove non-existent language returns false", () => {
    const config = new Config();
    assertFalse(config.removeLanguage("py"));
  });

  await test.step("supportedExtensions returns current languages", () => {
    const config = new Config();
    config.addLanguage("py", { runner: "python", flags: [], directories: [] });
    assertEquals(config.supportedExtensions().sort(), ["js", "py", "ts"]);
  });

  await Deno.remove(tempDir, { recursive: true });
});
