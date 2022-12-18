import { readTextFile, writeTextFile, exists } from '@tauri-apps/api/fs';
import { homeDir, join } from '@tauri-apps/api/path';
import dayjs from 'dayjs';

export const CHAT_MODEL_JSON = 'chat.model.json';
export const CHAT_PROMPTS_CSV = 'chat.prompts.csv';
export const GITHUB_PROMPTS_CSV_URL = 'https://raw.githubusercontent.com/f/awesome-chatgpt-prompts/main/prompts.csv';
export const DISABLE_AUTO_COMPLETE = {
  autoCapitalize: 'off',
  autoComplete: 'off',
  spellCheck: false
};

export const chatRoot = async () => {
  return join(await homeDir(), '.chatgpt')
}

export const chatModelPath = async (): Promise<string> => {
  return join(await chatRoot(), CHAT_MODEL_JSON);
}

export const chatPromptsPath = async (): Promise<string> => {
  return join(await chatRoot(), CHAT_PROMPTS_CSV);
}

export const readJSON = async (path: string, defaultVal = {}) => {
  const root = await chatRoot();
  const file = await join(root, path);

  if (!await exists(file)) {
    writeTextFile(file, JSON.stringify({
      name: 'ChatGPT',
      link: 'https://github.com/lencx/ChatGPT/blob/main/chat.model.md',
      ...defaultVal,
    }, null, 2))
  }

  try {
    return JSON.parse(await readTextFile(file));
  } catch(e) {
    return {};
  }
}

export const writeJSON = async (path: string, data: Record<string, any>) => {
  const root = await chatRoot();
  const file = await join(root, path);
  await writeTextFile(file, JSON.stringify(data, null, 2));
}

export const fmtDate = (date: any) => dayjs(date).format('YYYY-MM-DD HH:mm:ss');