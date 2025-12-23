'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ComponentProps } from 'react'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className={`markdown-content ${className}`}
      components={{
        // Headers
        h1: ({ children, ...props }) => (
          <h1 className="text-2xl font-bold mb-4 mt-6" {...props}>{children}</h1>
        ),
        h2: ({ children, ...props }) => (
          <h2 className="text-xl font-bold mb-3 mt-5" {...props}>{children}</h2>
        ),
        h3: ({ children, ...props }) => (
          <h3 className="text-lg font-semibold mb-2 mt-4" {...props}>{children}</h3>
        ),
        
        // Paragraphs and text
        p: ({ children, ...props }) => (
          <p className="mb-3 leading-relaxed" {...props}>{children}</p>
        ),
        
        // Lists
        ul: ({ children, ...props }) => (
          <ul className="list-disc pl-6 mb-3 space-y-1" {...props}>{children}</ul>
        ),
        ol: ({ children, ...props }) => (
          <ol className="list-decimal pl-6 mb-3 space-y-1" {...props}>{children}</ol>
        ),
        li: ({ children, ...props }) => (
          <li className="leading-relaxed" {...props}>{children}</li>
        ),
        
        // Code
        code: ({ className, children, ...props }: ComponentProps<'code'>) => {
          const match = /language-(\w+)/.exec(className || '')
          const isInline = !match
          
          return isInline ? (
            <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
              {children}
            </code>
          ) : (
            <code className="block bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm font-mono overflow-x-auto mb-3" {...props}>
              {children}
            </code>
          )
        },
        pre: ({ children, ...props }) => (
          <pre className="mb-3" {...props}>{children}</pre>
        ),
        
        // Emphasis
        strong: ({ children, ...props }) => (
          <strong className="font-semibold" {...props}>{children}</strong>
        ),
        em: ({ children, ...props }) => (
          <em className="italic" {...props}>{children}</em>
        ),
        
        // Links
        a: ({ children, href, ...props }) => (
          <a 
            href={href} 
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          >
            {children}
          </a>
        ),
        
        // Blockquotes
        blockquote: ({ children, ...props }) => (
          <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-3" {...props}>
            {children}
          </blockquote>
        ),
        
        // Horizontal rule
        hr: ({ ...props }) => (
          <hr className="my-4 border-gray-300 dark:border-gray-600" {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}