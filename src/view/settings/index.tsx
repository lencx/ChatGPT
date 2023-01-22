import { useEffect, useState } from 'react';
import { Form, Tabs, Space, Button, message } from 'antd';
import { invoke, dialog, process } from '@tauri-apps/api';
import { clone, omit, isEqual } from 'lodash';

import useInit from '@/hooks/useInit';
import FilePath from '@/components/FilePath';
import { CHAT_CONF_JSON } from '@/utils';
import General from './General';
import MainWindow from './MainWindow';
import TrayWindow from './TrayWindow';

export default function Settings() {
  const [form] = Form.useForm();
  const [chatConf, setChatConf] = useState<any>(null);

  useInit(async () => {
    const chatData = await invoke('get_chat_conf');
    setChatConf(chatData);
  });

  useEffect(() => {
    form.setFieldsValue(clone(chatConf));
  }, [chatConf])

  const onCancel = () => {
    form.setFieldsValue(chatConf);
  };

  const onReset = async () => {
    const chatData = await invoke('reset_chat_conf');
    setChatConf(chatData);
    const isOk = await dialog.ask(`Configuration reset successfully, whether to restart?`, {
      title: 'ChatGPT Preferences'
    });
    if (isOk) {
      process.relaunch();
      return;
    }
    message.success('Configuration reset successfully');
  };

  const onFinish = async (values: any) => {
    if (!isEqual(omit(chatConf, ['default_origin']), values)) {
      await invoke('form_confirm', { data: values, label: 'main' });
      const isOk = await dialog.ask(`Configuration saved successfully, whether to restart?`, {
        title: 'ChatGPT Preferences'
      });
      if (isOk) {
        process.relaunch();
        return;
      }
      message.success('Configuration saved successfully');
    }
  };

  return (
    <div>
      <FilePath paths={CHAT_CONF_JSON} />
      <Form
        form={form}
        style={{ maxWidth: 500 }}
        onFinish={onFinish}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 15, offset: 1 }}
      >
        <Tabs
          items={[
            { label: 'General', key: 'general', children: <General /> },
            { label: 'Main Window', key: 'main_window', children: <MainWindow /> },
            { label: 'SystemTray Window', key: 'tray_window', children: <TrayWindow /> },
          ]}
        />

        <Form.Item>
          <Space size={20}>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit">Submit</Button>
            <Button type="dashed" onClick={onReset}>Reset to defaults</Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  )
}