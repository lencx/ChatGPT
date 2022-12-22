import { invoke, http, fs, dialog } from '@tauri-apps/api';

import useInit from '@/hooks/useInit';
import useChatModel from '@/hooks/useChatModel';
import { GITHUB_PROMPTS_CSV_URL, chatPromptsPath, genCmd } from '@/utils';

export default function useEvent() {
  const { modelSet } = useChatModel('sys_sync_prompts');
  // Using `emit` and `listen` will be triggered multiple times in development mode.
  // So here we use `eval` to call `__sync_prompt`
  useInit(() => {
    (window as any).__sync_prompts = async () => {
      const res = await http.fetch(GITHUB_PROMPTS_CSV_URL, {
        method: 'GET',
        responseType: http.ResponseType.Text,
      });
      const data = (res.data || '') as string;
      if (res.ok) {
        await fs.writeTextFile(await chatPromptsPath(), data);
        const list: Record<string, string>[] = await invoke('parse_prompt', { data });
        modelSet(list.map(i => ({ cmd: genCmd(i.act), enable: true, tags: ['chatgpt-prompts'], ...i })));
        dialog.message('ChatGPT Prompts data has been synchronized!');
      } else {
        dialog.message('ChatGPT Prompts data sync failed, please try again!');
      }
    }
  })
}
