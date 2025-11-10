import { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Store } from '@tauri-apps/plugin-store';
import { useHotkeys } from 'react-hotkeys-hook';
import useInfo from '~hooks/useInfo';
import SendIcon from '~icons/Send';
import debounce from 'lodash/debounce';

// Create or load the store file once
const settingsStore = new Store('.settings.dat');

export default function ChatInput() {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [message, setMessage] = useState('');
  const [disableEnterToSend, setDisableEnterToSend] = useState(false);
  const { isMac } = useInfo();

  // Load user preference from Tauri store
  useEffect(() => {
    (async () => {
      const saved = await settingsStore.get<boolean>('disableEnterToSend');
      if (typeof saved === 'boolean') setDisableEnterToSend(saved);
    })();
  }, []);

  // Persist toggle changes
  const handleToggle = async (checked: boolean) => {
    setDisableEnterToSend(checked);
    await settingsStore.set('disableEnterToSend', checked);
    await settingsStore.save();
  };

  // Sync message with backend (debounced)
  useEffect(() => {
    const syncMessage = debounce(async () => {
      try {
        await invoke('ask_sync', { message: JSON.stringify(message) });
      } catch (error) {
        console.error('Error syncing message:', error);
      }
    }, 300);

    syncMessage();
    return () => syncMessage.cancel();
  }, [message]);

  // Ctrl+Enter or Cmd+Enter sends message
  useHotkeys(
    isMac ? 'meta+enter' : 'ctrl+enter',
    async (event: KeyboardEvent) => {
      event.preventDefault();
      await handleSend();
    },
    { enableOnFormTags: true },
    [message]
  );

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  // Handle Enter or Shift+Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (disableEnterToSend) {
        // Insert a line break instead of sending
        e.preventDefault();
        setMessage((prev) => prev + '\n');
      } else {
        // Send message directly
        e.preventDefault();
        handleSend();
      }
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    try {
      await invoke('ask_send', { message: JSON.stringify(message) });
    } catch (error) {
      console.error('Error sending message:', error);
    }
    setMessage('');
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  };

  return (
    <div className="flex flex-col w-full h-full dark:bg-app-gray-2/[0.98] bg-gray-100 dark:text-slate-200">
      {/* Chat Input Area */}
      <div className="relative flex items-center gap-1 flex-1">
        <textarea
          ref={inputRef}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          spellCheck="false"
          autoFocus
          className="w-full h-full pl-3 pr-[40px] py-2 outline-none resize-none bg-transparent"
          placeholder="Type your message here..."
        />
        <SendIcon
          size={30}
          className="absolute right-2 text-gray-400/80 dark:text-gray-600 cursor-pointer hover:text-gray-700 dark:hover:text-gray-400"
          onClick={handleSend}
          title={`Send message (${isMac ? '⌘⏎' : '⌃⏎'})`}
          aria-label="Send message"
        />
      </div>

      {/* Toggle for Enter behavior */}
      <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-300/40 text-sm select-none">
        <input
          type="checkbox"
          id="disableEnterToSend"
          checked={disableEnterToSend}
          onChange={(e) => handleToggle(e.target.checked)}
          className="accent-blue-500 cursor-pointer"
        />
        <label htmlFor="disableEnterToSend" className="cursor-pointer">
          Disable “Enter to Send” (use Enter for newline)
        </label>
      </div>
    </div>
  );
}
