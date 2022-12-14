import { useEffect, useState } from 'react';
import { Form, Radio, Switch, Input, Button, Space, message } from 'antd';
import { invoke } from '@tauri-apps/api';
import { platform } from '@tauri-apps/api/os';
import { ask } from '@tauri-apps/api/dialog';
import { relaunch } from '@tauri-apps/api/process';
import { clone, pick, isEqual } from 'lodash';

const restartNames = ['origin', 'ua_window', 'ua_tray']

export default function General() {
  const [form] = Form.useForm();
  const [platformInfo, setPlatform] = useState<string>('');
  const [chatConf, setChatConf] = useState<any>(null);

  const init = async () => {
    setPlatform(await platform());
    const chatData = await invoke('get_chat_conf');
    setChatConf(chatData);
  }

  useEffect(() => {
    init();
  }, [])

  useEffect(() => {
    form.setFieldsValue(clone(chatConf));
  }, [chatConf])

  console.log('«28» /src/view/General.tsx ~> ', chatConf);


  const onCancel = () => {
    form.setFieldsValue(chatConf);
  };

  const onFinish = async (values: any) => {
    await invoke('form_confirm', { data: values, label: 'main' });
    console.log('«33» /src/view/General.tsx ~> ', pick(chatConf, restartNames), pick(values, restartNames));

    if (!isEqual(pick(chatConf, restartNames), pick(values, restartNames))) {
      const isOk = await ask(`Configuration saved successfully, whether to restart?`, {
        title: 'ChatGPT Preferences'
      });
      if (isOk) relaunch();
      return;
    }

    message.success('Configuration saved successfully');
  };

  return (
    <Form
      form={form}
      style={{ maxWidth: 500 }}
      onFinish={onFinish}
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 15, offset: 1 }}
    >
      <Form.Item label="Theme" name="theme">
        <Radio.Group>
          <Radio value="Light">Light</Radio>
          <Radio value="Dark">Dark</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item label="Always on Top" name="always_on_top" valuePropName="checked">
        <Switch />
      </Form.Item>
      {platformInfo === 'darwin' && (
        <Form.Item label="Titlebar" name="titlebar" valuePropName="checked">
          <Switch />
        </Form.Item>
      )}
      <Form.Item label="Switch Origin" name="origin">
        <Input placeholder="https://chat.openai.com" />
      </Form.Item>
      <Form.Item label="User Agent (Window)" name="ua_window">
        <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} placeholder="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36" />
      </Form.Item>
      <Form.Item label="User Agent (Tray)" name="ua_tray">
        <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} placeholder="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36" />
      </Form.Item>
      <Form.Item>
        <Space size={20}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}