import { makePlaceholderProvider } from '../placeholderProvider.js';

export const geminiProvider = makePlaceholderProvider({
  id: 'gemini',
  displayName: 'Gemini CLI',
  launchCommand: 'gemini',
});
