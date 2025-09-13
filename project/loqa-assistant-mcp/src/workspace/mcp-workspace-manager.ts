/**
 * MCP Workspace Manager
 *
 * Extended workspace manager with full MCP-specific functionality.
 * The base LoqaWorkspaceManager provides basic methods, this extended version
 * adds all the advanced workspace management capabilities needed for the MCP server.
 */

import { promises as fs } from "fs";
import { join } from "path";
import { spawn } from "child_process";
import { simpleGit } from "simple-git";

// Import modular components
import { LoqaWorkspaceManager } from "../managers/index.js";
import { LoqaIssueManager } from "../managers/issue-manager.js";
import {
  DEPENDENCY_ORDER,
  TESTABLE_REPOSITORIES,
} from "../config/repositories.js";

/**
 * Extended workspace manager with full MCP-specific functionality
 */
export class MCPWorkspaceManager extends LoqaWorkspaceManager {
  constructor(workspaceRoot: string) {
    super(workspaceRoot);
  }

  /**
   * Intelligent issue prioritization and auto-selection
   */
  async intelligentIssuePrioritization(
    options: {
      roleContext?: string;
      timeAvailable?: string;
      repositoryFocus?: string;
      priority?: string;
      criteria?: string[];
      showTop?: number;
    } = {}
  ): Promise<{
    recommendedIssue?: any;
    alternativeIssues: any[];
    analysis: any;
    aiAnalysis?: any;
  }> {
    const showTop = options.showTop || 3;
    const allIssues: any[] = [];
    const repositoriesToCheck = options.repositoryFocus
      ? [options.repositoryFocus]
      : this.knownRepositories;

    // Collect issues from repositories
    for (const repoName of repositoriesToCheck) {
      const repoPath = join(this.actualWorkspaceRoot, repoName);
      try {
        await fs.access(join(repoPath, ".git"));
        // Create a issue manager for this specific repository (deprecated but functional)
        const repoIssueManager = new LoqaIssueManager(repoPath);
        const issueList = await repoIssueManager.listIssues();

        // Note: Since LoqaIssueManager now returns empty arrays, we'll skip processing
        // until full migration to IssueProviderManager is complete
        if (issueList.issues.length === 0) {
          continue; // Skip repositories with no issues for now
        }
      } catch (error) {
        // Repository doesn't exist or no Git access
        continue;
      }
    }

    // Score issues based on various criteria
    const scoredIssues = allIssues.map((issue) => {
      let score = 0;

      // Priority scoring
      if (issue.priority.toLowerCase() === "high") score += 3;
      else if (issue.priority.toLowerCase() === "medium") score += 2;
      else score += 1;

      // Role context scoring
      if (options.roleContext) {
        const role = options.roleContext.toLowerCase();
        if (
          role === "developer" &&
          issue.content.toLowerCase().includes("implement")
        )
          score += 2;
        if (role === "qa" && issue.content.toLowerCase().includes("test"))
          score += 2;
        if (role === "devops" && issue.content.toLowerCase().includes("deploy"))
          score += 2;
        if (
          role === "architect" &&
          issue.content.toLowerCase().includes("design")
        )
          score += 2;
      }

      // Type scoring
      if (issue.type.toLowerCase().includes("bug")) score += 1;
      if (issue.type.toLowerCase().includes("feature")) score += 1;

      // Repository focus
      if (options.repositoryFocus === issue.repository) score += 2;

      return { ...issue, score };
    });

    // Sort by score descending
    scoredIssues.sort((a, b) => b.score - a.score);

    const recommendedIssue =
      scoredIssues.length > 0 ? scoredIssues[0] : undefined;
    const alternativeIssues = scoredIssues.slice(1, showTop);

    // Enhanced analysis for issue prioritization
    let aiAnalysis = null;
    try {
      aiAnalysis = await this.performAIPoweredIssueAnalysis(
        scoredIssues,
        options
      );
    } catch (error) {
      console.warn("AI analysis failed for issue prioritization:", error);
    }

    return {
      recommendedIssue,
      alternativeIssues,
      analysis: {
        totalIssues: allIssues.length,
        eligibleIssues: scoredIssues.length,
        criteria: options.criteria || [
          "priority",
          "role_context",
          "repository_focus",
        ],
        context: {
          role: options.roleContext || "auto-detect",
          timeAvailable: options.timeAvailable || "flexible",
          repositoryFocus: options.repositoryFocus || "all",
          priorityFilter: options.priority || "all",
        },
      },
      aiAnalysis,
    };
  }

  /**
   * Enhanced analysis of issue prioritization results
   */
  private async performAIPoweredIssueAnalysis(
    scoredIssues: any[],
    options: any
  ): Promise<any> {
    const { readFile } = await import("fs/promises");

    // Load project context
    const projectDocs: string[] = [];

    try {
      // Load main project documentation
      const claudeFile = await readFile(
        join(this.actualWorkspaceRoot, "loqa", "CLAUDE.md"),
        "utf-8"
      );
      projectDocs.push(claudeFile);

      // Load README files from key repositories
      const keyRepos = [
        "loqa-hub",
        "loqa-commander",
        "loqa-relay",
        "loqa-skills",
      ];
      for (const repo of keyRepos) {
        try {
          const readmePath = join(this.actualWorkspaceRoot, repo, "README.md");
          const readme = await readFile(readmePath, "utf-8");
          projectDocs.push(`# ${repo} README\n\n${readme}`);
        } catch {
          // README doesn't exist, skip
        }
      }
    } catch (error) {
      console.warn("Could not load project documentation for AI analysis");
    }

    // Prepare issue summaries for analysis
    const issueSummaries = scoredIssues.slice(0, 10).map((issue) => ({
      title: issue.title,
      repository: issue.repository,
      priority: issue.priority,
      score: issue.score,
      contentPreview:
        issue.content?.substring(0, 300) +
        (issue.content?.length > 300 ? "..." : ""),
    }));

    // Simple analysis result structure (in a real implementation, this would be sent to an LLM)
    // For now, provide intelligent heuristic-based analysis
    const analysis = {
      workFocus: this.assessWorkFocus(issueSummaries),
      projectHealth: this.assessProjectHealth(scoredIssues, options),
      bottlenecks: this.identifyBottlenecks(issueSummaries),
      optimizationRecommendations: this.generateOptimizationRecommendations(
        scoredIssues,
        options
      ),
      riskAssessment: this.assessIssueRisks(issueSummaries),
      timelineInsights: this.generateTimelineInsights(scoredIssues, options),
    };

    return analysis;
  }

  private assessWorkFocus(issueSummaries: any[]): string {
    const hasBackendWork = issueSummaries.some((t) =>
      ["loqa-hub", "loqa-relay"].includes(t.repository)
    );
    const hasFrontendWork = issueSummaries.some((t) =>
      ["loqa-commander"].includes(t.repository)
    );
    const hasSkillsWork = issueSummaries.some(
      (t) => t.repository === "loqa-skills"
    );

    if (hasBackendWork && hasFrontendWork && hasSkillsWork) {
      return "Excellent - balanced across core microservice architecture";
    } else if (hasBackendWork && hasFrontendWork) {
      return "Good - covers core services, consider skills development";
    } else {
      return "Moderate - focused on specific area, may benefit from broader scope";
    }
  }

  private assessProjectHealth(scoredIssues: any[], _options: any): string {
    const highPriorityCount = scoredIssues.filter(
      (t) => t.priority === "High"
    ).length;
    const totalIssues = scoredIssues.length;
    const avgScore =
      scoredIssues.reduce((sum, t) => sum + t.score, 0) / totalIssues;

    if (highPriorityCount > totalIssues * 0.5) {
      return "Critical - high volume of urgent issues indicates potential issues";
    } else if (avgScore > 4) {
      return "Healthy - issues are well-aligned with current priorities";
    } else {
      return "Stable - normal issue distribution with room for optimization";
    }
  }

  private identifyBottlenecks(issueSummaries: any[]): string[] {
    const bottlenecks: string[] = [];

    const hubIssues = issueSummaries.filter(
      (t) => t.repository === "loqa-hub"
    ).length;
    const protoIssues = issueSummaries.filter(
      (t) => t.repository === "loqa-proto"
    ).length;

    if (protoIssues > 2) {
      bottlenecks.push("Protocol changes may block other service development");
    }

    if (hubIssues > 5) {
      bottlenecks.push(
        "Heavy focus on hub service may indicate architectural complexity"
      );
    }

    const skillsImplementation = issueSummaries.some(
      (t) =>
        t.title.toLowerCase().includes("skill") &&
        t.title.toLowerCase().includes("implement")
    );
    const skillsInfra = issueSummaries.some(
      (t) =>
        t.title.toLowerCase().includes("skill") &&
        (t.title.toLowerCase().includes("system") ||
          t.title.toLowerCase().includes("framework"))
    );

    if (skillsImplementation && !skillsInfra) {
      bottlenecks.push(
        "Skills implementation without framework may need infrastructure work"
      );
    }

    return bottlenecks;
  }

  private generateOptimizationRecommendations(
    scoredIssues: any[],
    options: any
  ): string[] {
    const recommendations: string[] = [];

    // Role-specific recommendations
    if (options.roleContext === "developer") {
      const implIssues = scoredIssues.filter(
        (t) =>
          t.content?.toLowerCase().includes("implement") ||
          t.content?.toLowerCase().includes("feature")
      ).length;
      if (implIssues < 3) {
        recommendations.push(
          "Consider prioritizing implementation issues to maintain development momentum"
        );
      }
    }

    // Repository balance recommendations
    const repoDistribution = scoredIssues.reduce((acc: any, issue) => {
      acc[issue.repository] = (acc[issue.repository] || 0) + 1;
      return acc;
    }, {});

    const maxRepoIssues = Math.max(
      ...(Object.values(repoDistribution) as number[])
    );
    const totalIssues = scoredIssues.length;

    if (maxRepoIssues > totalIssues * 0.7) {
      recommendations.push(
        "Consider distributing issues across repositories to avoid single-point bottlenecks"
      );
    }

    // Priority balance
    const highPriorityIssues = scoredIssues.filter(
      (t) => t.priority === "High"
    ).length;
    if (highPriorityIssues > 5) {
      recommendations.push(
        "High volume of high-priority issues - consider re-evaluating priorities or breaking down issues"
      );
    }

    return recommendations;
  }

  private assessIssueRisks(issueSummaries: any[]): string[] {
    const risks: string[] = [];

    // Protocol change risks
    const protoChanges = issueSummaries.filter(
      (t) =>
        t.repository === "loqa-proto" ||
        t.title.toLowerCase().includes("protocol") ||
        t.title.toLowerCase().includes("grpc")
    ).length;

    if (protoChanges > 0) {
      risks.push("Protocol changes require careful cross-service coordination");
    }

    // Infrastructure risks
    const infraIssues = issueSummaries.filter(
      (t) =>
        t.title.toLowerCase().includes("deploy") ||
        t.title.toLowerCase().includes("docker") ||
        t.title.toLowerCase().includes("infrastructure")
    ).length;

    if (infraIssues > 2) {
      risks.push(
        "Multiple infrastructure changes increase deployment complexity"
      );
    }

    // Breaking change risks
    const breakingIssues = issueSummaries.filter(
      (t) =>
        t.title.toLowerCase().includes("breaking") ||
        t.title.toLowerCase().includes("migrate") ||
        t.title.toLowerCase().includes("refactor")
    ).length;

    if (breakingIssues > 1) {
      risks.push("Multiple breaking changes may require careful sequencing");
    }

    return risks;
  }

  private generateTimelineInsights(_scoredIssues: any[], options: any): string {
    const timeAvailable = options.timeAvailable || "flexible";

    if (timeAvailable.includes("hour")) {
      const hours = parseInt(timeAvailable.match(/\d+/)?.[0] || "2");
      const feasibleIssues = Math.min(hours, 2);
      return `With ${hours} hour(s), focus on ${feasibleIssues} high-impact issue(s) from the top priorities`;
    } else if (timeAvailable.includes("day")) {
      const days = parseInt(timeAvailable.match(/\d+/)?.[0] || "1");
      const feasibleIssues = Math.min(days * 2, 5);
      return `${days} day(s) allows completion of ${feasibleIssues} issues with proper testing and quality checks`;
    } else if (timeAvailable.includes("week")) {
      const weeks = parseInt(timeAvailable.match(/\d+/)?.[0] || "1");
      return `${weeks} week(s) enables comprehensive feature development across multiple repositories`;
    } else {
      return `Flexible timeline allows smart selection based on complexity and dependencies`;
    }
  }

  /**
   * Run quality checks across repositories in dependency order
   */
  async runQualityChecks(options: { repository?: string } = {}): Promise<any> {
    const startTime = Date.now();
    const results: any[] = [];
    const repositoriesToCheck = options.repository
      ? [options.repository]
      : this.knownRepositories;

    // Use centralized dependency order for Loqa repositories
    const dependencyOrder = DEPENDENCY_ORDER;
    const orderedRepos = dependencyOrder
      .filter((repo) => repositoriesToCheck.includes(repo))
      .concat(
        repositoriesToCheck.filter((repo) => !dependencyOrder.includes(repo))
      );

    for (const repoName of orderedRepos) {
      const repoPath = join(this.actualWorkspaceRoot, repoName);

      try {
        await fs.access(join(repoPath, ".git"));

        const repoStartTime = Date.now();
        const checkResults: {
          check: string;
          success: boolean;
          output?: string;
          error?: string;
        }[] = [];

        // Check for quality-check command
        const packageJsonPath = join(repoPath, "package.json");
        const makefilePath = join(repoPath, "Makefile");

        if (await this.fileExists(packageJsonPath)) {
          // Node.js project - run npm run quality-check
          await this.runNodeQualityChecks(repoPath, checkResults);
        } else if (await this.fileExists(makefilePath)) {
          // Go project - run make quality-check
          await this.runGoQualityChecks(repoPath, checkResults);
        } else {
          // Try basic checks
          await this.runBasicQualityChecks(repoPath, checkResults);
        }

        const duration = Date.now() - repoStartTime;
        const successful = checkResults.every((r) => r.success);

        results.push({
          repository: repoName,
          path: repoPath,
          successful,
          duration,
          checks: checkResults,
        });
      } catch (error) {
        results.push({
          repository: repoName,
          path: repoPath,
          successful: false,
          error: error instanceof Error ? error.message : "Unknown error",
          duration: 0,
          checks: [],
        });
      }
    }

    const totalDuration = Date.now() - startTime;
    const successful = results.filter((r) => r.successful).length;
    const failed = results.length - successful;

    return {
      results,
      summary: {
        totalChecked: results.length,
        successful,
        failed,
        totalDuration,
      },
      executionOrder: orderedRepos,
    };
  }

  private async runNodeQualityChecks(repoPath: string, checkResults: any[]): Promise<void> {
    try {
      const packageJson = JSON.parse(
        await fs.readFile(join(repoPath, "package.json"), "utf-8")
      );
      if (packageJson.scripts && packageJson.scripts["quality-check"]) {
        const result = await this.runCommand(
          "npm",
          ["run", "quality-check"],
          repoPath
        );
        checkResults.push({
          check: "npm run quality-check",
          success: result.success,
          output: result.stdout,
          error: result.stderr,
        });
      } else {
        // Try individual checks
        if (packageJson.scripts.lint) {
          const result = await this.runCommand(
            "npm",
            ["run", "lint"],
            repoPath
          );
          checkResults.push({
            check: "npm run lint",
            success: result.success,
            output: result.stdout,
            error: result.stderr,
          });
        }

        if (packageJson.scripts.test) {
          const result = await this.runCommand("npm", ["test"], repoPath);
          checkResults.push({
            check: "npm test",
            success: result.success,
            output: result.stdout,
            error: result.stderr,
          });
        }
      }
    } catch (error) {
      checkResults.push({
        check: "package.json parse",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  private async runGoQualityChecks(repoPath: string, checkResults: any[]): Promise<void> {
    // Go project - run make quality-check
    const result = await this.runCommand(
      "make",
      ["quality-check"],
      repoPath
    );
    checkResults.push({
      check: "make quality-check",
      success: result.success,
      output: result.stdout,
      error: result.stderr,
    });
  }

  private async runBasicQualityChecks(repoPath: string, checkResults: any[]): Promise<void> {
    const goModPath = join(repoPath, "go.mod");
    if (await this.fileExists(goModPath)) {
      // Go project
      const testResult = await this.runCommand(
        "go",
        ["test", "./..."],
        repoPath
      );
      checkResults.push({
        check: "go test",
        success: testResult.success,
        output: testResult.stdout,
        error: testResult.stderr,
      });

      const vetResult = await this.runCommand(
        "go",
        ["vet", "./..."],
        repoPath
      );
      checkResults.push({
        check: "go vet",
        success: vetResult.success,
        output: vetResult.stdout,
        error: vetResult.stderr,
      });
    }
  }

  /**
   * Create feature branch from GitHub Issue
   */
  async createBranchFromIssue(options: {
    issueId: string;
    repository?: string;
  }): Promise<any> {
    const repository = options.repository || "loqa";
    const repoPath = join(this.workspaceRoot, "..", repository);

    try {
      // Check if repository exists
      await fs.access(join(repoPath, ".git"));

      // Find the GitHub Issue
      const issueManager = new LoqaIssueManager(repoPath);
      const issueList = await issueManager.listIssues();
      const issue = issueList.issues?.find(
        (i: any) => i.number.toString() === options.issueId
      );

      if (!issue) {
        return {
          success: false,
          repository,
          error: `Issue #${options.issueId} not found in ${repository}`,
        };
      }

      // Use issue title for branch name
      const title = issue.title;

      // Generate branch name
      const branchName = `feature/${title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "")}`;

      const git = simpleGit(repoPath);

      // Ensure we're on main and up to date
      await git.checkout("main");
      await git.pull("origin", "main");

      // Create and checkout new branch
      await git.checkoutLocalBranch(branchName);

      return {
        success: true,
        branchName,
        repository,
        issueNumber: issue.number,
        issueTitle: title,
        issueUrl: issue.html_url,
      };
    } catch (error) {
      return {
        success: false,
        repository,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Run integration tests across multi-repository changes
   */
  async runIntegrationTests(
    _options: { scope?: "all" | "affected" | "current" } = {}
  ): Promise<any> {
    const startTime = Date.now();
    const results: any[] = [];

    // Define repositories that have integration tests
    const testableRepos = TESTABLE_REPOSITORIES;

    for (const repoName of testableRepos) {
      const repoPath = join(this.workspaceRoot, "..", repoName);

      try {
        await fs.access(join(repoPath, ".git"));

        const repoStartTime = Date.now();
        const testResults: any[] = [];

        // Check for integration test directories
        const integrationPaths = [
          join(repoPath, "tests", "integration"),
          join(repoPath, "tests", "e2e"),
          join(repoPath, "test", "integration"),
          join(repoPath, "test", "e2e"),
        ];

        let hasIntegrationTests = false;

        for (const testPath of integrationPaths) {
          try {
            await fs.access(testPath);
            hasIntegrationTests = true;

            // Run Go integration tests
            if (await this.fileExists(join(repoPath, "go.mod"))) {
              const result = await this.runCommand(
                "go",
                ["test", "-v", testPath],
                repoPath
              );
              testResults.push({
                type: "go-integration",
                path: testPath,
                success: result.success,
                output: result.stdout,
                error: result.stderr,
              });
            }

            // Run Node.js integration tests
            const packageJsonPath = join(repoPath, "package.json");
            if (await this.fileExists(packageJsonPath)) {
              const packageJson = JSON.parse(
                await fs.readFile(packageJsonPath, "utf-8")
              );
              if (
                packageJson.scripts &&
                packageJson.scripts["test:integration"]
              ) {
                const result = await this.runCommand(
                  "npm",
                  ["run", "test:integration"],
                  repoPath
                );
                testResults.push({
                  type: "npm-integration",
                  path: testPath,
                  success: result.success,
                  output: result.stdout,
                  error: result.stderr,
                });
              }
            }
          } catch {
            // Path doesn't exist, continue
          }
        }

        if (!hasIntegrationTests) {
          // Check for standard test commands that might include integration tests
          if (await this.fileExists(join(repoPath, "go.mod"))) {
            const result = await this.runCommand(
              "go",
              ["test", "./..."],
              repoPath
            );
            testResults.push({
              type: "go-test-all",
              success: result.success,
              output: result.stdout,
              error: result.stderr,
            });
          }
        }

        const duration = Date.now() - repoStartTime;
        const successful =
          testResults.length > 0 && testResults.every((r) => r.success);

        results.push({
          repository: repoName,
          path: repoPath,
          successful,
          duration,
          hasIntegrationTests,
          tests: testResults,
        });
      } catch (error) {
        results.push({
          repository: repoName,
          path: repoPath,
          successful: false,
          error: error instanceof Error ? error.message : "Unknown error",
          duration: 0,
          tests: [],
        });
      }
    }

    const totalDuration = Date.now() - startTime;
    const successfulRepos = results.filter((r) => r.successful).length;
    const failedRepos = results.length - successfulRepos;
    const totalTests = results.reduce((sum, r) => sum + r.tests.length, 0);
    const successfulTests = results.reduce(
      (sum, r) => sum + r.tests.filter((t: any) => t.success).length,
      0
    );

    return {
      results,
      summary: {
        totalTests,
        successful: successfulTests,
        failed: totalTests - successfulTests,
        totalDuration,
        repositoriesTested: results.length,
        successfulRepos,
        failedRepos,
      },
    };
  }

  // Helper methods
  private async fileExists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  private async runCommand(
    command: string,
    args: string[],
    cwd: string
  ): Promise<{ success: boolean; stdout: string; stderr: string }> {
    return new Promise((resolve) => {
      const child = spawn(command, args, {
        cwd,
        stdio: ["ignore", "pipe", "pipe"],
        shell: true,
      });

      let stdout = "";
      let stderr = "";

      child.stdout?.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr?.on("data", (data) => {
        stderr += data.toString();
      });

      child.on("close", (code) => {
        resolve({
          success: code === 0,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
        });
      });

      child.on("error", (error) => {
        resolve({
          success: false,
          stdout: "",
          stderr: error.message,
        });
      });
    });
  }

  /**
   * Extract priority from GitHub Issue labels
   */
  private extractPriorityFromIssue(issue: any): string {
    if (!issue.labels) return "Medium";

    for (const label of issue.labels) {
      const name = label.name?.toLowerCase() || "";
      if (
        name.includes("high") ||
        name.includes("urgent") ||
        name.includes("critical")
      )
        return "High";
      if (name.includes("low") || name.includes("minor")) return "Low";
      if (name.includes("medium") || name.includes("normal")) return "Medium";
    }

    return "Medium";
  }
}