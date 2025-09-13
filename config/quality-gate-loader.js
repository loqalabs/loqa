#!/usr/bin/env node

/**
 * Quality Gate Loader - Pragmatic quality gate configuration processing
 *
 * Implements per-repository override logic with inheritance support
 * Based on PRAGMATIC_WORKFLOW_DESIGN.md specification
 */

const fs = require('fs');
const path = require('path');

class QualityGateLoader {
  constructor(configPath) {
    this.configPath = configPath || path.resolve(__dirname, '../project/loqa-assistant-mcp/config/quality-gates.json');
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      const configContent = fs.readFileSync(this.configPath, 'utf8');
      return JSON.parse(configContent);
    } catch (error) {
      console.error(`Failed to load quality gates config from ${this.configPath}:`, error.message);
      return this.getDefaultConfig();
    }
  }

  getDefaultConfig() {
    return {
      default: {
        checks: {
          lint: { command: 'make lint', required: true },
          test: { command: 'make test', required: true },
          build: { command: 'make build', required: true }
        }
      },
      repositoryOverrides: {},
      globalSettings: { parallel: true, timeout: 300 }
    };
  }

  /**
   * Get quality checks for a specific repository
   * @param {string} repoName - Repository name (e.g., 'loqa-hub', 'loqa-commander')
   * @returns {Object} Quality checks configuration
   */
  getQualityChecks(repoName) {
    const defaults = this.config.default?.checks || {};
    const override = this.config.repositoryOverrides?.[repoName];

    if (!override) {
      console.log(`No specific configuration for '${repoName}', using defaults`);
      return defaults;
    }

    // Start with defaults if inheritance enabled
    let checks = override.inherit === 'default' ? { ...defaults } : {};

    // Apply repository-specific overrides
    if (override.checks) {
      Object.assign(checks, override.checks);
    }

    return checks;
  }

  /**
   * Get global settings
   * @returns {Object} Global quality gate settings
   */
  getGlobalSettings() {
    return this.config.globalSettings || {};
  }

  /**
   * List all configured repositories
   * @returns {Array} Array of repository names
   */
  getConfiguredRepositories() {
    return Object.keys(this.config.repositoryOverrides || {});
  }

  /**
   * Get repository description
   * @param {string} repoName - Repository name
   * @returns {string} Repository description
   */
  getRepositoryDescription(repoName) {
    const override = this.config.repositoryOverrides?.[repoName];
    return override?.description || 'No description available';
  }

  /**
   * Validate quality gates configuration
   * @returns {Object} Validation results
   */
  validateConfig() {
    const results = {
      valid: true,
      errors: [],
      warnings: []
    };

    // Check required structure
    if (!this.config.default || !this.config.default.checks) {
      results.valid = false;
      results.errors.push('Missing default.checks configuration');
    }

    // Validate repository overrides
    for (const [repoName, override] of Object.entries(this.config.repositoryOverrides || {})) {
      if (!override.checks || Object.keys(override.checks).length === 0) {
        results.warnings.push(`Repository '${repoName}' has no quality checks defined`);
      }

      // Check for commands that might not exist
      for (const [checkName, check] of Object.entries(override.checks || {})) {
        if (!check.command) {
          results.errors.push(`Quality check '${checkName}' in '${repoName}' missing command`);
        }
      }
    }

    return results;
  }

  /**
   * Generate CLI commands for a repository
   * @param {string} repoName - Repository name
   * @returns {Array} Array of executable commands
   */
  getExecutableCommands(repoName) {
    const checks = this.getQualityChecks(repoName);
    const commands = [];

    for (const [checkName, check] of Object.entries(checks)) {
      if (check.required !== false) {
        commands.push({
          name: checkName,
          command: check.command,
          description: check.description || checkName,
          autofix: check.autofix || null
        });
      }
    }

    return commands;
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  const repoName = args[1];

  const loader = new QualityGateLoader();

  switch (command) {
    case 'list':
      console.log('Configured repositories:');
      loader.getConfiguredRepositories().forEach(repo => {
        console.log(`  ${repo}: ${loader.getRepositoryDescription(repo)}`);
      });
      break;

    case 'checks':
      if (!repoName) {
        console.error('Usage: quality-gate-loader.js checks <repository-name>');
        process.exit(1);
      }
      const checks = loader.getQualityChecks(repoName);
      console.log(`Quality checks for ${repoName}:`);
      Object.entries(checks).forEach(([name, check]) => {
        const required = check.required !== false ? '(required)' : '(optional)';
        console.log(`  ${name} ${required}: ${check.command}`);
      });
      break;

    case 'commands':
      if (!repoName) {
        console.error('Usage: quality-gate-loader.js commands <repository-name>');
        process.exit(1);
      }
      const commands = loader.getExecutableCommands(repoName);
      console.log(`Executable commands for ${repoName}:`);
      commands.forEach(cmd => {
        console.log(`  ${cmd.name}: ${cmd.command}`);
        if (cmd.autofix) {
          console.log(`    Autofix: ${cmd.autofix}`);
        }
      });
      break;

    case 'validate':
      const validation = loader.validateConfig();
      if (validation.valid) {
        console.log('✅ Quality gates configuration is valid');
      } else {
        console.log('❌ Quality gates configuration has errors:');
        validation.errors.forEach(error => console.log(`  Error: ${error}`));
      }
      if (validation.warnings.length > 0) {
        console.log('⚠️  Warnings:');
        validation.warnings.forEach(warning => console.log(`  Warning: ${warning}`));
      }
      process.exit(validation.valid ? 0 : 1);
      break;

    default:
      console.log(`Quality Gate Loader - Pragmatic workflow configuration

Usage:
  quality-gate-loader.js list                    # List all configured repositories
  quality-gate-loader.js checks <repo-name>      # Show quality checks for repository
  quality-gate-loader.js commands <repo-name>    # Show executable commands for repository
  quality-gate-loader.js validate                # Validate configuration

Examples:
  quality-gate-loader.js checks loqa-hub
  quality-gate-loader.js commands loqa-commander
  quality-gate-loader.js validate`);
      break;
  }
}

module.exports = QualityGateLoader;