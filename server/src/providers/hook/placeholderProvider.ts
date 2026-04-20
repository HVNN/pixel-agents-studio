/**
 * Factory for placeholder CLI providers that don't yet have hook or transcript
 * support. These allow the +Agent UI to spawn terminals for other CLIs while
 * the real integration is being built.
 */

import type { AgentEvent, HookProvider } from '../../provider.js';

function genericFormatToolStatus(toolName: string): string {
  return `Using ${toolName}`;
}

export function makePlaceholderProvider(opts: {
  id: string;
  displayName: string;
  launchCommand: string;
  launchArgs?: (sessionId: string) => string[];
}): HookProvider {
  return {
    kind: 'hook',
    id: opts.id,
    displayName: opts.displayName,

    normalizeHookEvent(_raw: Record<string, unknown>): { sessionId: string; event: AgentEvent } | null {
      return null;
    },

    installHooks(_serverUrl: string, _authToken: string): Promise<void> {
      return Promise.resolve();
    },
    uninstallHooks(): Promise<void> {
      return Promise.resolve();
    },
    areHooksInstalled(): Promise<boolean> {
      return Promise.resolve(false);
    },

    formatToolStatus: genericFormatToolStatus,
    permissionExemptTools: new Set<string>(),
    subagentToolNames: new Set<string>(),

    buildLaunchCommand(sessionId: string, _cwd: string): { command: string; args: string[] } {
      const args = opts.launchArgs ? opts.launchArgs(sessionId) : [];
      return { command: opts.launchCommand, args };
    },
  };
}
