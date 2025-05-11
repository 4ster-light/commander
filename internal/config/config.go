package config

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/BurntSushi/toml"
)

type LanguageConfig struct {
	Runner      string   `toml:"runner"`
	Flags       []string `toml:"flags"`
	Directories []string `toml:"directories"`
}

type ConfigData struct {
	Languages map[string]LanguageConfig `toml:"languages"`
}

type Config struct {
	Data       ConfigData
	ConfigPath string
}

func NewDefaultConfig() *Config {
	return &Config{
		Data: ConfigData{
			Languages: map[string]LanguageConfig{
				"ts": {
					Runner:      "deno",
					Flags:       []string{"run", "--allow-read"},
					Directories: []string{"scripts", "tests"},
				},
				"js": {
					Runner:      "node",
					Flags:       []string{},
					Directories: []string{"scripts", "tests"},
				},
			},
		},
	}
}

func LoadConfig(configPath string) (*Config, error) {
	cfg := NewDefaultConfig()
	cfg.ConfigPath = configPath

	absPath, err := filepath.Abs(configPath)
	if err != nil {
		return nil, fmt.Errorf("invalid config path: %w", err)
	}

	if _, err := os.Stat(absPath); os.IsNotExist(err) {
		return cfg, nil
	}

	var fileData ConfigData
	if _, err := toml.DecodeFile(absPath, &fileData); err != nil {
		return nil, fmt.Errorf("failed to decode config: %w", err)
	}

	// Merge file data with defaults
	for lang, lc := range fileData.Languages {
		cfg.Data.Languages[lang] = mergeConfig(lc, cfg.Data.Languages[lang])
	}

	return cfg, nil
}

func mergeConfig(newConfig, existing LanguageConfig) LanguageConfig {
	if existing.Runner == "" {
		existing.Runner = newConfig.Runner
	}
	if len(newConfig.Flags) > 0 {
		existing.Flags = newConfig.Flags
	}
	if len(newConfig.Directories) > 0 {
		existing.Directories = newConfig.Directories
	}
	return existing
}

func (c *Config) GetLanguage(ext string) *LanguageConfig {
	if lc, exists := c.Data.Languages[ext]; exists {
		return &lc
	}
	return nil
}

func (c *Config) SupportedLanguages() []string {
	langs := make([]string, 0, len(c.Data.Languages))
	for lang := range c.Data.Languages {
		langs = append(langs, lang)
	}
	return langs
}

func (c *Config) Save() error {
	f, err := os.Create(c.ConfigPath)
	if err != nil {
		return fmt.Errorf("failed to create config file: %w", err)
	}
	defer f.Close()

	enc := toml.NewEncoder(f)
	return enc.Encode(c.Data)
}
