import { FC, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';

interface MarkdownEditorProps {
  value?: string;
  onChange?: (v: string) => void;
  mode?: string;
}

const ScriptEditor: FC<MarkdownEditorProps> = ({
  value = 'console.log',
  onChange,
  mode = 'split',
}) => {
  const [content, setContent] = useState(value);

  useEffect(() => {
    setContent(value);
    onChange && onChange(value);
  }, [value]);

  const handleEdit = (e: any) => {
    setContent(e);
    onChange && onChange(e);
  };

  return (
    <div className="script-editor">
      <Editor language="js" value={content} onChange={handleEdit} />
    </div>
  );
};

export default ScriptEditor;
