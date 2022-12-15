import { FC, useState } from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate } from 'react-router-dom';

import Routes, { menuItems } from '@/routes';

import './index.scss';

const { Content, Footer, Sider } = Layout;

interface ChatLayoutProps {
  children?: React.ReactNode;
}

const ChatLayout: FC<ChatLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const go = useNavigate();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light" collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div className="chat-logo"><img src="/logo.png" /></div>
        <Menu defaultSelectedKeys={['/']} mode="vertical" items={menuItems} onClick={(i) => go(i.key)} />
      </Sider>
      <Layout className="chat-layout">
        <Content className="chat-container">
          <Routes />
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          <a href="https://github.com/lencx/chatgpt" target="_blank">ChatGPT Desktop Application</a> ©2022 Created by lencx</Footer>
      </Layout>
    </Layout>
  );
};

export default ChatLayout;