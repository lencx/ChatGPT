import { FC } from 'react';
import ReactMarkdown from 'react-markdown';
import SyntaxHighlighter from 'react-syntax-highlighter';
import agate from 'react-syntax-highlighter/dist/esm/styles/hljs/agate';

import './index.scss';

interface MarkdownProps {
  children: string;
}

const Markdown: FC<MarkdownProps> = ({ children }) => {

  return (
    <div className='markdown-body'>
      <ReactMarkdown
        children={children}
        linkTarget="_blank"
        components={{
          code({node, inline, className, children, ...props}) {
            const match = /language-(\w+)/.exec(className || '')
            return !inline && match ? (
              <SyntaxHighlighter
                children={String(children).replace(/\n$/, '')}
                style={agate as any}
                language={match[1]}
                showLineNumbers
                lineNumberStyle={{ color: '#999' }}
                PreTag="div"
                {...props}
              />
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            )
          }
        }}
      />
    </div>
  )
}

export default Markdown;