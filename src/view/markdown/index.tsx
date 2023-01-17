import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Breadcrumb } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import MarkdownEditor from '@/components/Markdown/Editor';

import useInit from '@/hooks/useInit';
import { getPath } from '@/view/notes/config';

export default function Markdown() {
  const [filePath, setFilePath] = useState('');
  const location = useLocation();
  const state = location?.state;

  useInit(async () => {
    setFilePath(await getPath(state));
  })

  return (
    <>
      <Breadcrumb separator=" ">
        <Breadcrumb.Item href="">
          <ArrowLeftOutlined />
        </Breadcrumb.Item>
        <Breadcrumb.Item href="">
          {filePath}
        </Breadcrumb.Item>
      </Breadcrumb>
      <MarkdownEditor />
    </>
  );
}