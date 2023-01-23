import { FC } from 'react';
import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import SyntaxHighlighter from 'react-syntax-highlighter';
import agate from 'react-syntax-highlighter/dist/esm/styles/hljs/agate';

import './index.scss';

interface MarkdownProps {
  children: string;
  className?: string;
}

const Markdown: FC<MarkdownProps> = ({ children, className }) => {
  return (
    <div className={clsx(className, 'markdown-body')}>
      <div>
        <ReactMarkdown
          children={children}
          linkTarget="_blank"
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
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
              );
            },
          }}
        />
      </div>
    </div>
  );
};

export default Markdown;
