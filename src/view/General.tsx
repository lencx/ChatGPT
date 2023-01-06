import { useEffect, useState } from 'react';
import { Form, Radio, Switch, Input, Button, Space, message, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { invoke, shell, path } from '@tauri-apps/api';
import { platform } from '@tauri-apps/api/os';
import { ask } from '@tauri-apps/api/dialog';
import { relaunch } from '@tauri-apps/api/process';
import { clone, omit, isEqual } from 'lodash';

import useInit from '@/hooks/useInit';
import { DISABLE_AUTO_COMPLETE, chatRoot } from '@/utils';

const AutoUpdateLabel = () => {
  return (
    <span>
      Auto Update <Tooltip title={(
          <div>
            <div>Auto Update Policy</div>
            <span><strong>Prompt</strong>: prompt to install</span><br/>
            <span><strong>Silent</strong>: install silently</span><br/>
            {/*<span><strong>Disable</strong>: disable auto update</span><br/>*/}
          </div>
    )}><QuestionCircleOutlined style={{ color: '#1677ff' }} /></Tooltip>
    </span>
  )
}

const OriginLabel = ({ url }: { url: string }) => {
  return (
    <span>
      Switch Origin <Tooltip title={`Default: ${url}`}><QuestionCircleOutlined style={{ color: '#1677ff' }} /></Tooltip>
    </span>
  )
}

const GlobalShortcut = () => {
  return (
    <div>
      Global Shortcut
      {' '}
      <Tooltip title={(
        <div>
          <div>Shortcut definition, modifiers and key separated by "+" e.g. CmdOrControl+Q</div>
          <div style={{ margin: '10px 0'}}>If empty, the shortcut is disabled.</div>
          <a href="https://tauri.app/v1/api/js/globalshortcut" target="_blank">https://tauri.app/v1/api/js/globalshortcut</a>
        </div>
      )}>
        <QuestionCircleOutlined style={{ color: '#1677ff' }} />
      </Tooltip>
    </div>
  )
}

export default function General() {
  const [form] = Form.useForm();
  const [jsonPath, setJsonPath] = useState('');
  const [platformInfo, setPlatform] = useState<string>('');
  const [chatConf, setChatConf] = useState<any>(null);

  useInit(async () => {
    setJsonPath(await path.join(await chatRoot(), 'chat.conf.json'));

    setPlatform(await platform());
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
    const isOk = await ask(`Configuration reset successfully, whether to restart?`, {
      title: 'ChatGPT Preferences'
    });
    if (isOk) {
      relaunch();
      return;
    }
    message.success('Configuration reset successfully');
  };

  const onFinish = async (values: any) => {
    if (!isEqual(omit(chatConf, ['default_origin']), values)) {
      await invoke('form_confirm', { data: values, label: 'main' });
      const isOk = await ask(`Configuration saved successfully, whether to restart?`, {
        title: 'ChatGPT Preferences'
      });
      if (isOk) {
        relaunch();
        return;
      }
      message.success('Configuration saved successfully');
    }
  };

  return (
    <>
      <div className="chat-table-tip">
        <div className="chat-sync-path">
          <div>PATH: <a onClick={() => shell.open(jsonPath)} title={jsonPath}>{jsonPath}</a></div>
        </div>
      </div>
      <Form
        form={form}
        style={{ maxWidth: 500 }}
        onFinish={onFinish}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 15, offset: 1 }}
      >
        <Form.Item label="Stay On Top" name="stay_on_top" valuePropName="checked">
          <Switch />
        </Form.Item>
        {platformInfo === 'darwin' && (
          <Form.Item label="Titlebar" name="titlebar" valuePropName="checked">
            <Switch />
          </Form.Item>
        )}
        <Form.Item label="Theme" name="theme">
          <Radio.Group>
            <Radio value="Light">Light</Radio>
            <Radio value="Dark">Dark</Radio>
            {["darwin", "windows"].includes(platformInfo) && (
              <Radio value="System">System</Radio>
            )}
          </Radio.Group>
        </Form.Item>
        <Form.Item label={<AutoUpdateLabel />} name="auto_update">
          <Radio.Group>
            <Radio value="Prompt">Prompt</Radio>
            <Radio value="Silent">Silent</Radio>
            {/*<Radio value="Disable">Disable</Radio>*/}
          </Radio.Group>
        </Form.Item>
        <Form.Item label={<GlobalShortcut />} name="global_shortcut">
          <Input placeholder="CmdOrCtrl+Shift+O" {...DISABLE_AUTO_COMPLETE} />
        </Form.Item>
        <Form.Item label={<OriginLabel url={chatConf?.default_origin} />} name="origin">
          <Input placeholder="https://chat.openai.com" {...DISABLE_AUTO_COMPLETE} />
        </Form.Item>
        <Form.Item label="User Agent (Window)" name="ua_window">
          <Input.TextArea autoSize={{ minRows: 4, maxRows: 4 }} {...DISABLE_AUTO_COMPLETE} placeholder="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36" />
        </Form.Item>
        <Form.Item label="User Agent (SystemTray)" name="ua_tray">
          <Input.TextArea autoSize={{ minRows: 4, maxRows: 4 }} {...DISABLE_AUTO_COMPLETE} placeholder="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36" />
        </Form.Item>
        <Form.Item>
          <Space size={20}>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit">Submit</Button>
            <Button type="dashed" onClick={onReset}>Reset to defaults</Button>
          </Space>

        </Form.Item>
      </Form>
    </>
  )
}