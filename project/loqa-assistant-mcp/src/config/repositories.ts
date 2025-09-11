/**
 * Centralized repository configuration for the Loqa ecosystem.
 * This file defines all known repositories and their relationships.
 * 
 * Context-Aware Defaults:
 * - Development work: loqa-hub (main service)
 * - Documentation: loqa (root docs and orchestration)
 * - Configuration: loqa (docker-compose, CI/CD)
 * - Architecture: loqa-proto (protocol definitions)
 * - UI work: loqa-commander (dashboard)
 * - Testing: loqa-hub (integration tests)
 */

export interface RepositoryConfig {
  name: string;
  displayName: string;
  description: string;
  type: 'core' | 'service' | 'client' | 'protocol' | 'ui' | 'website' | 'config';
  dependencies: string[];
  testable: boolean;
  priority: number; // Lower numbers = higher priority
}

export const REPOSITORIES: Record<string, RepositoryConfig> = {
  'loqa': {
    name: 'loqa',
    displayName: 'Loqa Core',
    description: 'Main documentation and orchestration',
    type: 'core',
    dependencies: [],
    testable: false,
    priority: 2
  },
  'loqa-proto': {
    name: 'loqa-proto',
    displayName: 'Loqa Protocol',
    description: 'gRPC protocol definitions and generated bindings',
    type: 'protocol',
    dependencies: [],
    testable: false,
    priority: 1
  },
  'loqa-hub': {
    name: 'loqa-hub',
    displayName: 'Loqa Hub',
    description: 'Central service with STT/TTS/LLM pipeline',
    type: 'service',
    dependencies: ['loqa-proto'],
    testable: true,
    priority: 3
  },
  'loqa-skills': {
    name: 'loqa-skills',
    displayName: 'Loqa Skills',
    description: 'Modular skill plugin system',
    type: 'service',
    dependencies: ['loqa-proto'],
    testable: false,
    priority: 4
  },
  'loqa-relay': {
    name: 'loqa-relay',
    displayName: 'Loqa Relay',
    description: 'Audio capture client and embedded firmware',
    type: 'client',
    dependencies: ['loqa-proto'],
    testable: true,
    priority: 5
  },
  'loqa-commander': {
    name: 'loqa-commander',
    displayName: 'Loqa Commander',
    description: 'Vue.js administrative dashboard',
    type: 'ui',
    dependencies: [],
    testable: true,
    priority: 6
  },
  'www-loqalabs-com': {
    name: 'www-loqalabs-com',
    displayName: 'Loqa Labs Website',
    description: 'Company website and documentation',
    type: 'website',
    dependencies: [],
    testable: false,
    priority: 7
  },
  'loqalabs-github-config': {
    name: 'loqalabs-github-config',
    displayName: 'GitHub Configuration',
    description: 'GitHub organization configuration',
    type: 'config',
    dependencies: [],
    testable: false,
    priority: 8
  }
};

// Derived configurations
export const REPOSITORY_NAMES = Object.keys(REPOSITORIES);

export const TESTABLE_REPOSITORIES = REPOSITORY_NAMES.filter(
  name => REPOSITORIES[name].testable
);

export const DEPENDENCY_ORDER = REPOSITORY_NAMES.sort(
  (a, b) => REPOSITORIES[a].priority - REPOSITORIES[b].priority
);

export const REPOSITORIES_BY_TYPE = {
  core: REPOSITORY_NAMES.filter(name => REPOSITORIES[name].type === 'core'),
  service: REPOSITORY_NAMES.filter(name => REPOSITORIES[name].type === 'service'),
  client: REPOSITORY_NAMES.filter(name => REPOSITORIES[name].type === 'client'),
  protocol: REPOSITORY_NAMES.filter(name => REPOSITORIES[name].type === 'protocol'),
  ui: REPOSITORY_NAMES.filter(name => REPOSITORIES[name].type === 'ui'),
  website: REPOSITORY_NAMES.filter(name => REPOSITORIES[name].type === 'website'),
  config: REPOSITORY_NAMES.filter(name => REPOSITORIES[name].type === 'config')
};

// Priority-ordered lists for different use cases
export const WORKSPACE_DETECTION_ORDER = ['loqa-hub', 'loqa', 'loqa-commander', 'loqa-relay', 'loqa-proto', 'loqa-skills'];

export const KNOWN_REPOSITORIES_LIST = [
  'loqa', 'loqa-hub', 'loqa-commander', 'loqa-relay', 
  'loqa-proto', 'loqa-skills', 'www-loqalabs-com', 'loqalabs-github-config'
];

/**
 * Check if a repository name is valid
 */
export function isValidRepository(name: string): boolean {
  return name in REPOSITORIES;
}

/**
 * Get repository by name with fallback
 */
export function getRepository(name: string): RepositoryConfig | null {
  return REPOSITORIES[name] || null;
}

/**
 * Get repositories by type
 */
export function getRepositoriesByType(type: RepositoryConfig['type']): string[] {
  return REPOSITORIES_BY_TYPE[type] || [];
}

/**
 * Check if a directory name looks like a Loqa repository
 */
export function isLoqaRepository(dirName: string): boolean {
  return dirName.startsWith('loqa') || dirName === 'www-loqalabs-com' || dirName === 'loqalabs-github-config';
}

/**
 * Context types for different kinds of operations
 */
export type RepositoryContext = 
  | 'development'           // General coding, features, bugs
  | 'documentation'         // README, docs, guides
  | 'configuration'         // Docker, CI/CD, orchestration
  | 'architecture'          // System design, protocols
  | 'ui'                   // Frontend, dashboards
  | 'deployment'           // DevOps, infrastructure
  | 'testing'              // Integration, E2E tests
  | 'general';             // Fallback/unknown

/**
 * Get the most appropriate default repository based on operation context
 */
export function getDefaultRepository(context: RepositoryContext = 'development'): string {
  const contextDefaults: Record<RepositoryContext, string> = {
    'development': 'loqa-hub',        // Main service development
    'documentation': 'loqa',          // Root docs and guides
    'configuration': 'loqa',          // Docker compose, orchestration
    'architecture': 'loqa-proto',     // Protocol design, APIs
    'ui': 'loqa-commander',           // Frontend development
    'deployment': 'loqa',             // DevOps orchestration
    'testing': 'loqa-hub',            // Integration testing
    'general': 'loqa-hub'             // Safe fallback
  };

  return contextDefaults[context];
}

/**
 * Detect context from operation/command description
 */
export function detectRepositoryContext(operation?: string): RepositoryContext {
  if (!operation) return 'general';
  
  const op = operation.toLowerCase();
  
  // Documentation context
  if (op.includes('document') || op.includes('readme') || op.includes('guide') || 
      op.includes('explain') || op.includes('overview')) {
    return 'documentation';
  }
  
  // Configuration/orchestration context
  if (op.includes('docker') || op.includes('compose') || op.includes('deploy') ||
      op.includes('config') || op.includes('orchestrat')) {
    return 'configuration';
  }
  
  // Architecture/protocol context
  if (op.includes('protocol') || op.includes('api') || op.includes('grpc') ||
      op.includes('architect') || op.includes('design')) {
    return 'architecture';
  }
  
  // UI/Frontend context
  if (op.includes('ui') || op.includes('dashboard') || op.includes('frontend') ||
      op.includes('vue') || op.includes('component')) {
    return 'ui';
  }
  
  // Testing context
  if (op.includes('test') || op.includes('e2e') || op.includes('integration')) {
    return 'testing';
  }
  
  // DevOps/Deployment context
  if (op.includes('deploy') || op.includes('infra') || op.includes('devops') ||
      op.includes('ci/cd') || op.includes('pipeline')) {
    return 'deployment';
  }
  
  // Default to development for coding activities
  return 'development';
}

/**
 * Get context-aware default repository (convenience function)
 */
export function getContextualDefaultRepository(operation?: string): string {
  const context = detectRepositoryContext(operation);
  return getDefaultRepository(context);
}