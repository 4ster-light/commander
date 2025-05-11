package main

import (
	"flag"
	"fmt"
	"os"
	"path/filepath"

	"github.com/4ster-light/commander/internal/cmd"
	"github.com/4ster-light/commander/internal/config"
)

var (
	helpFlag   = flag.Bool("h", false, "Show help message")
	initFlag   = flag.Bool("i", false, "Create default config file")
	configFlag = flag.String("c", "commander.toml", "Config file path")
	dirFlag    = flag.String("d", "", "Directory to process")
	listFlag   = flag.Bool("l", false, "List supported languages")
)

func main() {
	flag.Parse()
	args := flag.Args()

	if *helpFlag || len(os.Args) == 1 {
		cmd.ShowHelp()
		return
	}

	cfg, err := config.LoadConfig(*configFlag)
	if err != nil {
		fmt.Printf("Error loading config: %v\n", err)
		os.Exit(1)
	}

	if *initFlag {
		if err := cmd.CreateConfig(*configFlag); err != nil {
			fmt.Printf("Error creating config: %v\n", err)
			os.Exit(1)
		}
		return
	}

	if *listFlag {
		cmd.ListLanguages(cfg)
		return
	}

	targetDir := getTargetDir(args)
	if err := processDirectory(targetDir, cfg); err != nil {
		fmt.Printf("Error processing directory: %v\n", err)
		os.Exit(1)
	}
}

func getTargetDir(args []string) string {
	if *dirFlag != "" {
		return *dirFlag
	}
	if len(args) > 0 {
		return args[0]
	}
	return ""
}

func processDirectory(dir string, cfg *config.Config) error {
	if dir == "" {
		return fmt.Errorf("no directory specified")
	}

	return filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.IsDir() {
			return nil
		}

		ext := filepath.Ext(path)
		if ext == "" {
			return nil
		}
		ext = ext[1:] // Remove leading dot

		if langCfg := cfg.GetLanguage(ext); langCfg != nil {
			return cmd.RunFile(path, langCfg)
		}
		return nil
	})
}
