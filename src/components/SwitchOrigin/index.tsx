import { FC } from 'react';
import { Form, Select, Tag } from 'antd';

import useJson from '@/hooks/useJson';
import { DISABLE_AUTO_COMPLETE, CHAT_CONF_JSON, CHAT_AWESOME_JSON } from '@/utils';

interface SwitchOriginProps {
  name: string;
}

const SwitchOrigin: FC<SwitchOriginProps> = ({ name }) => {
  const { json: list = [] } = useJson<any[]>(CHAT_AWESOME_JSON);

  return (
    <Form.Item
      label={<span>Switch Origin ({name === 'origin' ? 'Main' : 'SystemTray'})</span>}
      name={name}
    >
      <Select showSearch {...DISABLE_AUTO_COMPLETE} optionLabelProp="url">
        {[{ title: 'ChatGPT', url: 'https://chat.openai.com' }, ...list].map((i) => (
          <Select.Option key={i.url} label={i.title} value={i.url}>
            <Tag color="geekblue">{i.title}</Tag> {i.url}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
};

export default SwitchOrigin;
