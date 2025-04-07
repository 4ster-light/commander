import { exists } from "@std/fs";
import { join, isAbsolute } from "@std/path";
import { parse, stringify } from "@std/toml";
import { isConfigObject, getDefaultLanguageConfig, getRunner, getFlags, getDirectories } from "../utils/parse.ts";

export type LanguageConfig = {
  runner: string;
  flags: string[];
  directories: string[];
};

export type ConfigData = {
  languages: Record<string, LanguageConfig>;
};

const DEFAULT_LANGUAGES: Record<string, LanguageConfig> = {
  ts: {
    runner: "deno",
    flags: ["run", "--allow-read"],
    directories: ["scripts", "tests"],
  },
  js: {
    runner: "node",
    flags: [],
    directories: ["scripts", "tests"],
  },
} as const;



function mergeLanguageConfig(
  loaded: unknown,
  defaultConfig?: LanguageConfig,
): LanguageConfig {
  const config = loaded as LanguageConfig;

  if (!isConfigObject(loaded)) {
    return defaultConfig ?? getDefaultLanguageConfig();
  }

  return {
    runner: getRunner(config, defaultConfig?.runner ?? "unknown"),
    flags: getFlags(config, defaultConfig?.flags ?? []),
    directories: getDirectories(config, defaultConfig?.directories ?? []),
  };
}

export class Config {
  private data: ConfigData;
  private readonly path: string;

  constructor(configPath = "commander.toml") {
    this.path = configPath;
    this.data = { languages: { ...DEFAULT_LANGUAGES } };
  }

  async load(): Promise<void> {
    const filePath = isAbsolute(this.path) ? this.path : join(Deno.cwd(), this.path);
    if (!(await exists(filePath))) return;

    try {
      const content = await Deno.readTextFile(filePath);
      const loaded = parse(content) as Record<string, unknown>;
      const languages = loaded.languages as Record<string, unknown> | undefined;

      if (languages) {
        for (const [lang, config] of Object.entries(languages)) {
          this.data.languages[lang] = mergeLanguageConfig(
            config,
            this.data.languages[lang],
          );
        }
      }
    } catch (error) {
      console.error(
        `Error loading config: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async save(): Promise<boolean> {
    try {
      const content = stringify({ languages: this.data.languages });
      const filePath = isAbsolute(this.path) ? this.path : join(Deno.cwd(), this.path);
      await Deno.writeTextFile(filePath, content);
      return true;
    } catch (error) {
      console.error(
        `Failed to save config: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }

  getLanguageConfig(extension: string): LanguageConfig {
    return this.data.languages[extension];
  }

  supportedExtensions(): string[] {
    return Object.keys(this.data.languages);
  }

  addLanguage(extension: string, config: LanguageConfig): void {
    this.data.languages[extension] = config;
  }

  removeLanguage(extension: string): boolean {
    if (extension in this.data.languages) {
      delete this.data.languages[extension];
      return true;
    }
    return false;
  }
}
