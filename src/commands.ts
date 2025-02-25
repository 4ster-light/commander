import { bold, underline, yellow, blue } from "@std/fmt/colors";
import { Config } from "./config.ts";

export function showHelp() {
  console.log(bold(underline("Commander - A CLI tool to manage code challenges with Deno")));
  console.log("\nUsage:");
  console.log("  commander [options] [directory]");
  console.log("\nOptions:");
  console.log("  -h, --help              Show this help message");
  console.log("  -i, --init              Create a default config file");
  console.log("  -c, --config <path>     Specify config file path (default: config.toml)");
  console.log("  -d, --dir <path>        Specify directory to process");
  console.log("  -l, --list              List supported languages and their configurations");
  console.log("\nExamples:");
  console.log("  commander tests");
  console.log("  commander --init");
  console.log("  commander --dir=tests --config=custom.toml");
}

export function listLanguages(config: Config) {
  console.log(bold(underline("Configured Languages:")));

  for (const lang of config.supportedExtensions) {
    const langConfig = config.getLanguageConfig(lang);
    if (langConfig) {
      console.log(bold(`\n.${lang} files:`));
      console.log(`  Runner: ${blue(langConfig.runner)}`);
      console.log(`  Flags: ${langConfig.flags.length ? blue(langConfig.flags.join(" ")) : "(none)"}`);
      console.log(`  Directories: ${langConfig.directories.length ? blue(langConfig.directories.join(", ")) : "(none)"}`);
    }
  }

  if (config.supportedExtensions.length === 2) {
    console.log(yellow("\nYou can add more languages by editing the config file. If you haven't created one yet, run `commander --init` to create one."));
  }
}

export async function createConfigFile(configPath: string): Promise<boolean> {
  const config = new Config(configPath);
  if (await config.save()) {
    console.log(yellow(`Created config file at ${configPath}`));
    return true;
  }
  return false;
}
