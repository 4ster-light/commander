import { LanguageConfig } from "../src/config.ts";

export function isConfigObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function getDefaultLanguageConfig(): LanguageConfig {
  return { runner: "unknown", flags: [], directories: [] };
}

export function getRunner(config: LanguageConfig, defaultValue: string): string {
  return typeof config.runner === "string" ? config.runner : defaultValue;
}

export function getFlags(config: LanguageConfig, defaultValue: string[]): string[] {
  return Array.isArray(config.flags) 
      ? config.flags.filter((f): f is string => typeof f === "string")
      : defaultValue;
}

export function getDirectories(config: LanguageConfig, defaultValue: string[]): string[] {
  return Array.isArray(config.directories)
    ? config.directories.filter((d): d is string => typeof d === "string")
    : defaultValue;
}
