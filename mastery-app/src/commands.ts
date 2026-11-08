// @ts-nocheck
// Claude Code commands, taken from Anthropic's Commands reference (code.claude.com/docs/en/commands), read on 8 November 2026.
// Descriptions are Anthropic's, with links removed. Groups are this workspace's own, for browsing.
export const COMMANDS_CHECKED = "8 November 2026";
export const COMMAND_GROUPS = ["Start & set up", "Context & conversation", "Model & effort", "Review & ship", "Sessions & background work", "Skills, plugins & agents", "Create with Claude", "Account & usage", "Help & troubleshooting", "Interface"];
export const COMMANDS = [
{
"c": "/add-dir <path>",
"k": "Built-in",
"g": "Start & set up",
"d": "Add a working directory for file access during the current session. Type a partial path to see matching directory suggestions; press Tab to accept one. Most .claude/ configuration isn't discovered from the added directory. You can't add most network paths, such as \\\\server\\share. After a successful add, your DirectoryAdded hooks run. When you run it while Claude is responding, Claude Code asks you to confirm the directory right away, and once you confirm, Claude's next tool call in the same turn can access it. Before v2.1.234, Claude Code queued the command until the turn finished"
},
{
"c": "/advisor [model|off]",
"k": "Built-in",
"g": "Model & effort",
"d": "Enable or disable the advisor tool, which consults a second model for guidance at key moments during a task. Accepts fable, opus, sonnet, or a full model ID. fable requires Fable access. Without an argument, opens a picker. In a session without an interactive terminal, or over Remote Control, pass the model or off as an argument; with no argument there, the command prints the current advisor as text. These forms require Claude Code v2.1.260 or later"
},
{
"c": "/agents",
"k": "Built-in",
"g": "Skills, plugins & agents",
"d": "Print a reminder to ask Claude to create or manage subagents, or to edit .claude/agents/ or ~/.claude/agents/ directly. On v2.1.197 and earlier, opens an interactive interface for creating and managing subagent configurations"
},
{
"c": "/artifact-capabilities",
"k": "Skill",
"g": "Create with Claude",
"d": "Load the reference for the runtime capabilities a published artifact can use, such as calling your connectors or offering a file download, including which ones your account has. Claude normally loads it on its own before building a page that uses one. Available where artifacts are"
},
{
"c": "/artifact-diagramming",
"k": "Skill",
"g": "Create with Claude",
"d": "Load diagramming guidance for Claude to follow in artifacts: when a diagram helps, what to draw, and how to write inline SVG that stays legible in light and dark themes. Requires Claude Code v2.1.221 or later"
},
{
"c": "/artifacts",
"k": "Built-in",
"g": "Create with Claude",
"d": "List the artifacts you own or that are shared with you, then attach one to the session, open it in your browser, or copy its link. Available where artifacts are. Requires Claude Code v2.1.208 or later; attaching with Enter requires v2.1.216"
},
{
"c": "/auto-mode-setup",
"k": "Built-in",
"g": "Start & set up",
"d": "Draft autoMode.environment entries from your project and recent sessions, then review the draft and save it to your user settings. Requires a Pro, Max, or Team plan and Claude Code v2.1.228 or later. On native Windows, requires v2.1.233 or later"
},
{
"c": "/autocompact [auto|<tokens>]",
"k": "Built-in",
"g": "Context & conversation",
"d": "Set the auto-compact window: how full the context window gets before Claude Code compacts automatically. Pass a size such as 500k, or auto to return to the window tuned for your model. Claude Code saves the value to user settings and applies it to the current session. See Set the auto-compact window for accepted values and what overrides it. Without an argument, opens a dialog that shows the current window. Requires Claude Code v2.1.221 or later"
},
{
"c": "/autofix-pr [prompt]",
"k": "Built-in",
"g": "Review & ship",
"d": "Spawn a cloud session that watches the current branch's PR and pushes fixes when CI fails or reviewers leave comments. Detects the open PR from your checked-out branch with gh pr view; to watch a different PR, check out its branch first. By default the cloud session is told to fix every CI failure and review comment; pass a prompt to give it different instructions, for example /autofix-pr only fix lint and type errors. Requires the gh CLI and access to cloud sessions"
},
{
"c": "/background [prompt]",
"k": "Built-in",
"g": "Sessions & background work",
"d": "Detach the current session to run as a background agent and free this terminal. Pass a prompt to send one more instruction before detaching. Monitor the session with claude agents. To copy the conversation into a new background session while this one keeps running, use /fork. Alias: /bg"
},
{
"c": "/batch <instruction>",
"k": "Skill",
"g": "Review & ship",
"d": "Orchestrate large-scale changes across a codebase in parallel. Researches the codebase, decomposes the work into 5 to 30 independent units, and presents a plan. Once approved, spawns one background subagent per unit in an isolated worktree. Each subagent implements its unit, runs tests, and publishes its change. Requires a git repository or a WorktreeCreate hook that creates the worktrees. Outside a git repository, /batch requires Claude Code v2.1.281 or later. Example: /batch migrate src/ from JavaScript to TypeScript"
},
{
"c": "/branch [name]",
"k": "Built-in",
"g": "Context & conversation",
"d": "Create a branch of the current conversation at this point, so you can try a different direction without losing the conversation as it stands. Switches you into the branch and preserves the original, which you can return to with /resume. To run a copy as a separate background session instead of switching into it, use /fork; to hand a side task to a subagent that reports back into this conversation, use /subtask"
},
{
"c": "/btw [question]",
"k": "Built-in",
"g": "Context & conversation",
"d": "Ask a side question about the current session without adding to the conversation. If you run /btw without a question, Claude Code shows your most recent side question so you can browse earlier answers; if you haven't asked one yet, Claude Code prints a usage line"
},
{
"c": "/bug [report]",
"k": "Built-in",
"g": "Help & troubleshooting",
"d": "Report a bug or share your conversation. You choose how much session history to include and confirm on a consent screen before anything is sent. When you're signed in to Anthropic on a first-party connection, the report goes to Anthropic; on a third-party provider, or without Anthropic credentials, Claude Code writes the report to a local archive under ~/.claude/feedback-bundles/ that you forward yourself. In the VS Code extension, /bug opens the extension's own feedback dialog instead; requires Claude Code v2.1.229 or later. When you run it while Claude is responding, Claude Code opens the dialog immediately. Before v2.1.232, Claude Code queued the command until the turn finished. Alias: /share. Before v2.1.212, /bug and /share were aliases of /feedback"
},
{
"c": "/cd <path>",
"k": "Built-in",
"g": "Start & set up",
"d": "Move this session to a new working directory, keeping the conversation. Type a partial path to see matching directory suggestions; press Tab to accept one. For what Claude Code applies from the new directory as soon as you move, and how /cd differs from /add-dir, see Move the session to another directory"
},
{
"c": "/chrome",
"k": "Built-in",
"g": "Start & set up",
"d": "Configure Claude in Chrome settings"
},
{
"c": "/claude-api [migrate|upgrade|managed-agents-onboard|prompt-audit|cost-optimize|build-eval|hillclimb|preserved-thinking-migration]",
"k": "Skill",
"g": "Create with Claude",
"d": "Load Claude API and Managed Agents reference material for your project's language. Also activates automatically when your code imports anthropic or @anthropic-ai/sdk. For what each subcommand does and the version it requires, see Work on Claude API projects"
},
{
"c": "/claude-in-chrome [task]",
"k": "Skill",
"g": "Create with Claude",
"d": "Have Claude carry out a task in your browser, such as testing a page, filling a form, or reading console logs, through Claude in Chrome. Available when Chrome integration is enabled for the session, for example with claude --chrome, or when Claude Code can offer to install the extension"
},
{
"c": "/clear [name]",
"k": "Built-in",
"g": "Context & conversation",
"d": "Start a new conversation with empty context. Pass a name to label the previous conversation in the /resume picker. To free up context while continuing the same conversation, use /compact instead. Resume the previous conversation with /resume, or, in the same Claude Code process, restore it from the rewind menu's previous-session entry. Aliases: /reset, /new"
},
{
"c": "/code-review [low|medium|high|xhigh|max|ultra] [--fix] [--comment] [--max-findings n|all|default] [pr#|branch|path]",
"k": "Skill",
"g": "Review & ship",
"d": "Review the current diff, or a PR number, branch, or path you pass, for correctness bugs. Depending on your model and effort level, the review also covers cleanup opportunities. Pass --fix to have Claude apply the findings, --comment to post them on the GitHub PR or GitLab merge request, or ultra to run a deep cloud review. Posting to a GitLab merge request requires Claude Code v2.1.257 or later. With ultra on a github.com PR target, pass --post to preselect posting the finished findings to the PR in the launch dialog; --post requires Claude Code v2.1.227 or later. See Review locally with /code-review for the effort levels, targeting, and how it relates to /simplify. Alias: /review"
},
{
"c": "/color [color|default]",
"k": "Built-in",
"g": "Interface",
"d": "Set the prompt bar color for the current session. Available colors: red, blue, green, yellow, purple, orange, pink, cyan. Use default to reset, or run with no argument to pick a random color. When Remote Control is connected, the color syncs to claude.ai/code. Also available in non-interactive mode (-p)"
},
{
"c": "/compact [instructions]",
"k": "Built-in",
"g": "Context & conversation",
"d": "Free up context by summarizing the conversation so far. Optionally pass focus instructions for the summary. See how compaction handles rules, skills, and memory files"
},
{
"c": "/config [key=value ...]",
"k": "Built-in",
"g": "Start & set up",
"d": "Open the Settings interface to adjust theme, model, output style, and other preferences. Pass one or more key=value pairs to set a setting directly without opening the interface, for example /config thinking=false, /config theme=dark, or /config model=sonnet. The key=value form also works in non-interactive mode (-p) and from the Claude mobile app via Remote Control. The key=value form can't turn on a setting that needs your confirmation in the panel, such as autoContinueAtUsageLimit, though it can turn one off. Run /config --help to list the keys it accepts. Alias: /settings"
},
{
"c": "/context [all]",
"k": "Built-in",
"g": "Context & conversation",
"d": "Visualize current context usage as a colored grid. Shows optimization suggestions for context-heavy tools, memory bloat, and capacity warnings. When the conversation exceeds the context window, the output includes a warning showing how far over the limit you are and which command frees space. In fullscreen mode, /context collapses the per-item breakdown to keep the grid visible. Pass all to expand it"
},
{
"c": "/copy [N]",
"k": "Built-in",
"g": "Context & conversation",
"d": "Copy the last assistant response to clipboard. Pass a number N to copy the Nth-latest response: /copy 2 copies the second-to-last. When code blocks or blockquotes are present, shows an interactive picker to select individual blocks or the full response. Press w in the picker to write the selection to a file instead of the clipboard, which is useful over SSH"
},
{
"c": "/cost",
"k": "Built-in",
"g": "Account & usage",
"d": "Alias for /usage"
},
{
"c": "/dataviz [request]",
"k": "Skill",
"g": "Create with Claude",
"d": "Design guidance for charts, graphs, and dashboards. Claude picks the chart form for the data, assigns color by role, validates the palette for colorblind safety and contrast with a bundled script, and applies mark, interaction, and accessibility rules. Uses a brand-neutral placeholder palette that you replace with your own"
},
{
"c": "/debug [description]",
"k": "Skill",
"g": "Help & troubleshooting",
"d": "Enable debug logging for the current session and troubleshoot issues by reading the session debug log. Debug logging is off by default unless you started with claude --debug, so running /debug mid-session starts capturing logs from that point forward. Optionally describe the issue to focus the analysis"
},
{
"c": "/deep-research <question>",
"k": "Workflow",
"g": "Create with Claude",
"d": "Fan out web searches on a question, fetch and cross-check sources, and synthesize a cited report"
},
{
"c": "/design [brief]",
"k": "Skill",
"g": "Create with Claude",
"d": "Draft UI mockups, screen flows, landing pages, or posters as artboards on one canvas, published as a Claude Design artifact, for example /design a settings screen for a mobile banking app. You edit the artboards in a desktop browser, and your edits save automatically. You can export each artboard as PNG or PDF. Requires Claude Code v2.1.265 or later, a session where artifacts are available, and an account where the Design template is available; if your organization has turned that template off, /design doesn't draft designs. Available on the Anthropic API. On Amazon Bedrock, Google Cloud's Agent Platform, Microsoft Foundry, and Claude Platform on AWS, artifacts aren't available, so the command is unavailable there"
},
{
"c": "/design-login",
"k": "Built-in",
"g": "Create with Claude",
"d": "Authorize design-system access for /design-sync with your claude.ai account"
},
{
"c": "/design-sync [hint]",
"k": "Skill",
"g": "Create with Claude",
"d": "Convert your repo's React design system and upload it to Claude Design, so designs it produces use your real components. Optionally name the design system, for example /design-sync Acme DS. A first-time sync verifies every component and can take a few hours on a large repo. Available on the Anthropic API. It needs claude.ai, which the CLI doesn't contact on Amazon Bedrock, Google Cloud's Agent Platform, Microsoft Foundry, or Claude Platform on AWS, or through a Claude apps gateway, so the command is unavailable there"
},
{
"c": "/desktop",
"k": "Built-in",
"g": "Sessions & background work",
"d": "Continue the current session in the Claude Code Desktop app. Requires macOS or x64 Windows and a Claude subscription. Alias: /app"
},
{
"c": "/diff",
"k": "Built-in",
"g": "Review & ship",
"d": "Review the changes in your working tree, including the edits Claude has made so far. See Review changes with /diff"
},
{
"c": "/doctor [prompt-audit [path]]",
"k": "Skill",
"g": "Help & troubleshooting",
"d": "Run a setup checkup that diagnoses installation, settings, extension, and CLAUDE.md problems and proposes fixes that Claude applies after you confirm. For what the checkup covers, or to audit your instructions with prompt-audit instead, see Check your setup with /doctor. The prompt-audit subcommand requires Claude Code v2.1.283 or later. Alias: /checkup"
},
{
"c": "/effort [level|auto|status|ultracode [on|off]]",
"k": "Built-in",
"g": "Model & effort",
"d": "Set the effort level: low to xhigh, max, or auto; status prints it. ultracode or ultracode on turns ultracode on for the session at the current level, and ultracode off turns it off; the ultracode key persists. max is session-only. The on and off arguments and keeping the current level require Claude Code v2.1.284 or later. Before v2.1.284, /effort ultracode set the session to xhigh, and /effort ultracode off failed with Invalid argument. Run it while Claude is responding and, once you confirm the cache warning, if Claude Code shows one, Claude Code applies the new level to the next request in that turn. Before v2.1.242, Claude Code decided from a feature flag it fetched from Anthropic whether to run the command mid-turn or queue it until the turn finished, and always queued it in a session that doesn't fetch feature flags, such as on a third-party provider. Works in -p"
},
{
"c": "/exit",
"k": "Built-in",
"g": "Sessions & background work",
"d": "Exit the CLI. In an attached background session, this detaches and the session keeps running. Alias: /quit"
},
{
"c": "/export [filename]",
"k": "Built-in",
"g": "Context & conversation",
"d": "Export the current conversation as plain text. With a filename, writes directly to that file. Without, opens a dialog to copy to clipboard or save to a file"
},
{
"c": "/fast [on|off]",
"k": "Built-in",
"g": "Model & effort",
"d": "Toggle fast mode on or off. Run it while Claude is responding and Claude Code toggles fast mode without waiting for the turn to end, though the running turn finishes at its original speed. Before v2.1.242, Claude Code decided from a feature flag it fetched from Anthropic whether to run the command mid-turn or queue it until the turn finished, and always queued it in a session that doesn't fetch feature flags. Availability in non-interactive mode with -p is limited; see Toggle fast mode"
},
{
"c": "/feedback [report]",
"k": "Built-in",
"g": "Help & troubleshooting",
"d": "Send product feedback about Claude Code. Opens the same dialog as /bug, with the same consent step, sending rules, and mid-turn behavior. In sessions with Claude-drafted feedback, /feedback with no argument opens the drafts queue instead, where you review, edit, send, or discard the drafts Claude queued; the queue includes an option to write a new report in the dialog. With an argument, and for /bug always, the dialog opens directly"
},
{
"c": "/fewer-permission-prompts",
"k": "Skill",
"g": "Start & set up",
"d": "Scan your transcripts for common read-only Bash and MCP tool calls, then add a prioritized allowlist to project .claude/settings.json to reduce permission prompts"
},
{
"c": "/focus",
"k": "Built-in",
"g": "Interface",
"d": "Toggle the focus view, which shows only your last prompt, a one-line tool-call summary with edit diffstats, and the final response. The tool-call summary also counts the subagents launched in the turn and collapses completed background-task notifications into a single count. The selection persists across sessions; set viewMode in settings to override it. Only available in fullscreen rendering. From a Remote Control client, run /focus [on|off] to turn the focus view on or off for the current session only, without changing your saved selection; this requires Claude Code v2.1.281 or later. The VS Code extension offers its own Focus view as a command-menu toggle, stored as an extension setting, independent of viewMode"
},
{
"c": "/fork [prompt]",
"k": "Built-in",
"g": "Sessions & background work",
"d": "Copy the current conversation into a new background session and keep working here. Pass a prompt and the copy starts working on it immediately; without one it waits in agent view for its first prompt. Except when the copy edits in place, Claude Code instructs it to create a worktree of its own before making code changes; the isolation instruction requires Claude Code v2.1.221 or later. To hand a side task to a subagent whose result comes back into this conversation, use /subtask; to switch into a copy yourself, use /branch. When agent view is turned off, /fork starts a forked subagent instead"
},
{
"c": "/goal [condition|clear]",
"k": "Built-in",
"g": "Context & conversation",
"d": "Set a goal: Claude keeps working across turns until the condition is met or the goal clears for another reason. With no argument, shows the current or most recently achieved goal. clear, stop, off, reset, none, or cancel removes an active goal early"
},
{
"c": "/heapdump",
"k": "Built-in",
"g": "Help & troubleshooting",
"d": "Write a JavaScript heap snapshot and a memory breakdown to ~/Desktop, or your home directory on Linux without a Desktop folder, for diagnosing high memory usage. Attach only the -diagnostics.json file when reporting a memory issue; the .heapsnapshot contains your full conversation and credentials, so don't share it. Hidden from the command menu; type it in full. See what to do with the output"
},
{
"c": "/help",
"k": "Built-in",
"g": "Help & troubleshooting",
"d": "Show help and available commands"
},
{
"c": "/hooks",
"k": "Built-in",
"g": "Start & set up",
"d": "View hook configurations"
},
{
"c": "/ide",
"k": "Built-in",
"g": "Start & set up",
"d": "Manage IDE integrations and show status"
},
{
"c": "/import [codex|gemini|cursor] [--dry-run] [--yes]",
"k": "Built-in",
"g": "Start & set up",
"d": "Bring configuration from OpenAI Codex, Google Gemini CLI, or Cursor on your machine into Claude Code, including instruction files, MCP servers, commands, subagents, and skills. In non-interactive mode with -p, /import lists what it found and gives you the command that confirms the import. Add --dry-run to preview without writing anything, or --yes to skip the interactive picker. Not available on Amazon Bedrock, Google Cloud's Agent Platform, Microsoft Foundry, or Claude Platform on AWS, or through a Claude apps gateway. Also unavailable when you turn off feature-flag fetching. Importing from Cursor requires v2.1.265 or later"
},
{
"c": "/init",
"k": "Built-in",
"g": "Start & set up",
"d": "Initialize project with a CLAUDE.md guide. Set CLAUDE_CODE_NEW_INIT=1 for an interactive flow that also walks through skills, hooks, and personal memory files. If /init finds OpenAI Codex or Google Gemini CLI configuration, it offers to carry it over with /import"
},
{
"c": "/insights",
"k": "Built-in",
"g": "Help & troubleshooting",
"d": "Generate an HTML report analyzing your recent sessions on this machine: which projects you work in, how you use Claude Code, where things go wrong, and features to try. Not available in cloud sessions. See Analyze your usage patterns for the report location, retention, and cost"
},
{
"c": "/install-github-app",
"k": "Built-in",
"g": "Start & set up",
"d": "Install the Claude GitHub App for a repository, with an optional step to set up GitHub Actions workflows and secrets. Walks you through selecting a repo and configuring the integration. Works only with github.com repositories. When your repository's git remote is on gitlab.com or bitbucket.org, the command prints a notice and exits instead of starting setup. To run Claude Code from GitLab pipelines, see GitLab CI/CD"
},
{
"c": "/install-slack-app",
"k": "Built-in",
"g": "Start & set up",
"d": "Install the Claude Slack app. Opens a browser to complete the OAuth flow"
},
{
"c": "/keybindings",
"k": "Built-in",
"g": "Start & set up",
"d": "Open your keyboard shortcuts file"
},
{
"c": "/list-agents",
"k": "Built-in",
"g": "Sessions & background work",
"d": "List the subagents, agent team teammates, and other Claude Code sessions Claude can message, with the name to use for each. See cross-session messaging. Also available as /peers. Requires Claude Code v2.1.224 or later; earlier versions report Unknown command: /list-agents. Teammate rows and the first line showing this session's own name require v2.1.239 or later. Available only in sessions where cross-session messaging is enabled"
},
{
"c": "/login",
"k": "Built-in",
"g": "Account & usage",
"d": "Sign in to your Anthropic account"
},
{
"c": "/logout",
"k": "Built-in",
"g": "Account & usage",
"d": "Sign out from your Anthropic account"
},
{
"c": "/loop [interval] [prompt]",
"k": "Skill",
"g": "Sessions & background work",
"d": "Run a prompt repeatedly while the session stays open. Omit the interval and Claude self-paces between iterations. Omit the prompt and Claude runs the built-in maintenance prompt or your loop.md. Example: /loop 5m check if the deploy finished. See Run prompts on a schedule. Alias: /proactive"
},
{
"c": "/mcp [reconnect (<server>|all)|enable|disable [<server>|all]]",
"k": "Built-in",
"g": "Start & set up",
"d": "Manage MCP server connections and OAuth authentication. Run with no argument to open the interactive list, or pass reconnect, enable, or disable with a server name or all to change connection state without opening it. reconnect all retries every server that failed or needs authentication. In non-interactive mode (-p), running it with no argument prints a text summary of server status instead of opening the list"
},
{
"c": "/memory",
"k": "Built-in",
"g": "Start & set up",
"d": "Edit CLAUDE.md files, enable or disable auto memory, and view auto memory entries"
},
{
"c": "/mobile",
"k": "Built-in",
"g": "Sessions & background work",
"d": "Show QR code to download the Claude mobile app. Aliases: /ios, /android"
},
{
"c": "/model [model]",
"k": "Built-in",
"g": "Model & effort",
"d": "Switch the AI model and save it as your default for new sessions. For models that support it, use left/right arrows to adjust effort level. With no argument, opens a picker; press s on a row to switch for the current session only. See when Claude Code asks you to confirm the switch. Once you confirm the switch, if Claude Code asks, Claude Code applies the change without waiting for the current response to finish. Before v2.1.242, Claude Code decided from a feature flag it fetched from Anthropic whether to run the command mid-turn or queue it until the turn finished, and always queued it in a session that doesn't fetch feature flags, such as on a third-party provider. Also available in non-interactive mode (-p) with a model argument instead of the picker, where it applies to the current session only and isn't saved as your default; requires Claude Code v2.1.205 or later"
},
{
"c": "/output-style [style]",
"k": "Built-in",
"g": "Model & effort",
"d": "List output styles or switch to one, for example /output-style concise. See Change your output style. Requires Claude Code v2.1.269 or later"
},
{
"c": "/passes",
"k": "Built-in",
"g": "Account & usage",
"d": "Share a free week of Claude Code with friends. Only visible if your account is eligible"
},
{
"c": "/permissions",
"k": "Built-in",
"g": "Start & set up",
"d": "Manage allow, ask, and deny rules for tool permissions. Opens an interactive dialog where you can view rules by scope, add or remove rules, manage working directories, and review recent auto mode denials. You can also view and edit auto mode classifier rules from the dialog's **Auto mode** tab. When you run it while Claude is responding, Claude Code opens the dialog immediately and applies your changes starting with Claude's next tool call in the same turn. Before v2.1.234, Claude Code queued the command until the turn finished. Alias: /allowed-tools"
},
{
"c": "/plan [description]",
"k": "Built-in",
"g": "Model & effort",
"d": "Enter plan mode directly from the prompt. Pass an optional description to enter plan mode and immediately start with that task, for example /plan fix the auth bug"
},
{
"c": "/plugin [subcommand]",
"k": "Built-in",
"g": "Skills, plugins & agents",
"d": "Manage Claude Code plugins. Run with no argument to open the plugin menu, or pass a subcommand such as list, install, enable, or disable to act directly. Claude Code can activate a plugin during the install; the install summary tells you whether it did or whether to run /reload-plugins"
},
{
"c": "/plugin-authoring",
"k": "Built-in",
"g": "Skills, plugins & agents",
"d": "Load the reference Claude works from to write a mod. Claude can load it on its own when you ask for a mod. This is a skill from a built-in plugin, which you can turn off in /plugin. Requires Claude Code v2.1.287 or later"
},
{
"c": "/powerup",
"k": "Built-in",
"g": "Help & troubleshooting",
"d": "Discover Claude Code features through quick interactive lessons with animated demos"
},
{
"c": "/pr-comments [PR]",
"k": "Removed",
"g": "Interface",
"d": "Removed in v2.1.91. Ask Claude directly to view pull request comments instead. On earlier versions, fetches and displays comments from a GitHub pull request; automatically detects the PR for the current branch, or pass a PR URL or number. Requires the gh CLI"
},
{
"c": "/privacy-settings",
"k": "Built-in",
"g": "Account & usage",
"d": "View and update your privacy settings. Only available for Pro and Max plan subscribers"
},
{
"c": "/radio",
"k": "Built-in",
"g": "Interface",
"d": "Open Claude FM lo-fi radio in your browser. Prints the stream URL when no browser is available"
},
{
"c": "/rate-limit-options",
"k": "Built-in",
"g": "Account & usage",
"d": "Show ways to keep working when a claude.ai usage limit blocks a request: wait and continue automatically when the limit resets, add usage credits, or upgrade your plan. Claude Code can also open this menu on its own when you hit a limit at your own terminal. See Turn automatic continue off. Requires a claude.ai subscription. The wait-and-continue rows require Claude Code v2.1.234 or later"
},
{
"c": "/recap",
"k": "Built-in",
"g": "Context & conversation",
"d": "Generate a one-line summary of the current session on demand. See Session recap for the automatic recap that appears after you've been away"
},
{
"c": "/release-notes",
"k": "Built-in",
"g": "Help & troubleshooting",
"d": "View the changelog in an interactive version picker. Select a specific version to see its release notes, or choose to show all versions. The notes appear in your transcript without entering the conversation Claude sees"
},
{
"c": "/reload-plugins [--force]",
"k": "Built-in",
"g": "Skills, plugins & agents",
"d": "Reload all active plugins to apply pending changes without restarting. Reports counts for each reloaded component and flags any load errors. When the reload would change which MCP tools are loaded and invalidate the prompt cache, the command warns and skips unless you pass --force. Also available in non-interactive mode (-p), the Agent SDK, and the desktop app, where it runs only on input typed directly into the session and doesn't apply plugin MCP server changes; requires Claude Code v2.1.260 or later. See Apply plugin changes without restarting"
},
{
"c": "/reload-skills",
"k": "Built-in",
"g": "Skills, plugins & agents",
"d": "Re-scan skill and command directories so skills added or changed on disk during the session become available without restarting. Reports how many skills are available and how many were added or removed"
},
{
"c": "/remote-control",
"k": "Built-in",
"g": "Sessions & background work",
"d": "Make this session available for Remote Control from claude.ai. Running it while signed out prints that Remote Control requires a claude.ai subscription and tells you how to sign in. Alias: /rc"
},
{
"c": "/remote-env",
"k": "Built-in",
"g": "Start & set up",
"d": "Choose the default cloud environment for cloud sessions you start from the CLI"
},
{
"c": "/rename [name]",
"k": "Built-in",
"g": "Context & conversation",
"d": "Rename the current session and show the name on the prompt bar. Without a name, auto-generates one from conversation history. Also available in non-interactive mode (-p). From every rename surface, including claude.ai and the desktop app, Claude Code replaces control and invisible characters in the new name with spaces and caps the name at 200 characters. If the name is empty once invisible characters are removed, Claude Code rejects it and shows That name is empty once invisible characters are removed. Usage: /rename <name>. The character replacement and length cap require Claude Code v2.1.221 or later"
},
{
"c": "/resume [session]",
"k": "Built-in",
"g": "Sessions & background work",
"d": "Resume a conversation by ID or name, or open the session picker. Background sessions appear in the picker marked with bg. Resuming one that is still running, from the picker or by ID or name, opens that session: your current conversation moves to the background and this terminal attaches to the running one. Press ← on an empty prompt to return to agent view, which also lists the conversation you left. Before v2.1.285, Claude Code refused and told you to open the session with claude attach or stop it first. Alias: /continue"
},
{
"c": "/review [low|medium|high|xhigh|max|ultra] [--fix] [--comment] [--max-findings n|all|default] [pr#|branch|path]",
"k": "Built-in",
"g": "Review & ship",
"d": "Alias of /code-review: reviews the current diff, or a PR number, branch, or path you pass, such as /review 1234, and takes the same effort levels and flags. With no level given, the review reuses the last low through max level you typed; see Review locally with /code-review for the exact rules. For a deep cloud review, use /code-review ultra. Before v2.1.223, /review was a separate command that ran a single-pass, read-only review of a GitHub pull request by number, listing open PRs to pick from when run with no argument; from v2.1.186 through v2.1.201, it ran the same multi-agent engine as /code-review medium"
},
{
"c": "/rewind",
"k": "Built-in",
"g": "Context & conversation",
"d": "Rewind the conversation and/or code to a previous point, or summarize from a selected message. See checkpointing. Aliases: /checkpoint, /undo"
},
{
"c": "/run",
"k": "Skill",
"g": "Review & ship",
"d": "Launch and drive your project's app to see a change working, not only passing tests. See Run and verify your app"
},
{
"c": "/run-skill-generator",
"k": "Skill",
"g": "Review & ship",
"d": "Teach /run and /verify how to build, launch, and drive your project's app from a clean environment by writing a per-project skill"
},
{
"c": "/sandbox",
"k": "Built-in",
"g": "Start & set up",
"d": "Toggle sandbox mode. Available on supported platforms only"
},
{
"c": "/schedule [description]",
"k": "Built-in",
"g": "Sessions & background work",
"d": "Create, update, list, or run routines, which execute in the cloud. Claude walks you through the setup conversationally. You can also ask about a routine's recent runs. Alias: /routines"
},
{
"c": "/scroll-speed",
"k": "Built-in",
"g": "Interface",
"d": "Adjust mouse wheel scroll speed interactively. Available in fullscreen rendering only and not in the JetBrains IDE terminal"
},
{
"c": "/security-review",
"k": "Built-in",
"g": "Review & ship",
"d": "Analyze the changes on your current branch for security vulnerabilities. Reviews the diff between your branch and origin's default branch, identifying risks like injection, auth issues, and data exposure. Needs an origin remote; if the review fails with an ambiguous argument error, see the error reference"
},
{
"c": "/setup-bedrock",
"k": "Built-in",
"g": "Start & set up",
"d": "Configure Amazon Bedrock authentication, region, and model pins through an interactive wizard. Hidden from the command menu until CLAUDE_CODE_USE_BEDROCK=1 is set; type it in full. First-time Amazon Bedrock users can also access this wizard from the login screen"
},
{
"c": "/setup-vertex",
"k": "Built-in",
"g": "Start & set up",
"d": "Configure Google Cloud's Agent Platform authentication, project, region, and model pins through an interactive wizard. Hidden from the command menu until CLAUDE_CODE_USE_VERTEX=1 is set; type it in full. First-time Google Cloud's Agent Platform users can also access this wizard from the login screen"
},
{
"c": "/simplify [target]",
"k": "Skill",
"g": "Review & ship",
"d": "Review the changed code for cleanup opportunities and apply the fixes. Four review agents run in parallel, covering reuse of existing helpers, simplification, efficiency, and whether the change is at the right level of abstraction. The review doesn't look for correctness bugs. Use /code-review to find bugs. Pass a path or PR reference to review a specific target"
},
{
"c": "/skill-doctor",
"k": "Built-in",
"g": "Skills, plugins & agents",
"d": "Show what each of your skills costs in context and how often it gets used, so you can find skills to turn off. Requires Claude Code v2.1.252 or later and feature-flag fetching"
},
{
"c": "/skills",
"k": "Built-in",
"g": "Skills, plugins & agents",
"d": "List available skills. Type to filter the list by name, description, or source. Press t to sort by token count, Space or Enter to cycle a skill's visibility to Claude and the / menu, and Esc to save and close. You can't cycle plugin skills, skills whose frontmatter sets disable-model-invocation: true, or skills with a skillOverrides entry in managed settings or the --settings flag"
},
{
"c": "/slides [brief]",
"k": "Skill",
"g": "Create with Claude",
"d": "Make a new presentation as a Claude Slides artifact filled from your brief, for example /slides a quarterly review of the platform team. Requires Claude Code v2.1.265 or later, a session where artifacts are available, and an account where the Slides template is available; otherwise the command doesn't appear. Available on the Anthropic API. On Amazon Bedrock, Google Cloud's Agent Platform, Microsoft Foundry, and Claude Platform on AWS, artifacts aren't available, so the command is unavailable there"
},
{
"c": "/stats",
"k": "Built-in",
"g": "Account & usage",
"d": "Alias for /usage. Opens on the Stats tab"
},
{
"c": "/status",
"k": "Built-in",
"g": "Account & usage",
"d": "Open the Settings interface on the Status tab, showing version, model, account, and connectivity. A Session kind row reads background job · attached or background job · unattended in a background session, depending on whether a terminal is attached, and interactive in any other session. Before v2.1.221, /status didn't show this row. Works while Claude is responding"
},
{
"c": "/statusline",
"k": "Built-in",
"g": "Start & set up",
"d": "Configure Claude Code's status line. Describe what you want, or run without arguments to auto-configure from your shell prompt"
},
{
"c": "/stickers",
"k": "Built-in",
"g": "Interface",
"d": "Order Claude Code stickers"
},
{
"c": "/stop",
"k": "Built-in",
"g": "Sessions & background work",
"d": "Stop the background session you're attached to, or the one you send it to as a peek reply; the transcript and any worktree are kept. To detach without stopping, use /exit or press ←"
},
{
"c": "/subtask <task>",
"k": "Built-in",
"g": "Sessions & background work",
"d": "Spawn a forked subagent: a background subagent that inherits the full conversation and works on the task while you keep working. Its result returns to this conversation when it finishes. To copy the conversation into a separate background session instead, use /fork. When agent view is turned off, /subtask isn't available and /fork spawns the forked subagent instead"
},
{
"c": "/tasks",
"k": "Built-in",
"g": "Sessions & background work",
"d": "View and manage background work in the current session, including subagents that have finished. Also available as /bashes"
},
{
"c": "/team-onboarding",
"k": "Built-in",
"g": "Help & troubleshooting",
"d": "Generate a team onboarding guide from your Claude Code usage history. Claude analyzes your sessions, commands, and MCP server usage from the past 30 days. It produces a markdown guide a teammate can paste as a first message to get set up quickly. For claude.ai subscribers on Team and Enterprise plans, also returns a share link teammates can open directly in Claude Code"
},
{
"c": "/teleport",
"k": "Built-in",
"g": "Sessions & background work",
"d": "Pull a cloud session into this terminal. Opens a picker, then fetches the branch and conversation. Also available as /tp. Requires a claude.ai subscription"
},
{
"c": "/terminal-setup",
"k": "Built-in",
"g": "Start & set up",
"d": "Install a Shift+Enter keybinding for newlines in VS Code, Cursor, Devin Desktop, Alacritty, or Zed. In Apple Terminal, enable Option+Enter for newlines and turn off the audible bell instead. In iTerm2, turn on clipboard access so that /copy works"
},
{
"c": "/theme",
"k": "Built-in",
"g": "Interface",
"d": "Change the color theme. Includes an auto option that matches your terminal's light or dark background, light and dark variants, colorblind-accessible (daltonized) themes, ANSI themes that use your terminal's color palette, and any custom themes from ~/.claude/themes/ or plugins. Select **New custom theme…** to create one"
},
{
"c": "/tui [default|fullscreen]",
"k": "Built-in",
"g": "Interface",
"d": "Set the terminal UI renderer and relaunch into it with your conversation intact. fullscreen enables the flicker-free alt-screen renderer. With no argument, prints the active renderer"
},
{
"c": "/ultraplan <prompt>",
"k": "Removed",
"g": "Interface",
"d": "Removed. Use plan mode instead. Previously sent a planning task to a cloud session for review in your browser"
},
{
"c": "/ultrareview [PR or branch]",
"k": "Built-in",
"g": "Review & ship",
"d": "Run a deep, multi-agent code review in a cloud sandbox with ultrareview. Pass a PR reference to review that pull request, or a base branch or commit to change the comparison base. The preferred invocation is /code-review ultra, and /ultrareview is an alias. Includes 3 free runs on Pro and Max, then requires usage credits"
},
{
"c": "/update-config [request]",
"k": "Skill",
"g": "Start & set up",
"d": "Describe a settings change, such as allowing a command, setting an environment variable, or adding a hook, and Claude edits the matching settings.json file. For options such as theme and model, use /config instead"
},
{
"c": "/upgrade",
"k": "Built-in",
"g": "Account & usage",
"d": "Open the upgrade page in your browser to switch to a higher plan tier. When the browser fails to open, the command shows a sign-in prompt without printing the URL"
},
{
"c": "/usage",
"k": "Built-in",
"g": "Account & usage",
"d": "Show session cost, plan usage limits, and activity stats. On a Pro, Max, Team, or Enterprise plan, includes a breakdown of what counts against your plan limits. /cost and /stats are aliases"
},
{
"c": "/usage-credits",
"k": "Built-in",
"g": "Account & usage",
"d": "Configure usage credits, or request them from your admin, when you hit a limit. Opens your usage-credits billing settings in the browser, except that Team and Enterprise members without billing access instead send a usage-credits request to their admin from the CLI, after confirming in a dialog that the request notifies their admins. When no browser can open the billing page, for example over SSH, the command prints the URL to visit instead; this requires Claude Code v2.1.205 or later, and earlier versions showed nothing in that case. Previously /extra-usage"
},
{
"c": "/verify",
"k": "Skill",
"g": "Review & ship",
"d": "Confirm a code change does what it should by building your project's app, running it, and observing the result, rather than relying on tests or type checks. See Run and verify your app"
},
{
"c": "/vim",
"k": "Removed",
"g": "Interface",
"d": "Removed in v2.1.92. To toggle between Vim and Normal editing modes, use /config → Editor mode"
},
{
"c": "/voice [hold|tap|off]",
"k": "Built-in",
"g": "Interface",
"d": "Toggle voice dictation, or enable it in a specific mode. Requires a Claude.ai account"
},
{
"c": "/web-setup",
"k": "Built-in",
"g": "Start & set up",
"d": "Connect your GitHub account for cloud sessions using your local gh CLI credentials"
},
{
"c": "/workflow-authoring",
"k": "Skill",
"g": "Skills, plugins & agents",
"d": "Load the reference for writing dynamic workflow scripts: the script API, resume behavior, quality patterns, and worked examples. Claude normally loads it on its own before writing a script; run it yourself before editing a saved script by hand. Available when dynamic workflows are enabled, and requires Claude Code v2.1.248 or later"
},
{
"c": "/workflows",
"k": "Built-in",
"g": "Sessions & background work",
"d": "Open the workflow progress view to watch, pause, resume, or save running and completed workflows"
}
];
export const COMMAND_FLOW = [
 ["First session in a repo", "Generate a starter CLAUDE.md, refine it, set up MCP servers and your approval rules.", ["/init", "/memory", "/mcp", "/permissions"]],
 ["During a task", "Plan a large change, adjust model and effort, and keep the context window under control.", ["/plan", "/model", "/effort", "/context", "/compact", "/btw"]],
 ["Run work in parallel", "See background work, or detach the whole session to keep running.", ["/tasks", "/background", "/batch"]],
 ["Before you ship", "See what changed and review it for bugs and security problems.", ["/diff", "/code-review", "/security-review"]],
 ["Between sessions", "Start fresh, return to earlier work, or try a different direction.", ["/clear", "/resume", "/branch", "/fork", "/teleport", "/remote-control"]],
 ["When something is wrong", "Roll back, diagnose your setup, and report a bug.", ["/rewind", "/doctor", "/debug", "/feedback"]]
];
