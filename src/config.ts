import { exists } from "@std/fs";
import { join } from "@std/path";
import { parse, stringify } from "@std/toml";

export type LanguageConfig = {
  runner: string;
  flags: string[];
  directories: string[];
}

export type ConfigData = {
  languages: Record<string, LanguageConfig>;
}

export class Config {
  data: ConfigData;
  path: string;

  constructor(configPath?: string) {
    this.path = configPath || "commander.toml";
    this.data = {
      languages: {
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
      },
    };
  }

  async load(): Promise<Config> {
    const configFilePath = join(Deno.cwd(), this.path);

    if (await exists(configFilePath)) {
      try {
        const content = await Deno.readTextFile(configFilePath);
        const languages = parse(content).languages as Record<string, unknown>;

        // Start with default languages
        const mergedLanguages: Record<string, LanguageConfig> = {
          ...this.data.languages,
        };

        // Merge in languages from config file
        for (const [lang, config] of Object.entries(languages)) {
          if (typeof config === "object" && config !== null) {
            const langConfig = config as Record<string, unknown>;

            mergedLanguages[lang] = {
              runner: typeof langConfig.runner === "string"
                ? langConfig.runner
                : mergedLanguages[lang]?.runner || "unknown",

              flags: Array.isArray(langConfig.flags)
                ? langConfig.flags.filter((f) => typeof f === "string") as string[]
                : mergedLanguages[lang]?.flags || [],

              directories: Array.isArray(langConfig.directories)
                ? langConfig.directories.filter((d) => typeof d === "string" ) as string[]
                : mergedLanguages[lang]?.directories || [],
            };
          }
        }

        this.data.languages = mergedLanguages;

      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error loading config file: ${errorMessage}`);
      }
    }

    return this;
  }

  async save(): Promise<boolean> {
    try {
      // Convert ConfigData to a structure compatible with stringify
      const configRecord: Record<string, unknown> = {
        languages: this.data.languages,
      };

      const configContent = stringify(configRecord);
      await Deno.writeTextFile(join(Deno.cwd(), this.path), configContent);
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Failed to save config: ${errorMessage}`);
      return false;
    }
  }

  getLanguageConfig(extension: string): LanguageConfig | undefined {
    return this.data.languages[extension];
  }

  get supportedExtensions(): string[] {
    return Object.keys(this.data.languages);
  }

  addLanguage(extension: string, config: LanguageConfig): void {
    this.data.languages[extension] = config;
  }

  removeLanguage(extension: string): boolean {
    if (this.data.languages[extension]) {
      delete this.data.languages[extension];
      return true;
    }
    return false;
  }
}
