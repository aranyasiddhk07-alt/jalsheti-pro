import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';

interface DocViewerProps {
  title: string;
  content: string;
}

export default function DocViewer({ title, content }: DocViewerProps) {
  const [mermaidReady, setMermaidReady] = useState(false);

  useEffect(() => {
    if (!document.querySelector('#mermaid-script')) {
      const script = document.createElement('script');
      script.id = 'mermaid-script';
      script.src = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js';
      script.onload = () => {
        window.mermaid?.initialize?.({ startOnLoad: true, theme: 'default' });
        setMermaidReady(true);
      };
      document.head.appendChild(script);
    } else {
      setMermaidReady(true);
    }

    if (mermaidReady) {
      window.mermaid?.run?.();
    }
  }, [content, mermaidReady]);

  return (
    <div className="min-h-screen bg-surface-bg font-primary">
      <header className="bg-primary-700 text-white px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <Link to="/" className="text-primary-200 hover:text-white text-sm">← Home</Link>
            <h1 className="text-xl font-bold mt-1">{title}</h1>
          </div>
          <Link to="/documentation" className="text-primary-200 hover:text-white text-sm">
            ← Docs
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <article className="bg-white rounded-xl shadow-md p-6 md:p-10">
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 className="text-3xl font-bold text-primary-700 mt-8 mb-4 pb-2 border-b-2 border-primary-200">{children}</h1>,
              h2: ({ children }) => <h2 className="text-2xl font-bold text-secondary-800 mt-8 mb-3">{children}</h2>,
              h3: ({ children }) => <h3 className="text-xl font-semibold text-secondary-700 mt-6 mb-2">{children}</h3>,
              p: ({ children }) => <p className="text-body text-secondary-600 leading-relaxed mb-4">{children}</p>,
              ul: ({ children }) => <ul className="list-disc ml-6 mb-4 space-y-1 text-secondary-600">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal ml-6 mb-4 space-y-1 text-secondary-600">{children}</ol>,
              li: ({ children }) => <li className="text-body">{children}</li>,
              table: ({ children }) => (
                <div className="overflow-x-auto mb-6 border border-secondary-200 rounded-lg">
                  <table className="min-w-full text-sm">{children}</table>
                </div>
              ),
              thead: ({ children }) => <thead className="bg-secondary-100">{children}</thead>,
              th: ({ children }) => <th className="px-4 py-2 text-left font-semibold text-secondary-700 border-b border-secondary-200">{children}</th>,
              td: ({ children }) => <td className="px-4 py-2 text-secondary-600 border-b border-secondary-100">{children}</td>,
              tr: ({ children }) => <tr className="hover:bg-secondary-50">{children}</tr>,
              code: ({ className, children }) => {
                const isBlock = className?.includes('language-');
                if (isBlock) {
                  const lang = className?.replace('language-', '') || '';
                  if (lang === 'mermaid') {
                    return (
                      <div className="my-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <pre className="mermaid text-xs overflow-x-auto">{String(children)}</pre>
                      </div>
                    );
                  }
                  return (
                    <div className="my-4 rounded-lg overflow-hidden border border-secondary-200">
                      <div className="bg-secondary-800 text-secondary-300 text-xs px-4 py-1 font-mono">{lang}</div>
                      <pre className="bg-secondary-900 text-green-400 p-4 text-xs overflow-x-auto">{children}</pre>
                    </div>
                  );
                }
                return <code className="bg-secondary-100 text-secondary-800 px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>;
              },
              pre: ({ children }) => <>{children}</>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary-400 bg-primary-50 px-4 py-2 my-4 rounded-r-lg text-secondary-600 italic">
                  {children}
                </blockquote>
              ),
              hr: () => <hr className="my-8 border-secondary-200" />,
              strong: ({ children }) => <strong className="font-bold text-secondary-800">{children}</strong>,
              a: ({ href, children }) => (
                <a href={href} className="text-primary-600 hover:text-primary-800 underline" target={href?.startsWith('http') ? '_blank' : undefined} rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}>
                  {children}
                </a>
              ),
              img: ({ src, alt }) => <img src={src} alt={alt} className="max-w-full rounded-lg my-4 shadow-md" />,
            }}
          >
            {content}
          </ReactMarkdown>
        </article>
      </main>
    </div>
  );
}

declare global {
  interface Window {
    mermaid?: {
      initialize?: (config: Record<string, unknown>) => void;
      run?: () => void;
    };
  }
}
