import React, { useState, useEffect } from "react";

interface MonacoHighlighterProps {
  code: string;
  language?: string;
  theme?: string;
  tabSize?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function MonacoHighlighter({
  code,
  language = "python",
  theme = "vs-light",
  tabSize = 2,
  className = "",
  style = {},
}: MonacoHighlighterProps) {
  const [html, setHtml] = useState<string>("");

  // Helper to escape HTML for fallback
  const escapeHtml = (text: string) =>
    text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  useEffect(() => {
    let canceled = false;

    import("monaco-editor")
      .then((monaco) => {
        if (canceled) return;

        monaco.editor.setTheme(theme);

        return monaco.editor.colorize(code, language, { tabSize });
      })
      .then((colorizedHtml) => {
        if (!canceled) {
          setHtml(colorizedHtml || escapeHtml(code));
        }
      })
      .catch((err) => {
        if (!canceled) {
          console.error("Monaco colorize error:", err);
          setHtml(escapeHtml(code));
        }
      });

    return () => {
      canceled = true;
    };
  }, [code, language, theme, tabSize]);

  return (
    <pre
      className={`monaco-syntax-highlighter ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
      style={{
        margin: 0,
        padding: "4px 8px",
        background: "transparent",
        fontWeight: "bold",
        fontFamily: "monospace",
        fontSize: "14px",
        lineHeight: 1.4,
        whiteSpace: "pre-wrap",
        wordBreak: "keep-all",
        overflowWrap: "break-word",
        ...style,
      }}
    />
  );
}
