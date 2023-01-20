import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Breadcrumb } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import MarkdownEditor from '@/components/Markdown/Editor';
import { fs, shell } from '@tauri-apps/api';

import useInit from '@/hooks/useInit';
import SplitIcon from '@/icons/SplitIcon';
import { getPath } from '@/view/notes/config';
import './index.scss';

const modeMap: any = {
  0: 'split',
  1: 'md',
  2: 'doc',
}

export default function Markdown() {
  const [filePath, setFilePath] = useState('');
  const [source, setSource] = useState('');
  const [previewMode, setPreviewMode] = useState(0);
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

  const handlePreview = () => {
    let mode = previewMode + 1;
    if (mode > 2) mode = 0;
    setPreviewMode(mode);
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
        <div>
          <SplitIcon onClick={handlePreview} style={{ fontSize: 18, color: 'rgba(0,0,0,0.5)' }} />
        </div>
      </div>
      <MarkdownEditor value={source} onChange={handleChange} mode={modeMap[previewMode]} />
    </>
  );
}