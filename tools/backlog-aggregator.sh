#!/usr/bin/env bash

# Backlog Aggregator - Cross-Repository Task Management
# Part of the Loqa ecosystem tools

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
PARENT_DIR="$(dirname "$ROOT_DIR")"

# All Loqa repositories
REPOSITORIES=(
    "loqa"
    "loqa-hub" 
    "loqa-commander"
    "loqa-relay"
    "loqa-proto"
    "loqa-skills"
    "www-loqalabs-com"
    "loqalabs-github-config"
)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

usage() {
    cat << EOF
${BOLD}Backlog Aggregator${NC} - Cross-Repository Task Management

${BOLD}USAGE:${NC}
    $0 [COMMAND] [OPTIONS]

${BOLD}COMMANDS:${NC}
    ${GREEN}overview${NC}                    Show summary across all repositories
    ${GREEN}list${NC} [--priority=P1|P2|P3]  List all tasks with optional priority filter
    ${GREEN}next${NC}                        Show recommended next task to work on
    ${GREEN}stats${NC}                       Show detailed statistics
    ${GREEN}repo <name>${NC}                 Show tasks for specific repository
    ${GREEN}search <term>${NC}               Search tasks by title/content
    ${GREEN}priority <P1|P2|P3>${NC}         Show tasks by priority level

${BOLD}OPTIONS:${NC}
    --status=STATUS              Filter by status (To Do, In Progress, Done)
    --repo=REPO                  Filter by specific repository
    --format=table|json|brief    Output format (default: table)
    --include-done               Include completed tasks
    --help                       Show this help message

${BOLD}EXAMPLES:${NC}
    $0 overview                  # Quick summary of all repositories
    $0 list --priority=P1        # All high priority tasks
    $0 next                      # Recommended next task
    $0 search "github"           # Find GitHub-related tasks
    $0 repo loqa-hub             # Tasks in loqa-hub repository

${BOLD}PRIORITY SYSTEM:${NC}
    ${RED}P1/High${NC}     - Urgent, blocking other work
    ${YELLOW}P2/Medium${NC}   - Important, planned work  
    ${BLUE}P3/Low${NC}      - Nice-to-have, future work

EOF
}

# Get priority order number
get_priority_order() {
    case "$1" in
        "P1"|"High") echo 1 ;;
        "P2"|"Medium") echo 2 ;;
        "P3"|"Low") echo 3 ;;
        *) echo 4 ;;
    esac
}

# Get status order number
get_status_order() {
    case "$1" in
        "In Progress") echo 1 ;;
        "To Do") echo 2 ;;
        "Done") echo 3 ;;
        *) echo 4 ;;
    esac
}

# Check if repository exists and has backlog
check_repository() {
    local repo_path="$PARENT_DIR/$1"
    local backlog_path="$repo_path/backlog"
    
    if [[ ! -d "$repo_path" ]]; then
        return 1
    fi
    
    if [[ ! -d "$backlog_path" ]]; then
        return 2
    fi
    
    return 0
}

# Extract task metadata from markdown file
parse_task_file() {
    local file_path="$1"
    local repo_name="$2"
    
    if [[ ! -f "$file_path" ]]; then
        return 1
    fi
    
    local title=""
    local priority=""
    local status=""
    local category=""
    local effort=""
    local created=""
    
    # Extract title from filename or first heading
    title=$(basename "$file_path" .md | sed 's/^task-[0-9]*-//' | tr '-' ' ')
    
    # Try to get title from first markdown heading
    local md_title=$(grep -m1 "^# " "$file_path" 2>/dev/null | sed 's/^# *//' || echo "")
    if [[ -n "$md_title" ]]; then
        title="$md_title"
    fi
    
    # Extract metadata from the file content
    while IFS= read -r line; do
        # YAML frontmatter format
        if [[ "$line" =~ ^priority:[[:space:]]*(.+)$ ]]; then
            local yaml_priority="${BASH_REMATCH[1]}"
            # Convert high/medium/low to P1/P2/P3
            case "$yaml_priority" in
                "high") priority="P1" ;;
                "medium") priority="P2" ;;
                "low") priority="P3" ;;
                *) priority="$yaml_priority" ;;
            esac
        elif [[ "$line" =~ ^status:[[:space:]]*(.+)$ ]]; then
            status="${BASH_REMATCH[1]}"
        # Markdown format
        elif [[ "$line" =~ ^[[:space:]]*-[[:space:]]*\*\*Priority\*\*:[[:space:]]*(.+)$ ]]; then
            priority="${BASH_REMATCH[1]}"
        elif [[ "$line" =~ ^[[:space:]]*-[[:space:]]*\*\*Status\*\*:[[:space:]]*(.+)$ ]]; then
            status="${BASH_REMATCH[1]}"
        elif [[ "$line" =~ ^[[:space:]]*-[[:space:]]*\*\*Category\*\*:[[:space:]]*(.+)$ ]]; then
            category="${BASH_REMATCH[1]}"
        elif [[ "$line" =~ ^[[:space:]]*-[[:space:]]*\*\*Effort\*\*:[[:space:]]*(.+)$ ]]; then
            effort="${BASH_REMATCH[1]}"
        elif [[ "$line" =~ ^[[:space:]]*-[[:space:]]*\*\*Created\*\*:[[:space:]]*(.+)$ ]]; then
            created="${BASH_REMATCH[1]}"
        elif [[ "$line" =~ ^[[:space:]]*-[[:space:]]*Status:[[:space:]]*(.+)$ ]]; then
            status="${BASH_REMATCH[1]}"
        elif [[ "$line" =~ Priority:[[:space:]]*(.+)$ ]]; then
            priority="${BASH_REMATCH[1]}"
        fi
    done < "$file_path"
    
    # Default values
    [[ -z "$priority" ]] && priority="P2"
    [[ -z "$status" ]] && status="To Do"
    [[ -z "$category" ]] && category="General"
    [[ -z "$effort" ]] && effort="Unknown"
    [[ -z "$created" ]] && created="Unknown"
    
    # Output in tab-separated format for easy parsing
    printf "%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\n" \
        "$repo_name" \
        "$title" \
        "$priority" \
        "$status" \
        "$category" \
        "$effort" \
        "$created" \
        "$file_path"
}

# Get all tasks from all repositories
get_all_tasks() {
    local include_done="${1:-false}"
    
    for repo in "${REPOSITORIES[@]}"; do
        local repo_path="$PARENT_DIR/$repo"
        local backlog_path="$repo_path/backlog"
        local tasks_path="$backlog_path/tasks"
        
        if ! check_repository "$repo"; then
            continue
        fi
        
        if [[ ! -d "$tasks_path" ]]; then
            continue
        fi
        
        # Find all task files
        find "$tasks_path" -name "*.md" -type f 2>/dev/null | while read -r task_file; do
            if [[ -f "$task_file" ]]; then
                local task_data=$(parse_task_file "$task_file" "$repo")
                if [[ -n "$task_data" ]]; then
                    local status=$(echo "$task_data" | cut -f4)
                    if [[ "$include_done" == "true" ]] || [[ "$status" != "Done" ]]; then
                        echo "$task_data"
                    fi
                fi
            fi
        done
    done
}

# Sort tasks by priority and status
sort_tasks() {
    local tasks="$1"
    
    # Add sort keys and sort, then remove them
    echo "$tasks" | while IFS=$'\t' read -r repo title priority status category effort created file_path; do
        if [[ -n "$repo" ]]; then
            local priority_order=$(get_priority_order "$priority")
            local status_order=$(get_status_order "$status")
            printf "%d\t%d\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\n" \
                "$priority_order" "$status_order" "$repo" "$title" "$priority" "$status" "$category" "$effort" "$created" "$file_path"
        fi
    done | sort -t$'\t' -k1,1n -k2,2n -k4,4 | cut -f3-
}

# Format task for display
format_task() {
    local format="$1"
    local task_data="$2"
    
    IFS=$'\t' read -r repo title priority status category effort created file_path <<< "$task_data"
    
    case "$format" in
        "table")
            # Get priority color
            local priority_color="$NC"
            case "$priority" in
                "P1"|"High") priority_color="$RED" ;;
                "P2"|"Medium") priority_color="$YELLOW" ;;
                "P3"|"Low") priority_color="$BLUE" ;;
            esac
            
            # Get status color
            local status_color="$NC"
            case "$status" in
                "In Progress") status_color="$GREEN" ;;
                "To Do") status_color="$CYAN" ;;
                "Done") status_color="$GREEN" ;;
            esac
            
            printf "%-20s %-50s ${priority_color}%-8s${NC} ${status_color}%-12s${NC} %-15s\n" \
                "$repo" \
                "${title:0:50}" \
                "$priority" \
                "$status" \
                "$category"
            ;;
        "brief")
            printf "%s: %s [%s] (%s)\n" "$repo" "$title" "$priority" "$status"
            ;;
        "json")
            printf '{"repo":"%s","title":"%s","priority":"%s","status":"%s","category":"%s","effort":"%s","created":"%s","file":"%s"}\n' \
                "$repo" "$title" "$priority" "$status" "$category" "$effort" "$created" "$file_path"
            ;;
    esac
}

# Show overview across all repositories
show_overview() {
    echo -e "${BOLD}=== Loqa Ecosystem - Backlog Overview ===${NC}\n"
    
    local total_tasks=0
    local total_in_progress=0
    local total_todo=0
    local total_done=0
    local total_p1=0
    local total_p2=0
    local total_p3=0
    
    for repo in "${REPOSITORIES[@]}"; do
        if ! check_repository "$repo"; then
            continue
        fi
        
        local repo_path="$PARENT_DIR/$repo"
        local tasks_path="$repo_path/backlog/tasks"
        
        if [[ ! -d "$tasks_path" ]]; then
            continue
        fi
        
        local repo_tasks=0
        local repo_in_progress=0
        local repo_todo=0
        local repo_done=0
        local repo_p1=0
        local repo_p2=0
        local repo_p3=0
        
        find "$tasks_path" -name "*.md" -type f 2>/dev/null | while read -r task_file; do
            if [[ -f "$task_file" ]]; then
                local task_data=$(parse_task_file "$task_file" "$repo")
                if [[ -n "$task_data" ]]; then
                    IFS=$'\t' read -r _ _ priority status _ _ _ _ <<< "$task_data"
                    
                    repo_tasks=$((repo_tasks + 1))
                    case "$status" in
                        "In Progress") repo_in_progress=$((repo_in_progress + 1)) ;;
                        "To Do") repo_todo=$((repo_todo + 1)) ;;
                        "Done") repo_done=$((repo_done + 1)) ;;
                    esac
                    
                    case "$priority" in
                        "P1"|"High") repo_p1=$((repo_p1 + 1)) ;;
                        "P2"|"Medium") repo_p2=$((repo_p2 + 1)) ;;
                        "P3"|"Low") repo_p3=$((repo_p3 + 1)) ;;
                    esac
                    
                    # Write to temp files to pass data out of subshell
                    echo "$repo_tasks" > "/tmp/backlog_${repo}_tasks"
                    echo "$repo_in_progress" > "/tmp/backlog_${repo}_in_progress"
                    echo "$repo_todo" > "/tmp/backlog_${repo}_todo"
                    echo "$repo_done" > "/tmp/backlog_${repo}_done"
                    echo "$repo_p1" > "/tmp/backlog_${repo}_p1"
                    echo "$repo_p2" > "/tmp/backlog_${repo}_p2"
                    echo "$repo_p3" > "/tmp/backlog_${repo}_p3"
                fi
            fi
        done
        
        # Read back from temp files
        if [[ -f "/tmp/backlog_${repo}_tasks" ]]; then
            repo_tasks=$(cat "/tmp/backlog_${repo}_tasks")
            repo_in_progress=$(cat "/tmp/backlog_${repo}_in_progress")
            repo_todo=$(cat "/tmp/backlog_${repo}_todo")
            repo_done=$(cat "/tmp/backlog_${repo}_done")
            repo_p1=$(cat "/tmp/backlog_${repo}_p1")
            repo_p2=$(cat "/tmp/backlog_${repo}_p2")
            repo_p3=$(cat "/tmp/backlog_${repo}_p3")
            
            # Clean up temp files
            rm -f "/tmp/backlog_${repo}"_*
        fi
        
        if [[ $repo_tasks -gt 0 ]]; then
            printf "%-25s ${BOLD}%3d${NC} tasks  ${GREEN}%2d${NC} in progress  ${CYAN}%2d${NC} to do  ${RED}%2d${NC} P1  ${YELLOW}%2d${NC} P2  ${BLUE}%2d${NC} P3\n" \
                "$repo:" "$repo_tasks" "$repo_in_progress" "$repo_todo" "$repo_p1" "$repo_p2" "$repo_p3"
        fi
        
        total_tasks=$((total_tasks + repo_tasks))
        total_in_progress=$((total_in_progress + repo_in_progress))
        total_todo=$((total_todo + repo_todo))
        total_done=$((total_done + repo_done))
        total_p1=$((total_p1 + repo_p1))
        total_p2=$((total_p2 + repo_p2))
        total_p3=$((total_p3 + repo_p3))
    done
    
    echo -e "\n${BOLD}=== TOTALS ===${NC}"
    printf "%-25s ${BOLD}%3d${NC} tasks  ${GREEN}%2d${NC} in progress  ${CYAN}%2d${NC} to do  ${RED}%2d${NC} P1  ${YELLOW}%2d${NC} P2  ${BLUE}%2d${NC} P3\n" \
        "All repositories:" "$total_tasks" "$total_in_progress" "$total_todo" "$total_p1" "$total_p2" "$total_p3"
    
    echo ""
}

# Show recommended next task
show_next_task() {
    echo -e "${BOLD}=== Recommended Next Task ===${NC}\n"
    
    local all_tasks=$(get_all_tasks false)
    
    if [[ -z "$all_tasks" ]]; then
        echo "No tasks found across all repositories."
        return 1
    fi
    
    # Priority order: In Progress P1 > To Do P1 > In Progress P2 > To Do P2 > etc.
    local next_task=""
    
    # First, look for In Progress P1 tasks
    next_task=$(echo "$all_tasks" | grep $'\tP1\tIn Progress\t' | head -n1 || echo "")
    
    if [[ -z "$next_task" ]]; then
        # Then look for To Do P1 tasks
        next_task=$(echo "$all_tasks" | grep $'\tP1\tTo Do\t' | head -n1 || echo "")
    fi
    
    if [[ -z "$next_task" ]]; then
        # Then In Progress P2 tasks
        next_task=$(echo "$all_tasks" | grep $'\tP2\tIn Progress\t' | head -n1 || echo "")
    fi
    
    if [[ -z "$next_task" ]]; then
        # Then To Do P2 tasks
        next_task=$(echo "$all_tasks" | grep $'\tP2\tTo Do\t' | head -n1 || echo "")
    fi
    
    if [[ -z "$next_task" ]]; then
        # Finally any other tasks
        next_task=$(echo "$all_tasks" | grep -v $'\tDone\t' | head -n1 || echo "")
    fi
    
    if [[ -n "$next_task" ]]; then
        IFS=$'\t' read -r repo title priority status category effort created file_path <<< "$next_task"
        
        echo -e "${BOLD}Repository:${NC} $repo"
        echo -e "${BOLD}Task:${NC} $title"
        echo -e "${BOLD}Priority:${NC} $priority"
        echo -e "${BOLD}Status:${NC} $status"
        echo -e "${BOLD}Category:${NC} $category"
        echo -e "${BOLD}Effort:${NC} $effort"
        echo -e "${BOLD}File:${NC} $file_path"
        
        echo -e "\n${BOLD}Recommended Actions:${NC}"
        echo "1. cd $PARENT_DIR/$repo"
        echo "2. Edit task: $file_path"
        if [[ "$status" == "To Do" ]]; then
            echo "3. Update status to 'In Progress'"
            echo "4. Create feature branch: git checkout -b feature/$(echo "$title" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | cut -c1-30)"
        fi
        echo ""
    else
        echo "No active tasks found. All done! 🎉"
    fi
}

# List all tasks with optional filters
list_tasks() {
    local priority_filter="${1:-}"
    local status_filter="${2:-}"
    local repo_filter="${3:-}"
    local format="${4:-table}"
    local include_done="${5:-false}"
    
    local all_tasks=$(get_all_tasks "$include_done")
    
    if [[ -z "$all_tasks" ]]; then
        echo "No tasks found."
        return 1
    fi
    
    # Apply filters
    local filtered_tasks="$all_tasks"
    
    if [[ -n "$priority_filter" ]]; then
        filtered_tasks=$(echo "$filtered_tasks" | grep $'\t'"$priority_filter"$'\t' || echo "")
    fi
    
    if [[ -n "$status_filter" ]]; then
        filtered_tasks=$(echo "$filtered_tasks" | grep $'\t'"$status_filter"$'\t' || echo "")
    fi
    
    if [[ -n "$repo_filter" ]]; then
        filtered_tasks=$(echo "$filtered_tasks" | grep "^$repo_filter"$'\t' || echo "")
    fi
    
    if [[ -z "$filtered_tasks" ]]; then
        echo "No tasks match the specified filters."
        return 1
    fi
    
    # Sort tasks
    local sorted_tasks=$(sort_tasks "$filtered_tasks")
    
    if [[ "$format" == "table" ]]; then
        echo -e "${BOLD}Repository          Task                                             Priority Status       Category       ${NC}"
        echo "==================== ================================================ ======== ============ ==============="
    fi
    
    local count=0
    while IFS= read -r task; do
        if [[ -n "$task" ]]; then
            format_task "$format" "$task"
            count=$((count + 1))
        fi
    done <<< "$sorted_tasks"
    
    if [[ "$format" == "table" ]]; then
        echo ""
        echo "Total: $count tasks"
    fi
}

# Main function
main() {
    local command="${1:-overview}"
    shift || true
    
    case "$command" in
        "overview")
            show_overview
            ;;
        "list")
            local priority=""
            local status=""
            local repo=""
            local format="table"
            local include_done="false"
            
            while [[ $# -gt 0 ]]; do
                case $1 in
                    --priority=*)
                        priority="${1#*=}"
                        ;;
                    --status=*)
                        status="${1#*=}"
                        ;;
                    --repo=*)
                        repo="${1#*=}"
                        ;;
                    --format=*)
                        format="${1#*=}"
                        ;;
                    --include-done)
                        include_done="true"
                        ;;
                    *)
                        echo "Unknown option: $1"
                        usage
                        exit 1
                        ;;
                esac
                shift
            done
            
            list_tasks "$priority" "$status" "$repo" "$format" "$include_done"
            ;;
        "next")
            show_next_task
            ;;
        "stats")
            show_overview
            echo -e "${BOLD}=== Recent Tasks ===${NC}\n"
            list_tasks "" "" "" "brief" "false" | head -20
            ;;
        "repo")
            local repo_name="$1"
            if [[ -z "$repo_name" ]]; then
                echo "Error: Repository name required"
                usage
                exit 1
            fi
            list_tasks "" "" "$repo_name" "table" "false"
            ;;
        "search")
            local search_term="$1"
            if [[ -z "$search_term" ]]; then
                echo "Error: Search term required"
                usage
                exit 1
            fi
            local all_tasks=$(get_all_tasks false)
            if [[ -n "$all_tasks" ]]; then
                echo "$all_tasks" | grep -i "$search_term" | while IFS= read -r task; do
                    if [[ -n "$task" ]]; then
                        format_task "table" "$task"
                    fi
                done
            fi
            ;;
        "priority")
            local priority_level="$1"
            if [[ -z "$priority_level" ]]; then
                echo "Error: Priority level required (P1, P2, P3)"
                usage
                exit 1
            fi
            list_tasks "$priority_level" "" "" "table" "false"
            ;;
        "help"|"--help"|"-h")
            usage
            ;;
        *)
            echo "Unknown command: $command"
            usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"