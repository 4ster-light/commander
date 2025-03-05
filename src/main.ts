import { walk } from "@std/fs";
import { join } from "@std/path";
import { parseArgs } from "@std/cli";
import { bold, red, underline, yellow } from "@std/fmt/colors";
import { relativePath, runFile } from "./run.ts";
import { Config } from "./config.ts";
import { showHelp, listLanguages, createConfigFile } from "./commands.ts";

const args = parseArgs(Deno.args, {
  string: ["dir", "config"],
  boolean: ["init", "help", "list"],
  alias: {
    "dir": ["d", "directory"],
    "config": ["c"],
    "init": ["i"],
    "help": ["h"],
    "list": ["l"]
  },
});

// Show help message if no args provided or help flag used
if (args.help || (Deno.args.length === 0)) {
  showHelp();
  Deno.exit(0);
}

const configPath = args.config || "commander.toml";
const config = new Config(configPath);

// Initialize config file if requested
if (args.init) {
  await createConfigFile(configPath);
  Deno.exit(0);
}

await config.load(); // Load config if it exists

// List supported languages if requested
if (args.list) {
  listLanguages(config);
  Deno.exit(0);
}

// If no directory specified, exit with error
const directoryArg = args.dir || args._[0] as string;
if (!directoryArg) {
  console.error(red("Error: No directory specified."));
  console.log(yellow("Use --help for usage information."));
  Deno.exit(1);
}

const dir = join(Deno.cwd(), directoryArg);

try {
  let filesProcessed = 0;

  for await (const entry of walk(dir)) {
    if (entry.isFile) {
      const extension = entry.path.split(".").pop() || "";
      const langConfig = config.getLanguageConfig(extension);

      if (langConfig) {
        console.log(bold(underline(`Running ${relativePath(entry.path)}`)));
        await runFile(entry.path, langConfig);
        filesProcessed++;
      }
    }
  }

  if (filesProcessed === 0) {
    console.log(yellow("No matching files found in the specified directory."));
    console.log(`Configured extensions: ${config.supportedExtensions().map(ext => `.${ext}`).join(", ")}`);
  }
} catch (error: unknown) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(red(`Error: ${errorMessage}`));
}
