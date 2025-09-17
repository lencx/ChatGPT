import { useState } from 'react';
import { invoke } from '@tauri-apps/api';
import { Tabs, Tag } from 'antd';

import { GITHUB_LOG_URL } from '@/utils';
import useInit from '@/hooks/useInit';
import Markdown from '@/components/Markdown';
import './index.scss';

export default function About() {
  const [logContent, setLogContent] = useState('');

  useInit(async () => {
    const data = (await invoke('get_data', { url: GITHUB_LOG_URL })) || '';
    setLogContent(data as string);
  });

  return (
    <div className="about">
      <Tabs
        items={[
          { label: 'About Courtney AI', key: 'about', children: <AboutCourtneyAI /> },
          { label: 'Update Log', key: 'log', children: <LogTab content={logContent} /> },
        ]}
      />
    </div>
  );
}

const AboutCourtneyAI = () => {
  return (
    <div className="about-tab">
      <Tag>Courtney AI Desktop Application (Mac, Windows and Linux)</Tag>
      <p>
        🕒 History versions:{' '}
        <a href="https://github.com/CourtneyAviation/Courtney_AI_Desktop/releases" target="_blank">
          CourtneyAviation/Courtney_AI_Desktop/releases
        </a>
      </p>
      <p>
        It is just a wrapper for the
        <a href="http://172.30.30.111:8000" target="_blank" title="http://172.30.30.111:8000">
          {' '}
          OpenAI Chat Interface{' '}
        </a>
        website, no other data transfer exists (you can check the{' '}
        <a
          href="https://github.com/CourtneyAviation/Courtney_AI_Desktop"
          className="link"
          title="https://github.com/CourtneyAviation/Courtney_AI_Desktop"
        >
          {' '}
          source code{' '}
        </a>
        ). The development and maintenance of this software has taken up a lot of my time. If it
        helps you, you can buy me a cup of coffee (Chinese users can use WeChat to scan the code),
        thanks!
      </p>
      <p className="imgs" style={{ float: 'left' }}>
        <a href="https://www.buymeacoffee.com/lencx" target="_blank">
          <img
            src="https://cdn.buymeacoffee.com/buttons/v2/default-blue.png"
            alt="Buy Me A Coffee"
          />
        </a>{' '}
        <br />
        <img
          width="200"
          src="https://user-images.githubusercontent.com/16164244/207228025-117b5f77-c5d2-48c2-a070-774b7a1596f2.png"
        />
      </p>
    </div>
  );
};

const LogTab = ({ content }: { content: string }) => {
  return (
    <div>
      <p>
        Ref:{' '}
        <a
          href="https://github.com/CourtneyAviation/Courtney_AI_Desktop/blob/main/UPDATE_LOG.md"
          target="_blank"
        >
          CourtneyAviation/Courtney_AI_Desktop/UPDATE_LOG.md
        </a>
      </p>
      <Markdown className="log-tab" children={content} />
    </div>
  );
};
