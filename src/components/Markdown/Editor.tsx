import { FC, useEffect, useState } from 'react';
import Editor from "@monaco-editor/react";
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

import Markdown from '@/components/Markdown';
import './index.scss';

interface MarkdownEditorProps {
  value?: string;
  onChange?: (v: string) => void;
  mode?: string;
}

const MarkdownEditor: FC<MarkdownEditorProps> = ({ value = '', onChange, mode = 'split' }) => {
  const [content, setContent] = useState(value);

  useEffect(() => {
    setContent(value);
    onChange && onChange(value);
  }, [value])

  const handleEdit = (e: any) => {
    setContent(e);
    onChange && onChange(e);
  }

  const isSplit = mode === 'split';

  return (
    <div className="md-main">
      <PanelGroup direction="horizontal">
        {['md', 'split'].includes(mode) && (
          <Panel>
            <Editor
              language="markdown"
              value={content}
              onChange={handleEdit}
            />
          </Panel>
        )}
        {isSplit && <PanelResizeHandle className="resize-handle" />}
        {['doc', 'split'].includes(mode) && (
          <Panel>
            <Markdown className="edit-preview">{content}</Markdown>
          </Panel>
        )}
        </PanelGroup>
    </div>
  )
};

export default MarkdownEditor;