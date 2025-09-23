import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Card, List, Typography, Space, Avatar, Spin, message } from 'antd';
import { SendOutlined, UserOutlined, RobotOutlined } from '@ant-design/icons';
import { invoke } from '@tauri-apps/api';
import './index.scss';

const { Text } = Typography;
const { TextArea } = Input;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function DirectChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Test connection on component mount
    testConnection();
  }, []);

  useEffect(() => {
    // Auto scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const testConnection = async () => {
    try {
      const result = (await invoke('test_api_key')) as { success: boolean; message: string };
      console.log('Connection test:', result);
      setConnected(result.success);
      if (!result.success) {
        message.error(`Connection failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      message.error('Failed to test connection');
      setConnected(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Prepare chat completion request
      const requestBody = JSON.stringify({
        model: 'qwen3-coder',
        messages: [
          ...messages.map((msg) => ({ role: msg.role, content: msg.content })),
          { role: 'user', content: userMessage.content },
        ],
        temperature: 0.7,
        max_tokens: 2048,
        stream: false,
      });

      const response = (await invoke('proxy_request', {
        method: 'POST',
        path: '/v1/chat/completions',
        body: requestBody,
      })) as string;

      const result = JSON.parse(response);

      if (result.choices && result.choices.length > 0) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.choices[0].message.content,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error('No response from model');
      }
    } catch (error) {
      console.error('Chat error:', error);
      message.error(`Chat failed: ${error}`);

      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="direct-chat">
      <Card
        title={
          <Space>
            <RobotOutlined />
            <Text>Courtney AI - Direct API Chat</Text>
            <Text type={connected ? 'success' : 'danger'} style={{ fontSize: '12px' }}>
              {connected ? '● Connected' : '● Disconnected'}
            </Text>
          </Space>
        }
        extra={
          <Space>
            <Button size="small" onClick={testConnection}>
              Test Connection
            </Button>
            <Button size="small" onClick={clearChat}>
              Clear Chat
            </Button>
          </Space>
        }
        className="chat-container"
      >
        <div className="messages-container">
          <List
            dataSource={messages}
            renderItem={(item) => (
              <List.Item className={`message ${item.role}`}>
                <Space align="start" style={{ width: '100%' }}>
                  <Avatar
                    icon={item.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                    style={{
                      backgroundColor: item.role === 'user' ? '#1890ff' : '#52c41a',
                      flexShrink: 0,
                    }}
                  />
                  <div className="message-content">
                    <div className="message-header">
                      <Text strong>{item.role === 'user' ? 'You' : 'Courtney AI'}</Text>
                      <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>
                        {item.timestamp.toLocaleTimeString()}
                      </Text>
                    </div>
                    <div className="message-text">
                      <Text>{item.content}</Text>
                    </div>
                  </div>
                </Space>
              </List.Item>
            )}
          />
          {isLoading && (
            <div className="loading-indicator">
              <Space>
                <Spin size="small" />
                <Text type="secondary">Courtney AI is thinking...</Text>
              </Space>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <Space.Compact style={{ width: '100%' }}>
            <TextArea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message... (Ctrl+Enter to send)"
              autoSize={{ minRows: 1, maxRows: 4 }}
              disabled={isLoading || !connected}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={sendMessage}
              loading={isLoading}
              disabled={!inputText.trim() || !connected}
            >
              Send
            </Button>
          </Space.Compact>
          <Text type="secondary" style={{ fontSize: '12px', marginTop: '4px' }}>
            Press Ctrl+Enter to send quickly
          </Text>
        </div>
      </Card>
    </div>
  );
}
