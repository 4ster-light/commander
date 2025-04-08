import { blue, green, red } from "@std/fmt/colors"
import { LanguageConfig } from "./config.ts"

export function relativePath(path: string) {
  return `./${path.split("/").slice(-2).join("/")}`
}

export async function runFile(file: string, langConfig: LanguageConfig) {
  const { runner, flags } = langConfig

  const command = runner.split(" ")[0]
  const args = [...runner.split(" ").slice(1), ...flags, file]

  try {
    const {
      success,
      stdout,
      stderr,
    } = await new Deno.Command(command, {
      args,
      stdout: "piped",
      stderr: "piped",
    }).output()

    const decoder = new TextDecoder()

    if (success) {
      console.log(blue(`Output from ${relativePath(file)}:\n`))
      console.log(green(decoder.decode(stdout)))
    } else {
      console.error(red(`Error in ${relativePath(file)}:\n`))
      console.error(red(decoder.decode(stderr)))
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(
      red(`Failed to execute ${relativePath(file)}: ${errorMessage}`),
    )
  }
}
