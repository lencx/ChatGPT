import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Form, Select, Tag, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

import useJson from '@/hooks/useJson';
import { DISABLE_AUTO_COMPLETE, CHAT_AWESOME_JSON } from '@/utils';
interface SwitchOriginProps {
  name: string;
}

const SwitchOrigin: FC<SwitchOriginProps> = ({ name }) => {
  const { json: list = [] } = useJson<any[]>(CHAT_AWESOME_JSON);

  return (
    <Form.Item
      label={
        <span>
          Switch Origin ({name === 'origin' ? 'Main' : 'SystemTray'}){' '}
          <Tooltip
            title={
              <div>
                If you need to set a new URL as the application loading window, please add the URL
                in the <Link to="/">Awesome</Link> menu and then select it.
              </div>
            }
          >
            <QuestionCircleOutlined style={{ color: '#1677ff' }} />
          </Tooltip>
        </span>
      }
      name={name}
    >
      <Select showSearch {...DISABLE_AUTO_COMPLETE} optionLabelProp="url">
        {[{ title: 'ChatGPT', url: 'https://chat.openai.com' }, ...list].map((i) => (
          <Select.Option key={i.url} label={i.title} value={i.url} title={i.url}>
            <Tag color={i.title === 'ChatGPT' ? 'orange' : 'geekblue'}>{i.title}</Tag> {i.url}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
};

export default SwitchOrigin;
