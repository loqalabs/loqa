/**
 * Preview Formatter Utilities
 *
 * User-friendly preview formatting for GitHub operations before execution.
 * Provides clear, actionable previews that show exactly what will change.
 */

export interface IssuePreviewData {
  title?: string;
  body?: string;
  labels?: string[];
  assignees?: string[];
  milestone?: string;
  state?: "open" | "closed";
}

export interface CommentPreviewData {
  body: string;
  issueNumber: number;
  repository: string;
}

export interface PRPreviewData {
  title?: string;
  body?: string;
  base?: string;
  head?: string;
  draft?: boolean;
  reviewers?: string[];
}

/**
 * Format preview for issue updates
 */
export function formatIssueUpdatePreview(
  currentIssue: any,
  updates: IssuePreviewData,
  repository: string,
  issueNumber: number
): string {
  const changes: string[] = [];

  // Title changes
  if (updates.title && updates.title !== currentIssue.title) {
    changes.push(`📝 **Title**
   Current: "${currentIssue.title}"
   New: "${updates.title}"`);
  }

  // Body changes
  if (updates.body && updates.body !== currentIssue.body) {
    const currentPreview = currentIssue.body ?
      (currentIssue.body.length > 100 ?
        currentIssue.body.substring(0, 100) + "..." :
        currentIssue.body) :
      "(empty)";
    const newPreview = updates.body.length > 100 ?
      updates.body.substring(0, 100) + "..." :
      updates.body;

    changes.push(`📄 **Body**
   Current: ${currentPreview}
   New: ${newPreview}`);
  }

  // Label changes
  const currentLabels = currentIssue.labels?.map((l: { name: string }) => l.name) || [];
  if (updates.labels && JSON.stringify(updates.labels.sort()) !== JSON.stringify(currentLabels.sort())) {
    const adding = updates.labels.filter((l: string) => !currentLabels.includes(l));
    const removing = currentLabels.filter((l: string) => !updates.labels!.includes(l));

    if (adding.length > 0 || removing.length > 0) {
      changes.push(`🏷️ **Labels**
   Current: ${currentLabels.length > 0 ? currentLabels.join(", ") : "(none)"}
   New: ${updates.labels.join(", ")}
   ${adding.length > 0 ? `   Adding: ${adding.join(", ")}` : ""}
   ${removing.length > 0 ? `   Removing: ${removing.join(", ")}` : ""}`);
    }
  }

  // State changes
  if (updates.state && updates.state !== currentIssue.state) {
    changes.push(`🔄 **State**
   Current: ${currentIssue.state}
   New: ${updates.state}`);
  }

  // Assignee changes
  const currentAssignees = currentIssue.assignees?.map((a: { login: string }) => a.login) || [];
  if (updates.assignees && JSON.stringify(updates.assignees.sort()) !== JSON.stringify(currentAssignees.sort())) {
    changes.push(`👥 **Assignees**
   Current: ${currentAssignees.length > 0 ? currentAssignees.join(", ") : "(none)"}
   New: ${updates.assignees.join(", ")}`);
  }

  if (changes.length === 0) {
    return `📋 **Issue Update Preview** - ${repository}#${issueNumber}

⚠️ **No changes detected** - all provided values match current state.

**Current issue state:**
• Title: "${currentIssue.title}"
• Labels: ${currentLabels.join(", ") || "(none)"}
• State: ${currentIssue.state}
• Assignees: ${currentAssignees.join(", ") || "(none)"}`;
  }

  return `📋 **Issue Update Preview** - ${repository}#${issueNumber}

**Planned Changes:**
${changes.join("\n\n")}

✅ **Ready to proceed?** Call the same command with \`preview_mode: false\` to execute these changes.`;
}

/**
 * Format preview for issue creation
 */
export function formatIssueCreationPreview(
  issueData: IssuePreviewData,
  repository: string
): string {
  const bodyPreview = issueData.body ?
    (issueData.body.length > 200 ?
      issueData.body.substring(0, 200) + "..." :
      issueData.body) :
    "(no description)";

  return `🆕 **New Issue Creation Preview** - ${repository}

**Title:** "${issueData.title || "(no title provided)"}"

**Description:**
${bodyPreview}

**Labels:** ${issueData.labels?.join(", ") || "(none)"}
**Assignees:** ${issueData.assignees?.join(", ") || "(none)"}
**Milestone:** ${issueData.milestone || "(none)"}

✅ **Ready to create?** Call the same command with \`preview_mode: false\` to create this issue.`;
}

/**
 * Format preview for comment creation
 */
export function formatCommentCreationPreview(
  commentData: CommentPreviewData
): string {
  const bodyPreview = commentData.body.length > 200 ?
    commentData.body.substring(0, 200) + "..." :
    commentData.body;

  return `💬 **Comment Creation Preview** - ${commentData.repository}#${commentData.issueNumber}

**Comment Content:**
${bodyPreview}

**Character Count:** ${commentData.body.length} characters

✅ **Ready to post?** Call the same command with \`preview_mode: false\` to add this comment.`;
}

/**
 * Format preview for PR creation
 */
export function formatPRCreationPreview(
  prData: PRPreviewData,
  repository: string
): string {
  const bodyPreview = prData.body ?
    (prData.body.length > 200 ?
      prData.body.substring(0, 200) + "..." :
      prData.body) :
    "(no description)";

  return `🔀 **Pull Request Creation Preview** - ${repository}

**Title:** "${prData.title || "(no title provided)"}"
**Branch:** ${prData.head} → ${prData.base}
**Draft Status:** ${prData.draft ? "Draft PR" : "Ready for review"}

**Description:**
${bodyPreview}

**Reviewers:** ${prData.reviewers?.join(", ") || "(none)"}

✅ **Ready to create?** Call the same command with \`preview_mode: false\` to create this pull request.`;
}

/**
 * Format preview for PR updates
 */
export function formatPRUpdatePreview(
  currentPR: any,
  updates: PRPreviewData,
  repository: string,
  prNumber: number
): string {
  const changes: string[] = [];

  // Title changes
  if (updates.title && updates.title !== currentPR.title) {
    changes.push(`📝 **Title**
   Current: "${currentPR.title}"
   New: "${updates.title}"`);
  }

  // Body changes
  if (updates.body && updates.body !== currentPR.body) {
    const currentPreview = currentPR.body ?
      (currentPR.body.length > 100 ?
        currentPR.body.substring(0, 100) + "..." :
        currentPR.body) :
      "(empty)";
    const newPreview = updates.body.length > 100 ?
      updates.body.substring(0, 100) + "..." :
      updates.body;

    changes.push(`📄 **Description**
   Current: ${currentPreview}
   New: ${newPreview}`);
  }

  // Draft status changes
  if (updates.draft !== undefined && updates.draft !== currentPR.draft) {
    changes.push(`📋 **Draft Status**
   Current: ${currentPR.draft ? "Draft" : "Ready for review"}
   New: ${updates.draft ? "Draft" : "Ready for review"}`);
  }

  if (changes.length === 0) {
    return `🔀 **PR Update Preview** - ${repository}#${prNumber}

⚠️ **No changes detected** - all provided values match current state.

**Current PR state:**
• Title: "${currentPR.title}"
• Status: ${currentPR.draft ? "Draft" : "Ready for review"}
• Branch: ${currentPR.head?.ref} → ${currentPR.base?.ref}`;
  }

  return `🔀 **PR Update Preview** - ${repository}#${prNumber}

**Planned Changes:**
${changes.join("\n\n")}

✅ **Ready to proceed?** Call the same command with \`preview_mode: false\` to execute these changes.`;
}

/**
 * Generic preview formatting for any operation
 */
export function formatGenericPreview(
  operation: string,
  target: string,
  changes: Record<string, { current: any; new: any }>
): string {
  const changeList = Object.entries(changes).map(([field, { current, new: newValue }]) => {
    return `**${field}:**
   Current: ${current}
   New: ${newValue}`;
  }).join("\n\n");

  return `🔄 **${operation} Preview** - ${target}

**Planned Changes:**
${changeList}

✅ **Ready to proceed?** Call the same command with \`preview_mode: false\` to execute.`;
}