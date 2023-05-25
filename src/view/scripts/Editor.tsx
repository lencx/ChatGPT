import { FC, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Breadcrumb, Tag, Popconfirm } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { fs, shell, dialog, process } from '@tauri-apps/api';

import useInit from '@/hooks/useInit';
import { getPath } from './config';

interface ScriptEditorProps {
  onChange?: (v: string) => void;
}

const ScriptEditor: FC<ScriptEditorProps> = ({ onChange }) => {
  const [filePath, setFilePath] = useState('');
  const [source, setSource] = useState('// write your script here\n');
  const location = useLocation();
  const state = location?.state;

  useInit(async () => {
    const file = await getPath(state);
    setFilePath(file);
    setSource(await fs.readTextFile(file));
  });

  const handleEdit = (e: any) => {
    setSource(e);
    onChange && onChange(e);
  };

  const handleSave = async () => {
    await fs.writeTextFile(filePath, source);
    const isOk = await dialog.ask(
      'The script will take effect after the application is restarted. Do you want to restart now?',
      {
        title: 'Script saved successfully',
      },
    );

    if (isOk) {
      process.relaunch();
    }
  };

  const handleReset = async () => {
    setSource(await fs.readTextFile(filePath));
  };

  return (
    <div className="script-editor">
      <Breadcrumb className="editor-task" separator="">
        <Breadcrumb.Item onClick={() => history.go(-1)}>
          <ArrowLeftOutlined />
        </Breadcrumb.Item>
        <Popconfirm
          placement="topRight"
          title="Are you sure you want to save the changes? It is a risky operation, but you can restore it through the sync button."
          onConfirm={handleSave}
          onCancel={handleReset}
          okText="Yes"
          cancelText="No"
          overlayStyle={{ width: 300 }}
        >
          <Tag className="editor-btn" color="#108ee9">
            Save
          </Tag>
        </Popconfirm>
        <Breadcrumb.Item onClick={() => shell.open(filePath)}>{filePath}</Breadcrumb.Item>
      </Breadcrumb>
      <Editor height="80vh" language="javascript" value={source} onChange={handleEdit} />
    </div>
  );
};

export default ScriptEditor;
