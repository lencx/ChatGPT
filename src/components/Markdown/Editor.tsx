import { FC, useEffect, useState } from 'react';
import Editor from "@monaco-editor/react";
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

import Markdown from '@/components/Markdown';
import './index.scss';

interface MarkdownEditorProps {
  value?: string;
  onChange?: (v: string) => void;
}

const MarkdownEditor: FC<MarkdownEditorProps> = ({ value = '', onChange }) => {
  const [content, setContent] = useState(value);

  useEffect(() => {
    setContent(value);
    onChange && onChange(value);
  }, [value])

  const handleEdit = (e: any) => {
    setContent(e);
    onChange && onChange(e);
  }

  return (
    <div className="md-main">
      <PanelGroup direction="horizontal">
        <Panel>
          <Editor
            language="markdown"
            value={content}
            onChange={handleEdit}
          />
        </Panel>
        <PanelResizeHandle className="resize-handle" />
        <Panel collapsible={true}>
          <Markdown className="edit-preview">{content}</Markdown>
        </Panel>
        </PanelGroup>
    </div>
  )
};

export default MarkdownEditor;