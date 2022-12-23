import { invoke, path, http, fs, dialog } from '@tauri-apps/api';

import useInit from '@/hooks/useInit';
import useChatModel, { useCacheModel } from '@/hooks/useChatModel';
import { GITHUB_PROMPTS_CSV_URL, chatRoot, genCmd } from '@/utils';

export default function useEvent() {
  const { modelSet } = useChatModel('sync_prompts');
  const { modelCacheSet } = useCacheModel();
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
        const file = await path.join(await chatRoot(), 'cache_model', 'chatgpt_prompts.json');
        const list: Record<string, string>[] = await invoke('parse_prompt', { data });
        const fmtList = list.map(i => ({ ...i, cmd: i.cmd ? i.cmd : genCmd(i.act), enable: true, tags: ['chatgpt-prompts'] }));
        await modelCacheSet(fmtList, file);
        modelSet({
          id: 'chatgpt_prompts',
          last_updated: Date.now(),
        });
        dialog.message('ChatGPT Prompts data has been synchronized!');
      } else {
        dialog.message('ChatGPT Prompts data sync failed, please try again!');
      }
    }
  })
}
