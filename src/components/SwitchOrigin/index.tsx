import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Form, Select, Tag, Tooltip, Switch } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

import useJson from '@/hooks/useJson';
import { DISABLE_AUTO_COMPLETE, CHAT_AWESOME_JSON } from '@/utils';
interface SwitchOriginProps {
  name: string;
}

const SwitchOrigin: FC<SwitchOriginProps> = ({ name }) => {
  const { json: list = [] } = useJson<any[]>(CHAT_AWESOME_JSON);
  const form = Form.useFormInstance();

  const labelName = `(${name === 'main' ? 'Main' : 'SystemTray'})`;
  const dashboardName = `${name}_dashboard`;
  const originName = `${name}_origin`;
  const isEnable = Form.useWatch(dashboardName, form);

  return (
    <>
      <Form.Item
        label={
          <span>
            Dashboard {labelName}{' '}
            <Tooltip
              title={
                <div>
                  <p>
                    <b>Set the URL dashboard as an application window.</b>
                  </p>
                  <p>
                    If this is enabled, the <Tag color="blue">Switch Origin {labelName}</Tag>{' '}
                    setting will be invalid.
                  </p>
                  <p>
                    If you want to add a new URL to the dashboard, add it in the{' '}
                    <Link to="/awesome">Awesome</Link> menu and make sure it is enabled.
                  </p>
                </div>
              }
            >
              <QuestionCircleOutlined style={{ color: '#1677ff' }} />
            </Tooltip>
          </span>
        }
        name={dashboardName}
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>
      <Form.Item
        label={
          <span>
            Switch Origin {labelName}{' '}
            <Tooltip
              title={
                <div>
                  <p>
                    <b>Set a single URL as an application window.</b>
                  </p>
                  <p>
                    If you need to set a new URL as the application loading window, please add the
                    URL in the <Link to="/awesome">Awesome</Link> menu and then select it.
                  </p>
                </div>
              }
            >
              <QuestionCircleOutlined style={{ color: '#1677ff' }} />
            </Tooltip>
          </span>
        }
        name={originName}
      >
        <Select disabled={isEnable} showSearch {...DISABLE_AUTO_COMPLETE} optionLabelProp="url">
          {[{ title: 'ChatGPT', url: 'https://chat.openai.com' }, ...list].map((i, idx) => (
            <Select.Option
              key={`${idx}_${i.url}`}
              label={i.title}
              value={i.url}
              title={`${i.title}: ${i.url}`}
            >
              <Tag color={i.title === 'ChatGPT' ? 'orange' : 'geekblue'}>{i.title}</Tag> {i.url}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </>
  );
};

export default SwitchOrigin;
