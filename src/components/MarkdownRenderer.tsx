"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  isUser?: boolean;
  className?: string;
}

export function MarkdownRenderer({
  content,
  isUser = false,
  className = "",
}: MarkdownRendererProps) {
  return (
    <div
      className={`markdown-content text-sm leading-relaxed ${
        isUser ? "markdown-user" : "markdown-assistant"
      } ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          strong: ({ children }) => (
            <strong className={isUser ? "font-extrabold text-white" : "font-extrabold text-slate-900"}>
              {children}
            </strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          h1: ({ children }) => (
            <h1 className="text-base font-black mb-2 mt-3 first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-extrabold mb-1.5 mt-2.5 first:mt-0">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs font-bold mb-1 mt-2 first:mt-0">{children}</h3>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 mb-2.5 pl-1.5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 mb-2.5 pl-1.5">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-snug">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote
              className={`border-l-3 pl-3 py-1 my-2 italic text-xs rounded-r-lg ${
                isUser
                  ? "border-white/60 bg-white/10 text-white/90"
                  : "border-purple-500 bg-purple-50/70 text-slate-700"
              }`}
            >
              {children}
            </blockquote>
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !className && typeof children === "string" && !children.includes("\n");
            if (isInline) {
              return (
                <code
                  className={`px-1.5 py-0.5 rounded text-[12px] font-mono font-semibold ${
                    isUser
                      ? "bg-white/20 text-white border border-white/30"
                      : "bg-slate-100 text-purple-700 border border-slate-200"
                  }`}
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <pre
                className={`p-3 rounded-2xl overflow-x-auto text-xs font-mono my-2.5 ${
                  isUser
                    ? "bg-black/30 text-white border border-white/20"
                    : "bg-slate-900 text-emerald-400 border border-slate-800 shadow-md"
                }`}
              >
                <code {...props}>{children}</code>
              </pre>
            );
          },
          hr: () => (
            <hr
              className={`my-3 border-t ${
                isUser ? "border-white/20" : "border-slate-200"
              }`}
            />
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-3">
              <table className="min-w-full text-xs text-left border-collapse border border-slate-200 rounded-lg">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-slate-200 p-2 font-bold bg-slate-50 text-slate-800">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-slate-200 p-2 text-slate-700">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
