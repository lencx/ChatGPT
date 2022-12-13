import { FC, useState } from 'react';
import {
  DesktopOutlined,
  BulbOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Layout, Menu } from 'antd';
import './index.scss';

const { Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem('General', 'general', <DesktopOutlined />),
  getItem('ChatGPT Prompts', 'chatgpt-prompts', <BulbOutlined />),
];

interface ChatLayoutProps {
  children: React.ReactNode;
}

const ChatLayout: FC<ChatLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light" collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div className="chat-logo"><img src="/logo.png" /></div>
        <Menu defaultSelectedKeys={['1']} mode="inline" items={items} />
      </Sider>
      <Layout className="chat-layout">
        <Content className="chat-container">
          {children}
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          <a href="https://github.com/lencx/chatgpt" target="_blank">ChatGPT Desktop Application</a> ©2022 Created by lencx</Footer>
      </Layout>
    </Layout>
  );
};

export default ChatLayout;