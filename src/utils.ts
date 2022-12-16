import { readTextFile, writeTextFile, exists } from '@tauri-apps/api/fs';
import { homeDir, join } from '@tauri-apps/api/path';

export const CHAT_MODEL_JSON = 'chat.model.json';
export const DISABLE_AUTO_COMPLETE = {
  autoCapitalize: 'off',
  autoComplete: 'off',
  spellCheck: false
};

export const chatRoot = async () => {
  return join(await homeDir(), '.chatgpt')
}

export const chatModelPath = async () => {
  return join(await chatRoot(), CHAT_MODEL_JSON);
}

export const readJSON = async (path: string, defaultVal = {}) => {
  const root = await chatRoot();
  const file = await join(root, path);

  if (!await exists(file)) {
    writeTextFile(file, JSON.stringify({
      name: 'ChatGPT',
      link: 'https://github.com/lencx/ChatGPT/blob/main/chat.model.md',
      data: null,
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