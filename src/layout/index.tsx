import { useState } from 'react';
import { Layout, Menu, Tooltip, ConfigProvider, theme, Tag } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { getName, getVersion } from '@tauri-apps/api/app';
import { invoke } from '@tauri-apps/api';

import useInit from '@/hooks/useInit';
import Routes, { menuItems } from '@/routes';
import './index.scss';

const { Content, Footer, Sider } = Layout;

export default function ChatLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [appInfo, setAppInfo] = useState<Record<string, any>>({});
  const location = useLocation();
  const go = useNavigate();

  useInit(async () => {
    setAppInfo({
      appName: await getName(),
      appVersion: await getVersion(),
      appTheme: await invoke("get_theme"),
    });
  })

  const checkAppUpdate = async () => {
    await invoke('run_check_update', { silent: false, hasMsg: true });
  }

  const isDark = appInfo.appTheme === "dark";

  return (
    <ConfigProvider theme={{ algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
      <Layout style={{ minHeight: '100vh' }} hasSider>
        <Sider
          theme={isDark ? "dark" : "light"}
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
            <Tag>{appInfo.appName}</Tag>
            <Tag>
                <span style={{ marginRight: 5 }}>{appInfo.appVersion}</span>
                <Tooltip title="click to check update">
                  <a onClick={checkAppUpdate}><SyncOutlined /></a>
                </Tooltip>
            </Tag>
          </div>

          <Menu
            defaultSelectedKeys={[location.pathname]}
            mode="inline"
            theme={ appInfo.appTheme === "dark" ? "dark" : "light" }
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
            <a href="https://github.com/lencx/chatgpt" target="_blank">ChatGPT Desktop Application</a> ©2022 Created by lencx
          </Footer>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};