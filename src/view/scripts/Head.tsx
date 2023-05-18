import { useEffect, useState } from 'react';
import { Tag, Collapse, Tooltip } from 'antd';
import { EditOutlined, FileSyncOutlined } from '@ant-design/icons';
import { path, fs, shell } from '@tauri-apps/api';

import { chatRoot } from '@/utils';
import useInit from '@/hooks/useInit';

export type ScriptInfo = {
  name: string;
  filePath: string;
  file: string;
};

interface ScriptHeadProps {
  name: string;
  onEdit?: (data: ScriptInfo) => void;
  activeKey: string;
}

export default function ScriptHead({ name, onEdit, activeKey }: ScriptHeadProps) {
  const [file, setFile] = useState('');
  const [filePath, setFilePath] = useState('');
  const [editing, setEdit] = useState(false);

  useEffect(() => {
    if (activeKey !== name) {
      setEdit(false);
    }
  }, [activeKey]);

  useInit(async () => {
    const filePath = await path.join(await chatRoot(), 'scripts', name);
    setFilePath(filePath);
    const content = await fs.readTextFile(filePath);
    setFile(content);
  });

  const handleGoFile = () => {
    shell.open(filePath);
  };

  const handleEdit = async () => {
    setEdit(true);
    onEdit && onEdit({ name, filePath, file });
  };

  const handleCancel = async () => {
    setEdit(false);
  };

  const handleSave = async () => {
    setEdit(false);
  };

  const handleSync = async () => {};

  const handleURL = async () => {
    shell.open(`https://github.com/lencx/ChatGPT/blob/main/scripts/${name}`);
  };

  const version = '0.1.0';
  return (
    <>
      <span>
        <Tag color="orange">{version}</Tag>
      </span>
      {editing ? (
        <span>
          <Tag className="action-btn" onClick={handleCancel} color="default">
            Cancel
          </Tag>
          <Tag className="action-btn" onClick={handleSave} color="geekblue-inverse">
            Save
          </Tag>
        </span>
      ) : (
        <Tag className="action-btn" title="Script Edit" onClick={handleEdit} color="blue-inverse">
          <EditOutlined />
        </Tag>
      )}
      <Tag className="action-btn" title="Script Sync" onClick={handleSync} color="orange-inverse">
        <FileSyncOutlined />
      </Tag>
      <span>
        <Tag className="file-path" color="blue" onClick={handleGoFile}>
          Path: {filePath}
        </Tag>
      </span>
      <span>
        <Tag className="file-path" color="green" onClick={handleURL}>
          URL: lencx/ChatGPT/scripts/{name}
        </Tag>
      </span>
    </>
  );
}
