import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import clsx from 'clsx';

interface AppConf {
  theme: string;
  stay_on_top: boolean;
  ask_mode: boolean;
  mac_titlebar_hidden: boolean;
  provider: string;
  anthropic_api_key: string;
  use_extended_context: boolean;
}

export default function Settings() {
  const [config, setConfig] = useState<AppConf | null>(null);
  const [provider, setProvider] = useState('chatgpt');
  const [apiKey, setApiKey] = useState('');
  const [extendedContext, setExtendedContext] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const conf = await invoke<AppConf>('get_app_conf');
      setConfig(conf);
      setProvider(conf.provider || 'chatgpt');
      setApiKey(conf.anthropic_api_key || '');
      setExtendedContext(conf.use_extended_context || false);
    } catch (error) {
      console.error('Failed to load config:', error);
      showMessage('error', 'Failed to load settings');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await invoke('set_provider', { provider });

      if (provider === 'claude') {
        if (!apiKey.trim()) {
          showMessage('error', 'API key is required for Claude');
          setSaving(false);
          return;
        }
        await invoke('set_anthropic_api_key', { apiKey });
        await invoke('set_extended_context', { enabled: extendedContext });
      }

      showMessage('success', 'Settings saved successfully');
      await loadConfig();
    } catch (error) {
      console.error('Failed to save settings:', error);
      showMessage('error', `Failed to save settings: ${error}`);
    } finally {
      setSaving(false);
    }
  };

  if (!config) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>

        {message && (
          <div className={clsx(
            'mb-6 p-4 rounded-lg',
            message.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          )}>
            {message.text}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              AI Provider
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600">
                <input
                  type="radio"
                  value="chatgpt"
                  checked={provider === 'chatgpt'}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="ml-3">
                  <div className="font-medium text-gray-900 dark:text-white">ChatGPT (Web)</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Use OpenAI's ChatGPT web interface</div>
                </div>
              </label>

              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600">
                <input
                  type="radio"
                  value="claude"
                  checked={provider === 'claude'}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="ml-3">
                  <div className="font-medium text-gray-900 dark:text-white">Claude (API)</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Use Anthropic's Claude API with your API key</div>
                </div>
              </label>
            </div>
          </div>

          {/* Claude API Settings */}
          {provider === 'claude' && (
            <div className="space-y-4 pt-4 border-t dark:border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Anthropic API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Get your API key from <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Anthropic Console</a>
                </p>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={extendedContext}
                    onChange={(e) => setExtendedContext(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <div className="ml-3">
                    <div className="font-medium text-gray-900 dark:text-white">Extended Context (1M tokens)</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Enable extended context window for processing larger documents</div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="pt-4 border-t dark:border-gray-700">
            <button
              onClick={handleSave}
              disabled={saving}
              className={clsx(
                'w-full py-3 px-4 rounded-lg font-medium text-white',
                saving
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
              )}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Note</h3>
          <p className="text-sm text-blue-800 dark:text-blue-300">
            Changing the provider may require restarting the application to take full effect.
          </p>
        </div>
      </div>
    </div>
  );
}