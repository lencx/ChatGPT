import { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useHotkeys } from 'react-hotkeys-hook';
import useInfo from '~hooks/useInfo';
import SendIcon from '~icons/Send';
import debounce from 'lodash/debounce';

interface AppConf {
  theme: string;
  stay_on_top: boolean;
  ask_mode: boolean;
  mac_titlebar_hidden: boolean;
  provider: string;
  anthropic_api_key: string;
  use_extended_context: boolean;
}

export default function ChatInput() {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [message, setMessage] = useState('');
  const [provider, setProvider] = useState('chatgpt');
  const { isMac } = useInfo();

  useEffect(() => {
    // Load provider configuration
    const loadConfig = async () => {
      try {
        const conf = await invoke<AppConf>('get_app_conf');
        setProvider(conf.provider || 'chatgpt');
      } catch (error) {
        console.error('Failed to load config:', error);
      }
    };
    loadConfig();
  }, []);

  useEffect(() => {
    // Only sync for ChatGPT provider
    if (provider !== 'chatgpt') return;

    const syncMessage = debounce(async () => {
      try {
        await invoke('ask_sync', { message: JSON.stringify(message) });
      } catch (error) {
        console.error('Error syncing message:', error);
      }
    }, 300); // Debounce by 300ms

    syncMessage();
    return () => syncMessage.cancel(); // Cleanup debounce on unmount
  }, [message, provider]);

  useHotkeys(isMac ? 'meta+enter' : 'ctrl+enter', async (event: KeyboardEvent) => {
    event.preventDefault();
    await handleSend();
  }, {
    enableOnFormTags: true,
  }, [message]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      if (provider === 'claude') {
        // Handle Claude API
        const mainWebview = (window as any).__TAURI__?.webview;

        // Add user message to chat
        await invoke('eval_webview', {
          webview: 'main',
          script: `window.addMessage('user', ${JSON.stringify(message)})`
        }).catch(() => {
          // Fallback if eval_webview doesn't exist
          console.log('Using direct eval');
        });

        // Show loading indicator
        await invoke('eval_webview', {
          webview: 'main',
          script: 'window.showLoading()'
        }).catch(() => {});

        // Get conversation history from the webview
        const historyStr = await invoke<string>('eval_webview', {
          webview: 'main',
          script: 'JSON.stringify(window.getConversationHistory())'
        }).catch(() => '[]');

        const history = JSON.parse(historyStr || '[]');

        // Send to Claude API
        const response = await invoke<string>('send_claude_message', {
          messages: history,
          system: null
        });

        // Hide loading indicator
        await invoke('eval_webview', {
          webview: 'main',
          script: 'window.hideLoading()'
        }).catch(() => {});

        // Add assistant response
        await invoke('eval_webview', {
          webview: 'main',
          script: `window.addMessage('assistant', ${JSON.stringify(response)})`
        }).catch(() => {});

      } else {
        // Handle ChatGPT
        await invoke('ask_send', { message: JSON.stringify(message) });
      }
    } catch (error) {
      console.error('Error sending message:', error);

      if (provider === 'claude') {
        // Show error in Claude chat
        await invoke('eval_webview', {
          webview: 'main',
          script: 'window.hideLoading()'
        }).catch(() => {});

        await invoke('eval_webview', {
          webview: 'main',
          script: `window.showError(${JSON.stringify(String(error))})`
        }).catch(() => {});
      }
    }

    setMessage('');
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  };

  return (
    <div className="relative flex h-full dark:bg-app-gray-2/[0.98] bg-gray-100 dark:text-slate-200 items-center gap-1">
      <textarea
        ref={inputRef}
        onChange={handleInput}
        spellCheck="false"
        autoFocus
        className="w-full h-full pl-3 pr-[40px] py-2 outline-none resize-none bg-transparent"
        placeholder="Type your message here..."
      />
      <SendIcon
        size={30}
        className="absolute right-2 text-gray-400/80 dark:text-gray-600 cursor-pointer"
        onClick={handleSend}
        title={`Send message (${isMac ? '⌘⏎' : '⌃⏎'})`}
        aria-label="Send message"
      />
    </div>
  );
}
