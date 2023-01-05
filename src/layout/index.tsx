import { FC, useState } from 'react';
import {Layout, Menu, Button, Tooltip, message, ConfigProvider, theme, Tag} from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { getName, getVersion } from '@tauri-apps/api/app';
import { invoke } from '@tauri-apps/api';

import Routes, { menuItems } from '@/routes';
import './index.scss';

const { Content, Footer, Sider } = Layout;

const appName = await getName();
const appVersion = await getVersion();
const appTheme = await invoke("get_theme");
console.log("theme:"+appTheme);
interface ChatLayoutProps {
  children?: React.ReactNode;
}

const ChatLayout: FC<ChatLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const go = useNavigate();

  const checkAppUpdate = async () => {
      await invoke('run_check_update', {silent: false});
  }

  return (
    <ConfigProvider theme={{algorithm: appTheme === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm}}>
    <Layout style={{ minHeight: '100vh' }} hasSider>
      <Sider
        theme={ appTheme === "dark" ? "dark" : "light" }
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 999,
        }}
      >
        <div className="chat-logo"><img src="/logo.png" /></div>
        <div className="chat-info">
            <Tag>{appName}</Tag>
        </div>
        <div className="chat-info">
          <Tag>
            <span>{appVersion}</span>
            <span> </span>
            {
              <Tooltip title="click to check update">
                <a onClick={checkAppUpdate}><SyncOutlined /></a>
              </Tooltip>
            }
          </Tag>

        </div>

        <Menu
          defaultSelectedKeys={[location.pathname]}
          mode="inline"
          theme={ appTheme === "dark" ? "dark" : "light" }
          inlineIndent={12}
          items={menuItems}
          defaultOpenKeys={['/model']}
          onClick={(i) => go(i.key)}
        />
      </Sider>
      <Layout className="chat-layout" style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 300ms ease-out' }}>
        <Content
          className="chat-container"
          style={{
            overflow: 'inherit'
          }}
        >
          <Routes />
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          <a href="https://github.com/lencx/chatgpt" target="_blank">ChatGPT Desktop Application</a> ©2022 Created by lencx</Footer>
      </Layout>
    </Layout>
    </ConfigProvider>
  );
};

export default ChatLayout;