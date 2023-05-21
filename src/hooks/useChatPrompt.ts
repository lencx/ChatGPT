import { useState, useEffect } from 'react';
import { clone } from 'lodash';
import { invoke } from '@tauri-apps/api';

import { CHAT_PROMPT_JSON, CHAT_PROMPT_CMD_JSON, readJSON, writeJSON } from '@/utils';
import useInit from '@/hooks/useInit';

export default function useChatPrompt(key: string, file = CHAT_PROMPT_JSON) {
  const [promptJson, setPromptJson] = useState<Record<string, any>>({});

  useInit(async () => {
    const data = await readJSON(file, {
      defaultVal: { name: 'ChatGPT Prompts', [key]: null },
    });
    setPromptJson(data);
  });

  const promptSet = async (data: Record<string, any>[] | Record<string, any>) => {
    const oData = clone(promptJson);
    oData[key] = data;
    await writeJSON(file, oData);
    setPromptJson(oData);
  };

  return { promptJson, promptSet, promptData: promptJson?.[key] || [] };
}

export function useCachePrompt(file = '') {
  const [promptCacheJson, setPromptCacheJson] = useState<Record<string, any>[]>([]);

  useEffect(() => {
    if (!file) return;
    (async () => {
      const data = await readJSON(file, { isRoot: true, isList: true });
      setPromptCacheJson(data);
    })();
  }, [file]);

  const promptCacheSet = async (data: Record<string, any>[], newFile = '') => {
    await writeJSON(newFile ? newFile : file, data, { isRoot: true });
    setPromptCacheJson(data);
    await promptCacheCmd();
  };

  const promptCacheCmd = async () => {
    // Generate the `chat.prompt.cmd.json` file and refresh the page for the slash command to take effect.
    const list = await invoke('cmd_list');
    await writeJSON(CHAT_PROMPT_CMD_JSON, {
      name: 'ChatGPT CMD',
      last_updated: Date.now(),
      data: list,
    });
    await invoke('window_reload', { label: 'core' });
    await invoke('window_reload', { label: 'tray' });
  };

  return { promptCacheJson, promptCacheSet, promptCacheCmd };
}
