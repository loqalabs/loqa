/**
 * Embedded Workflow Rules - Configuration-Free Approach
 *
 * All workflow rules embedded directly in MCP server behavior.
 * No external configuration files needed - rules are part of the tooling.
 */

export interface WorkflowRules {
  blocking: string[];
  quality_gates: Record<string, string[]>;
  branch_protection: string[];
  pr_requirements: string[];
  ai_attribution: string[];
}

/**
 * Universal blocking rules that apply to ALL repositories
 * These were previously duplicated across 6+ .claude-code.json files
 */
export const UNIVERSAL_BLOCKING_RULES: string[] = [
  "🚨 BLOCKING: NEVER push directly to main branch - ALWAYS create feature branches",
  "🚨 BLOCKING: ALWAYS create PRs for review - even for simple changes",
  "🚨 BLOCKING: When blocked, ASK - never assume or work around errors",
  "🚨 MULTI-REPO: Peer services are in ../loqa-* directories - understand dependencies",
  "🚨 BLOCKING: ALL quality checks must PASS before declaring work complete",
  "🚨 BLOCKING: ALL tests must PASS - no exceptions for failing tests"
];

/**
 * Quality gate commands by repository type
 * Dynamically determined based on repository detection
 */
export const QUALITY_GATES_BY_REPO_TYPE: Record<string, string[]> = {
  'go-service': [
    'make quality-check',
    'go test ./...',
    'docker build .'
  ],
  'vue-frontend': [
    'npm run quality-check',
    'npm run build',
    'npm run lint'
  ],
  'protocol': [
    './generate.sh',
    'make lint',
    'make validate'
  ],
  'orchestration': [
    'docker-compose build',
    'make test',
    'make quality-check'
  ]
};

/**
 * AI attribution patterns to block in commits
 * Embedded instead of in every .claude-code.json
 */
export const AI_ATTRIBUTION_PATTERNS: RegExp[] = [
  /🤖.*generated.*with.*claude/i,
  /co-authored-by:.*claude/i,
  /generated.*with.*ai/i,
  /ai.*generated/i,
  /claude.*code/i,
  /anthropic\.com/i
];

/**
 * Complete service context and commands - no external config files needed
 */
export const SERVICE_CONTEXTS: Record<string, {
  type: string;
  role: string;
  dependencies: string[];
  affects?: string[];
  commands: Record<string, string>;
  specific_rules: string[];
  tech_stack?: string[];
}> = {
  'loqa-hub': {
    type: 'go-service',
    role: 'Central orchestrator service with STT/TTS/LLM pipeline',
    dependencies: ['loqa-proto', 'loqa-skills'],
    affects: ['loqa-relay', 'loqa-commander'],
    commands: {
      quality_check: 'make quality-check',
      dev: 'go run ./cmd',
      build: 'go build -o bin/hub ./cmd',
      test: 'go test ./...',
      docker: 'docker build -t loqa-hub .'
    },
    specific_rules: [
      '🚨 BLOCKING: ALL tests must PASS - go test ./... must succeed completely',
      '🚨 BLOCKING: Docker builds must SUCCEED - docker build . must work',
      '🚨 CRITICAL: Skills integration must work - test skill loading and execution'
    ]
  },
  'loqa-commander': {
    type: 'vue-frontend',
    role: 'Vue.js administrative dashboard and system monitoring interface',
    dependencies: ['loqa-hub'],
    tech_stack: ['Vue.js 3', 'Vite', 'Tailwind CSS', 'Pinia'],
    commands: {
      quality_check: 'npm run quality-check',
      dev: 'npm run dev',
      build: 'npm run build',
      test: 'npm test',
      lint: 'npm run lint',
      format: 'npm run format'
    },
    specific_rules: [
      '🚨 BLOCKING: Production build must SUCCEED - npm run build must work',
      '🚨 BLOCKING: Development server must START - npm run dev must serve without errors',
      '🚨 CRITICAL: Hub API integration must work - test all API endpoints'
    ]
  },
  'loqa-proto': {
    type: 'protocol',
    role: 'FOUNDATION SERVICE - gRPC protocol definitions and generated bindings',
    dependencies: [],
    affects: ['loqa-hub', 'loqa-relay', 'loqa-skills', 'loqa-commander'],
    commands: {
      quality_check: 'make quality-check',
      generate: './generate.sh',
      format: 'make format',
      lint: 'make lint',
      validate: 'make validate'
    },
    specific_rules: [
      '🚨 BLOCKING: Protocol generation must SUCCEED - ./generate.sh must work completely',
      '🚨 CRITICAL: This repository is FOUNDATION - all services depend on these protocols',
      '🚨 BREAKING: Coordinate changes across ALL dependent services before merging',
      '🚨 REQUIRED: Update ALL service bindings when protocol changes'
    ]
  },
  'loqa-relay': {
    type: 'go-service',
    role: 'Audio capture client and future embedded firmware foundation',
    dependencies: ['loqa-proto', 'loqa-hub'],
    commands: {
      quality_check: 'make quality-check',
      dev: 'go run ./test-go/cmd',
      build: 'make build',
      test: 'make test'
    },
    specific_rules: [
      '🚨 BLOCKING: Test client must work - go run ./test-go/cmd must connect to hub',
      '🚨 CRITICAL: Audio streaming must work - test with ./tools/run-test-relay.sh'
    ]
  },
  'loqa-skills': {
    type: 'go-service',
    role: 'Modular skill plugin system with manifest-driven architecture',
    dependencies: ['loqa-proto', 'loqa-hub'],
    commands: {
      quality_check: 'make quality-check',
      build: 'make build',
      install: 'make install',
      test: 'make test'
    },
    specific_rules: [
      '🚨 BLOCKING: Skills must have valid manifests and implement SkillPlugin interface',
      '🚨 CRITICAL: Individual skills must be testable via skills-cli',
      '🚨 REQUIRED: Hub integration must work - skills depend on hub internal packages'
    ]
  },
  'www-loqalabs-com': {
    type: 'vue-frontend',
    role: 'Marketing website and public documentation',
    dependencies: [],
    tech_stack: ['Vue.js/Nuxt'],
    commands: {
      quality_check: 'npm run quality-check',
      dev: 'npm run dev',
      build: 'npm run build',
      test: 'npm test'
    },
    specific_rules: [
      '🚨 BLOCKING: Production build must SUCCEED and be optimized',
      '🚨 CRITICAL: Mobile responsiveness required - test on multiple screen sizes',
      '🚨 REQUIRED: SEO compliance and accessibility (WCAG 2.1) required'
    ]
  },
  'loqalabs-github-config': {
    type: 'ci-cd',
    role: 'Shared GitHub Actions workflows and CI/CD templates',
    dependencies: [],
    affects: ['loqa-hub', 'loqa-commander', 'loqa-relay', 'loqa-proto', 'loqa-skills', 'www-loqalabs-com'],
    commands: {
      quality_check: 'make quality-check',
      lint: 'yamllint .',
      validate: 'actionlint'
    },
    specific_rules: [
      '🚨 BLOCKING: All workflow changes must be tested in sandbox repository first',
      '🚨 CRITICAL: Changes affect ALL repositories - coordinate carefully',
      '🚨 REQUIRED: Security gates must remain enforced - no bypass mechanisms'
    ]
  },
  'loqa': {
    type: 'orchestration',
    role: 'Main orchestration repository with Docker Compose and development tools',
    dependencies: [],
    affects: ['loqa-hub', 'loqa-commander', 'loqa-relay', 'loqa-proto', 'loqa-skills'],
    commands: {
      quality_check: 'make quality-check',
      setup: 'make setup',
      build: 'docker-compose build',
      start: 'docker-compose up -d',
      test: 'make test'
    },
    specific_rules: [
      '🚨 BLOCKING: Docker Compose changes must work across all services',
      '🚨 CRITICAL: Health checks required for all service dependencies',
      '🚨 REQUIRED: Network isolation must be maintained'
    ]
  }
};

/**
 * Repository type detection patterns
 * Used to determine appropriate quality gates and rules
 */
export const REPO_TYPE_PATTERNS: Record<string, (repoName: string, path: string) => boolean> = {
  'go-service': (name) => ['loqa-hub', 'loqa-relay', 'loqa-skills'].includes(name),
  'vue-frontend': (name) => ['loqa-commander', 'www-loqalabs-com'].includes(name),
  'protocol': (name) => name === 'loqa-proto',
  'orchestration': (name) => name === 'loqa',
  'ci-cd': (name) => name === 'loqalabs-github-config'
};

/**
 * Get complete service context for a repository (configuration-free)
 */
export function getServiceContext(repoName: string): typeof SERVICE_CONTEXTS[string] | null {
  return SERVICE_CONTEXTS[repoName] || null;
}

/**
 * Get workflow rules for a specific repository
 * Rules are determined dynamically based on repository detection
 */
export function getWorkflowRulesForRepo(repoName: string, repoPath: string): WorkflowRules {
  const serviceContext = getServiceContext(repoName);

  // Determine repository type
  let repoType = 'unknown';
  if (serviceContext) {
    repoType = serviceContext.type;
  } else {
    for (const [type, detector] of Object.entries(REPO_TYPE_PATTERNS)) {
      if (detector(repoName, repoPath)) {
        repoType = type;
        break;
      }
    }
  }

  // Use embedded service context if available, fallback to generic quality gates
  const qualityGates = serviceContext ?
    Object.values(serviceContext.commands) :
    (QUALITY_GATES_BY_REPO_TYPE[repoType] || ['make test']);

  return {
    blocking: UNIVERSAL_BLOCKING_RULES.concat(serviceContext?.specific_rules || []),
    quality_gates: { [repoType]: qualityGates },
    branch_protection: [
      "feature/* branches required for all changes",
      "main branch protected - no direct commits"
    ],
    pr_requirements: [
      "All changes require PR review",
      "Quality gates must pass before merge"
    ],
    ai_attribution: AI_ATTRIBUTION_PATTERNS.map(p => p.toString())
  };
}

/**
 * GitHub issue management patterns (embedded)
 * Previously duplicated across multiple .claude-code.json files
 */
export const GITHUB_ISSUE_PATTERNS = {
  label_categories: [
    "feature", "bug", "enhancement", "documentation", "infrastructure",
    "high-priority", "medium-priority", "low-priority",
    "in-progress", "blocked", "needs-review", "ready-to-test",
    "protocol", "ui", "backend", "skills", "cross-repo"
  ],

  simple_workflow: [
    "Create GitHub issues for all significant work",
    "Use appropriate labels for categorization and priority (type, priority, status, scope)",
    "Link related issues across repositories when applicable using issue references",
    "Update issue labels as work progresses (in-progress, blocked, needs-review)",
    "Close issues when work is complete and verified"
  ],

  templates: {
    feature: "Use for new functionality and enhancements",
    bug: "Use for defect reports and fixes",
    protocol: "Use for gRPC/API changes affecting multiple services",
    "cross-repo": "Use for work spanning multiple repositories"
  }
};

/**
 * Service-specific development commands
 * Embedded instead of scattered across CLAUDE.md files
 */
export const DEVELOPMENT_COMMANDS_BY_REPO: Record<string, Record<string, string>> = {
  'loqa-hub': {
    dev: 'go run ./cmd',
    build: 'go build -o bin/hub ./cmd',
    test: 'go test ./...',
    quality: 'make quality-check'
  },
  'loqa-commander': {
    dev: 'npm run dev',
    build: 'npm run build',
    test: 'npm test',
    quality: 'npm run quality-check'
  },
  'loqa-relay': {
    dev: 'go run ./test-go/cmd',
    build: 'make build',
    test: 'make test',
    quality: 'make quality-check'
  },
  'loqa-proto': {
    generate: './generate.sh',
    quality: 'make quality-check',
    lint: 'make lint'
  }
};

/**
 * Cross-repository coordination rules
 * Embedded coordination logic instead of manual documentation
 */
export const CROSS_REPO_COORDINATION = {
  dependency_order: [
    'loqa-proto',      // Protocol changes first
    'loqa-skills',     // Skills depend on protocol
    'loqa-hub',        // Hub depends on protocol + skills
    'loqa-relay',      // Relay depends on protocol
    'loqa-commander'   // UI depends on hub API
  ],

  breaking_change_workflow: [
    "Update loqa-proto first with new protocol definitions",
    "Create matching feature branches in all affected repositories",
    "Update dependent services in dependency order",
    "Test full system integration before merging",
    "Coordinate merge timing across repositories"
  ]
};