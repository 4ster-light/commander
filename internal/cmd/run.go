package cmd

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/4ster-light/commander/internal/config"
	"github.com/fatih/color"
)

func RunFile(path string, lang *config.LanguageConfig) error {
	blue := color.New(color.FgBlue).SprintFunc()
	red := color.New(color.FgRed).SprintFunc()

	cmdParts := append(strings.Split(lang.Runner, " "), lang.Flags...)
	cmdParts = append(cmdParts, path)

	baseCmd := cmdParts[0]
	args := cmdParts[1:]

	cmd := exec.Command(baseCmd, args...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	fmt.Printf("%s\n", blue("\nRunning "+relativePath(path)))
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("%s %v", red("Execution error:"), err)
	}
	return nil
}

func relativePath(path string) string {
	parts := strings.Split(path, string(filepath.Separator))
	if len(parts) < 2 {
		return path
	}
	return filepath.Join(parts[len(parts)-2:]...)
}
