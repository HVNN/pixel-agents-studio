import { makePlaceholderProvider } from '../placeholderProvider.js';

export const copilotProvider = makePlaceholderProvider({
  id: 'copilot',
  displayName: 'Copilot CLI',
  launchCommand: 'gh',
  launchArgs: (_sessionId) => ['copilot', 'suggest'],
});
