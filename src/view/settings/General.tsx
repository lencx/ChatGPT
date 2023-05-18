import { useState } from 'react';
import { Form, Radio, Switch, Input, Tooltip, Select, Tag } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { platform } from '@tauri-apps/api/os';

import useInit from '@/hooks/useInit';
import { DISABLE_AUTO_COMPLETE } from '@/utils';

export default function General() {
  const [platformInfo, setPlatform] = useState('');
  const [vlist, setVoices] = useState<any[]>([]);

  useInit(async () => {
    setPlatform(await platform());
    speechSynthesis.addEventListener('voiceschanged', () => {
      const voices = speechSynthesis.getVoices();
      console.log(voices);
      setVoices(voices);
    });
    setVoices(speechSynthesis.getVoices());
  });

  return (
    <>
      <Form.Item label="Stay On Top" name="stay_on_top" valuePropName="checked">
        <Switch />
      </Form.Item>
      {/* <Form.Item label="Save Window State" name="save_window_state" valuePropName="checked">
        <Switch />
      </Form.Item> */}
      {platformInfo === 'darwin' && (
        <Form.Item label="Titlebar" name="titlebar" valuePropName="checked">
          <Switch />
        </Form.Item>
      )}
      {/* {platformInfo === 'darwin' && (
        <Form.Item label="Hide Dock Icon" name="hide_dock_icon" valuePropName="checked">
          <Switch />
        </Form.Item>
      )} */}
      <Form.Item label="Theme" name="theme">
        <Radio.Group>
          <Radio value="light">Light</Radio>
          <Radio value="dark">Dark</Radio>
          {['darwin', 'windows'].includes(platformInfo) && <Radio value="System">System</Radio>}
        </Radio.Group>
      </Form.Item>
      <Form.Item label={<AutoUpdateLabel />} name="auto_update">
        <Radio.Group>
          <Radio value="prompt">Prompt</Radio>
          <Radio value="silent">Silent</Radio>
          {/*<Radio value="disable">Disable</Radio>*/}
        </Radio.Group>
      </Form.Item>
      <Form.Item label={<GlobalShortcutLabel />} name="global_shortcut">
        <Input placeholder="CmdOrCtrl+Shift+O" {...DISABLE_AUTO_COMPLETE} />
      </Form.Item>
      <Form.Item label="Set Speech Language" name="speech_lang">
        <Select>
          {vlist.map((voice: any) => {
            return (
              <Select.Option key={voice.voiceURI} value={voice.voiceURI}>
                {voice.name} {': '}
                <Tag>{voice.lang}</Tag>
              </Select.Option>
            );
          })}
        </Select>
      </Form.Item>
    </>
  );
}

const AutoUpdateLabel = () => {
  return (
    <span>
      Auto Update{' '}
      <Tooltip
        title={
          <div>
            <div>Auto Update Policy</div>
            <div>
              <strong>Prompt</strong>: prompt to install
            </div>
            <div>
              <strong>Silent</strong>: install silently
            </div>
            {/* <div><strong>Disable</strong>: disable auto update</div> */}
          </div>
        }
      >
        <QuestionCircleOutlined style={{ color: '#1677ff' }} />
      </Tooltip>
    </span>
  );
};

const GlobalShortcutLabel = () => {
  return (
    <div>
      Global Shortcut{' '}
      <Tooltip
        title={
          <div>
            <div>Shortcut definition, modifiers and key separated by "+" e.g. CmdOrControl+Q</div>
            <div style={{ margin: '10px 0' }}>If empty, the shortcut is disabled.</div>
            <a href="https://tauri.app/v1/api/js/globalshortcut" target="_blank">
              https://tauri.app/v1/api/js/globalshortcut
            </a>
          </div>
        }
      >
        <QuestionCircleOutlined style={{ color: '#1677ff' }} />
      </Tooltip>
    </div>
  );
};
