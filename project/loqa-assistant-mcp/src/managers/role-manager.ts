import { promises as fs } from 'fs';
import { join } from 'path';
import { RoleConfig, RoleDetectionResult } from '../types/index.js';
import { getRepositoriesByType } from '../config/repositories.js';

export class LoqaRoleManager {
  private workspaceRoot: string;
  private roleConfigs: Map<string, RoleConfig> = new Map();
  private roleSystemConfig: any;

  constructor(workspaceRoot?: string) {
    this.workspaceRoot = workspaceRoot || process.cwd();
  }

  /**
   * Load role configurations from files
   */
  async loadRoleConfigurations(): Promise<void> {
    // Role configs are always in the loqa repository at project/role-configs
    // First, determine if we're in a specific repository or workspace root
    const { basename } = await import('path');
    const repoName = basename(this.workspaceRoot);
    
    let roleConfigsPath: string;
    if (repoName === 'loqa') {
      // We're in the loqa repository
      roleConfigsPath = join(this.workspaceRoot, 'project', 'role-configs');
    } else {
      // We're in another repository or workspace root, navigate to loqa
      const workspaceRoot = repoName === 'loqalabs' ? this.workspaceRoot : join(this.workspaceRoot, '..');
      roleConfigsPath = join(workspaceRoot, 'loqa', 'project', 'role-configs');
    }
    
    try {
      // Load role system configuration
      const roleSystemPath = join(roleConfigsPath, 'role-system.json');
      const roleSystemContent = await fs.readFile(roleSystemPath, 'utf-8');
      this.roleSystemConfig = JSON.parse(roleSystemContent);

      // Load individual role configurations
      for (const roleInfo of this.roleSystemConfig.available_roles) {
        const rolePath = join(roleConfigsPath, roleInfo.config_file);
        try {
          const roleContent = await fs.readFile(rolePath, 'utf-8');
          const roleConfig = JSON.parse(roleContent);
          this.roleConfigs.set(roleInfo.role_id, {
            role_id: roleConfig.role_id,
            role_name: roleConfig.role_name,
            role_description: roleConfig.role_description,
            capabilities: roleConfig.capabilities || [],
            detection_patterns: roleConfig.role_detection_patterns || [],
            model_preference: roleInfo.model_preference,
            task_templates_preferred: roleConfig.task_templates_preferred || []
          });
        } catch (error) {
          console.warn(`Failed to load role config for ${roleInfo.role_id}:`, error);
        }
      }
    } catch (error) {
      console.warn('Failed to load role configurations:', error);
      // Initialize with basic default role if no roles were loaded
      if (this.roleConfigs.size === 0) {
        this.roleConfigs.set('general', {
          role_id: 'general',
          role_name: 'General Developer',
          role_description: 'Multi-disciplinary development work',
          capabilities: ['General development', 'Documentation', 'Basic testing'],
          detection_patterns: ['general', 'basic', 'documentation'],
          model_preference: 'haiku',
          task_templates_preferred: ['general-task-template']
        });
      }
    }
  }

  /**
   * Detect appropriate role based on task context
   */
  async detectRole(context: {
    title?: string;
    description?: string;
    filePaths?: string[];
    repositoryType?: string;
  }): Promise<RoleDetectionResult> {
    await this.loadRoleConfigurations();

    const text = [
      context.title || '',
      context.description || '',
      ...(context.filePaths || [])
    ].join(' ').toLowerCase();

    const scores: { [role: string]: { score: number; matches: string[] } } = {};

    // Score each role based on pattern matching
    for (const [roleId, roleConfig] of this.roleConfigs) {
      scores[roleId] = { score: 0, matches: [] };

      for (const pattern of roleConfig.detection_patterns) {
        const regex = new RegExp(`\\b${pattern.toLowerCase()}\\b`, 'gi');
        const matches = text.match(regex);
        if (matches) {
          scores[roleId].score += matches.length;
          scores[roleId].matches.push(...matches);
        }
      }

      // Bonus scoring for repository-specific patterns using centralized config
      if (context.repositoryType) {
        const architectRepos = [...getRepositoriesByType('protocol'), ...getRepositoriesByType('core')];
        const developerRepos = [...getRepositoriesByType('service'), ...getRepositoriesByType('client')];
        const coreRepos = getRepositoriesByType('core');
        
        if (roleId === 'architect' && architectRepos.includes(context.repositoryType)) {
          scores[roleId].score += 2;
        }
        if (roleId === 'developer' && developerRepos.includes(context.repositoryType)) {
          scores[roleId].score += 2;
        }
        if (roleId === 'devops' && coreRepos.includes(context.repositoryType)) {
          scores[roleId].score += 2;
        }
        if (roleId === 'qa' && text.includes('test')) {
          scores[roleId].score += 3;
        }
      }

      // File path bonus scoring
      for (const filePath of context.filePaths || []) {
        const path = filePath.toLowerCase();
        if (roleId === 'devops' && (path.includes('docker') || path.includes('ci') || path.includes('deploy'))) {
          scores[roleId].score += 3;
        }
        if (roleId === 'developer' && (path.includes('.go') || path.includes('.ts') || path.includes('.js'))) {
          scores[roleId].score += 2;
        }
        if (roleId === 'architect' && (path.includes('.proto') || path.includes('api'))) {
          scores[roleId].score += 3;
        }
        if (roleId === 'qa' && path.includes('test')) {
          scores[roleId].score += 3;
        }
      }
    }

    // Find highest scoring role
    const sortedRoles = Object.entries(scores)
      .sort(([, a], [, b]) => b.score - a.score)
      .map(([role, data]) => ({ role, ...data }));

    const topRole = sortedRoles[0];
    const totalWords = text.split(/\s+/).filter(word => word.length > 0).length;
    const confidence = totalWords > 0 ? Math.min(topRole.score / totalWords, 1.0) : 0;

    // Apply confidence threshold
    const threshold = this.roleSystemConfig?.role_detection?.confidence_threshold || 0.6;
    const detectedRole = confidence >= threshold ? topRole.role : 
                        (this.roleSystemConfig?.role_detection?.fallback_role || 'general');

    return {
      detectedRole,
      confidence,
      reasoning: topRole.matches,
      alternatives: sortedRoles.slice(1, 4).map(item => ({
        role: item.role,
        confidence: totalWords > 0 ? Math.min(item.score / totalWords, 1.0) : 0
      }))
    };
  }

  /**
   * Get role configuration by ID
   */
  async getRoleConfig(roleId: string): Promise<RoleConfig | null> {
    await this.loadRoleConfigurations();
    return this.roleConfigs.get(roleId) || null;
  }

  /**
   * List all available roles
   */
  async listRoles(): Promise<RoleConfig[]> {
    await this.loadRoleConfigurations();
    return Array.from(this.roleConfigs.values());
  }

  /**
   * Get recommended templates for a role
   */
  async getTemplatesForRole(roleId: string): Promise<string[]> {
    const roleConfig = await this.getRoleConfig(roleId);
    return roleConfig?.task_templates_preferred || ['general-task-template'];
  }

  /**
   * Get model preference for a role
   */
  async getModelPreference(roleId: string): Promise<string> {
    const roleConfig = await this.getRoleConfig(roleId);
    return roleConfig?.model_preference || 'haiku';
  }
}