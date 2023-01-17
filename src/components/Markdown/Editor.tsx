import Editor from "@monaco-editor/react";
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

import './index.scss';

const MarkdownEditor = () => {
  return (
    <div>
      <PanelGroup direction="horizontal">
        <Panel>
          <Editor
            height="calc(100vh - 120px)"
            language="markdown"
          />
        </Panel>
        <PanelResizeHandle className="resize-handle" />
        <Panel collapsible={true}>
          <div>1284</div>
        </Panel>
        </PanelGroup>
    </div>
  )
};

export default MarkdownEditor;