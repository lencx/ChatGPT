import { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useHotkeys } from 'react-hotkeys-hook';
import useInfo from '~hooks/useInfo';
import SendIcon from '~icons/Send';
import debounce from 'lodash/debounce';

export default function ChatInput() {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [message, setMessage] = useState('');
  const [config, setConfig] = useState<I.AppConf | null>(null);
  const [messages, setMessages] = useState<I.Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isMac } = useInfo();

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Only sync if in website mode
    if (!config?.api_mode) {
      const syncMessage = debounce(async () => {
        try {
          await invoke('ask_sync', { message: JSON.stringify(message) });
        } catch (error) {
          console.error('Error syncing message:', error);
        }
      }, 300);

      syncMessage();
      return () => syncMessage.cancel();
    }
  }, [message, config]);

  const loadConfig = async () => {
    try {
      const conf = await invoke<I.AppConf>('get_app_conf');
      setConfig(conf);
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  };

  useHotkeys(isMac ? 'meta+enter' : 'ctrl+enter', async (event: KeyboardEvent) => {
    event.preventDefault();
    await handleSend();
  }, {
    enableOnFormTags: true,
  }, [message, config]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    if (config?.api_mode) {
      // API Mode: Send directly to Anthropic API
      const userMessage: I.Message = { role: 'user', content: message.trim() };
      setMessages(prev => [...prev, userMessage]);
      setMessage('');
      setLoading(true);

      if (inputRef.current) {
        inputRef.current.value = '';
      }

      try {
        const response = await invoke<string>('send_api_message', {
          messages: [...messages, userMessage],
        });

        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      } catch (error: any) {
        console.error('Error sending API message:', error);
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: `Error: ${error || 'Failed to send message'}` }
        ]);
      } finally {
        setLoading(false);
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    } else {
      // Website Mode: Use existing behavior
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
    }
  };

  const clearConversation = () => {
    if (confirm('Clear conversation history?')) {
      setMessages([]);
    }
  };

  // Render API mode UI with conversation history
  if (config?.api_mode) {
    return (
      <div className="flex flex-col h-full dark:bg-app-gray-2/[0.98] bg-gray-100">
        {/* Conversation Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm">
              Start a conversation with Claude...
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <div className="text-xs font-semibold mb-1 opacity-70">
                      {msg.role === 'user' ? 'You' : 'Claude'}
                    </div>
                    <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-300 dark:border-gray-700">
          <div className="relative flex items-center gap-1 p-2">
            <textarea
              ref={inputRef}
              onChange={handleInput}
              value={message}
              spellCheck="false"
              autoFocus
              disabled={loading}
              className="w-full pl-3 pr-[80px] py-2 outline-none resize-none bg-transparent min-h-[40px] max-h-[120px]"
              placeholder={loading ? "Claude is thinking..." : "Type your message..."}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <div className="absolute right-2 flex gap-1">
              {messages.length > 0 && (
                <button
                  onClick={clearConversation}
                  className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                  title="Clear conversation"
                >
                  Clear
                </button>
              )}
              <SendIcon
                size={30}
                className={`text-gray-400/80 dark:text-gray-600 ${
                  loading || !message.trim() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
                onClick={!loading && message.trim() ? handleSend : undefined}
                title={`Send message (${isMac ? '⌘⏎' : '⌃⏎'})`}
                aria-label="Send message"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Website mode UI (original)
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
