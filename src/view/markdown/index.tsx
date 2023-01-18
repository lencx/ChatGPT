import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Breadcrumb } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import MarkdownEditor from '@/components/Markdown/Editor';
import { fs, shell } from '@tauri-apps/api';

import useInit from '@/hooks/useInit';
import { getPath } from '@/view/notes/config';
import './index.scss';

export default function Markdown() {
  const [filePath, setFilePath] = useState('');
  const [source, setSource] = useState('');
  const location = useLocation();
  const state = location?.state;

  useInit(async () => {
    const file = await getPath(state);
    setFilePath(file);
    setSource(await fs.readTextFile(file))
  })

  const handleChange = async (v: string) => {
    await fs.writeTextFile(filePath, v);
  };

  return (
    <>
      <div className="md-task">
        <Breadcrumb separator="">
          <Breadcrumb.Item onClick={() => history.go(-1)}>
            <ArrowLeftOutlined />
          </Breadcrumb.Item>
          <Breadcrumb.Item onClick={() => shell.open(filePath)}>
            {filePath}
          </Breadcrumb.Item>
        </Breadcrumb>
      </div>
      <MarkdownEditor value={source} onChange={handleChange} />
    </>
  );
}