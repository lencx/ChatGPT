import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import clsx from 'clsx';

const CLAUDE_MODELS = [
  { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (Latest)' },
  { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' },
  { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
  { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' },
  { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' },
];

export default function Settings() {
  const [config, setConfig] = useState<I.AppConf | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadConfig();
    checkApiKey();
  }, []);

  const loadConfig = async () => {
    try {
      const conf = await invoke<I.AppConf>('get_app_conf');
      setConfig(conf);
    } catch (error) {
      showMessage('error', 'Failed to load configuration');
    }
  };

  const checkApiKey = async () => {
    try {
      const exists = await invoke<boolean>('has_api_key');
      setHasApiKey(exists);
    } catch (error) {
      console.error('Failed to check API key:', error);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      showMessage('error', 'Please enter an API key');
      return;
    }

    setLoading(true);
    try {
      await invoke('set_api_key', { apiKey: apiKey.trim() });
      setHasApiKey(true);
      setApiKey('');
      setShowApiKey(false);
      showMessage('success', 'API key saved securely');
    } catch (error: any) {
      showMessage('error', error || 'Failed to save API key');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApiKey = async () => {
    if (!confirm('Are you sure you want to delete your API key?')) {
      return;
    }

    setLoading(true);
    try {
      await invoke('delete_api_key');
      setHasApiKey(false);
      setApiKey('');
      showMessage('success', 'API key deleted');
    } catch (error: any) {
      showMessage('error', error || 'Failed to delete API key');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleApiMode = async (enabled: boolean) => {
    if (enabled && !hasApiKey) {
      showMessage('error', 'Please set up an API key first');
      return;
    }

    setLoading(true);
    try {
      await invoke('set_api_mode', { enabled });
      setConfig(prev => prev ? { ...prev, api_mode: enabled } : null);
      showMessage('success', enabled ? 'API mode enabled' : 'Website mode enabled');
    } catch (error: any) {
      showMessage('error', error || 'Failed to toggle API mode');
    } finally {
      setLoading(false);
    }
  };

  const handleModelChange = async (model: string) => {
    setLoading(true);
    try {
      await invoke('set_api_model', { model });
      setConfig(prev => prev ? { ...prev, api_model: model } : null);
      showMessage('success', 'Model updated');
    } catch (error: any) {
      showMessage('error', error || 'Failed to update model');
    } finally {
      setLoading(false);
    }
  };

  const handleMaxTokensChange = async (tokens: number) => {
    setLoading(true);
    try {
      await invoke('set_api_max_tokens', { maxTokens: tokens });
      setConfig(prev => prev ? { ...prev, api_max_tokens: tokens } : null);
      showMessage('success', 'Max tokens updated');
    } catch (error: any) {
      showMessage('error', error || 'Failed to update max tokens');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    getCurrentWindow().close();
  };

  if (!config) {
    return (
      <div className="flex items-center justify-center h-screen dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-3xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={clsx(
              'mb-4 p-4 rounded-lg',
              message.type === 'success'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
            )}
          >
            {message.text}
          </div>
        )}

        {/* API Configuration Section */}
        <section className="mb-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Anthropic API Configuration</h2>

          {/* API Key Status */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">API Key Status</label>
            <div className="flex items-center gap-2">
              <div
                className={clsx(
                  'w-3 h-3 rounded-full',
                  hasApiKey ? 'bg-green-500' : 'bg-red-500'
                )}
              />
              <span className="text-sm">
                {hasApiKey ? 'API key is configured' : 'No API key configured'}
              </span>
            </div>
          </div>

          {/* API Key Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Anthropic API Key
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Get your API key →
              </a>
            </label>
            <div className="flex gap-2">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-api03-..."
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                disabled={loading}
              >
                {showApiKey ? '🙈 Hide' : '👁️ Show'}
              </button>
              <button
                onClick={handleSaveApiKey}
                disabled={loading || !apiKey.trim()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              Your API key is stored securely in your system keychain
            </p>
          </div>

          {/* Delete API Key */}
          {hasApiKey && (
            <div className="mb-6">
              <button
                onClick={handleDeleteApiKey}
                disabled={loading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Delete API Key
              </button>
            </div>
          )}

          {/* API Mode Toggle */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Mode</label>
            <div className="flex gap-4">
              <button
                onClick={() => handleToggleApiMode(false)}
                disabled={loading}
                className={clsx(
                  'flex-1 px-4 py-3 rounded-lg border-2 transition-all',
                  !config.api_mode
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                )}
              >
                <div className="font-medium">Website Mode</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Use chatgpt.com directly
                </div>
              </button>
              <button
                onClick={() => handleToggleApiMode(true)}
                disabled={loading || !hasApiKey}
                className={clsx(
                  'flex-1 px-4 py-3 rounded-lg border-2 transition-all',
                  config.api_mode
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400',
                  !hasApiKey && 'opacity-50 cursor-not-allowed'
                )}
              >
                <div className="font-medium">API Mode</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Use Anthropic API directly
                </div>
              </button>
            </div>
          </div>

          {/* API Settings (only visible in API mode) */}
          {config.api_mode && (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Model</label>
                <select
                  value={config.api_model}
                  onChange={(e) => handleModelChange(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CLAUDE_MODELS.map((model) => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Max Tokens: {config.api_max_tokens}
                </label>
                <input
                  type="range"
                  min="256"
                  max="8192"
                  step="256"
                  value={config.api_max_tokens}
                  onChange={(e) => handleMaxTokensChange(parseInt(e.target.value))}
                  disabled={loading}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                  <span>256</span>
                  <span>8192</span>
                </div>
              </div>
            </>
          )}
        </section>

        {/* Info Section */}
        <section className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">💡 How it works</h3>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>• <strong>Website Mode:</strong> Loads chatgpt.com in a webview (default)</li>
            <li>• <strong>API Mode:</strong> Connects directly to Anthropic API using Claude models</li>
            <li>• Your API key is stored securely in your system keychain</li>
            <li>• API mode requires an Anthropic API key from console.anthropic.com</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
