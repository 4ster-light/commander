import { bold, underline, yellow, blue, green, cyan } from "@std/fmt/colors";
import { Config } from "./config.ts";

export function showHelp() {
  console.log(bold(underline("Commander - The CLI to manage code challenges")));
  console.log(`\n  ${underline(bold(cyan("Usage:")))}`);
  console.log(`    ${blue("commander")} ${yellow("[options]")} ${green("[directory]")}`);
  console.log(`\n  ${underline(bold(cyan("Options:")))}`);
  console.log(`    ${yellow("-h")}, ${yellow("--help")}              Show this help message`);
  console.log(`    ${yellow("-i")}, ${yellow("--init")}              Create a default config file`);
  console.log(`    ${yellow("-c")}, ${yellow("--config=<path>")}     Specify config file path (default: config.toml)`);
  console.log(`    ${yellow("-d")}, ${yellow("--dir=<path>")}        Specify directory to process`);
  console.log(`    ${yellow("-l")}, ${yellow("--list")}              List supported languages and their configurations`);
  console.log(`\n  ${underline(bold(cyan("Examples:")))}`);
  console.log(`    ${blue("commander")} ${green("tests")}`);
  console.log(`    ${blue("commander")} ${yellow("--init")}`);
  console.log(`    ${blue("commander")} ${yellow("--dir=tests")} ${yellow("--config=custom.toml")}`);
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
