import { Form, Switch, Input, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

import { DISABLE_AUTO_COMPLETE } from '@/utils';
import SwitchOrigin from '@/components/SwitchOrigin';

const UALabel = () => {
  return (
    <span>
      User Agent (SystemTray){' '}
      <Tooltip
        title={<div>For a better experience, we recommend using the Mobile User-Agent.</div>}
      >
        <QuestionCircleOutlined style={{ color: '#1677ff' }} />
      </Tooltip>
    </span>
  );
};

export default function General() {
  return (
    <>
      <Form.Item label="Enable SystemTray" name="tray" valuePropName="checked">
        <Switch />
      </Form.Item>
      <SwitchOrigin name="tray" />
      <Form.Item label={<UALabel />} name="ua_tray">
        <Input.TextArea
          autoSize={{ minRows: 4, maxRows: 4 }}
          {...DISABLE_AUTO_COMPLETE}
          placeholder="Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
        />
      </Form.Item>
    </>
  );
}
