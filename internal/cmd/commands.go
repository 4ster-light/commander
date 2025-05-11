package cmd

import (
	"fmt"
	"strings"

	"github.com/4ster-light/commander/internal/config"
	"github.com/fatih/color"
)

func ShowHelp() {
	bold := color.New(color.Bold).SprintFunc()
	green := color.New(color.FgGreen).SprintFunc()
	yellow := color.New(color.FgYellow).SprintFunc()
	blue := color.New(color.FgBlue).SprintFunc()

	fmt.Printf("%s\n\n", bold("Commander - The CLI to manage code challenges"))
	fmt.Println(bold("Usage:"))
	fmt.Printf("  %s %s %s\n\n",
		blue("commander"),
		yellow("[options]"),
		green("[directory]"))

	fmt.Println(bold("Options:"))
	fmt.Printf("  %-20s %s\n", yellow("-h"), "Show this help message")
	fmt.Printf("  %-20s %s\n", yellow("-i"), "Create default config file")
	fmt.Printf("  %-20s %s\n", yellow("-c=<path>"), "Specify config file path")
	fmt.Printf("  %-20s %s\n", yellow("-d=<path>"), "Specify directory to process")
	fmt.Printf("  %-20s %s\n", yellow("-l"), "List supported languages")

	fmt.Println(bold("\nExamples:"))
	fmt.Printf("  %s %s\n", blue("commander"), color.GreenString("scripts"))
	fmt.Printf("  %s %s\n", blue("commander"), yellow("-i"))
	fmt.Printf("  %s %s\n", blue("commander"), yellow("-d=scripts"))
}

func ListLanguages(cfg *config.Config) {
	bold := color.New(color.Bold).SprintFunc()

	fmt.Println(bold("Configured Languages:"))
	for lang, lc := range cfg.Data.Languages {
		fmt.Printf("\n%s files:\n", bold("."+lang))
		fmt.Printf("  Runner: %s\n", lc.Runner)
		fmt.Printf("  Flags: %s\n", formatFlags(lc.Flags))
		fmt.Printf("  Directories: %s\n", formatDirs(lc.Directories))
	}
}

func CreateConfig(path string) error {
	cfg := config.NewDefaultConfig()
	cfg.ConfigPath = path
	return cfg.Save()
}

func formatFlags(flags []string) string {
	if len(flags) == 0 {
		return "(none)"
	}
	return strings.Join(flags, " ")
}

func formatDirs(dirs []string) string {
	if len(dirs) == 0 {
		return "(none)"
	}
	return strings.Join(dirs, ", ")
}
