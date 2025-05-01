import React, { useState, useEffect } from "react";
import * as monaco from "monaco-editor";
import "monaco-editor/min/vs/editor/editor.main.css";

interface MonacoHighlighterProps {
  code: string;
  language?: string; // e.g. "python", "javascript"
  theme?: string; // e.g. "vs", "vs-dark", "hc-black"
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
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Initialize Monaco once
  useEffect(() => {
    // Check if Monaco is already initialized
    if (monaco && monaco.editor) {
      monaco.editor.setTheme(theme);
      setIsLoaded(true);
    } else {
      console.error("Monaco Editor not properly loaded");
    }
  }, [theme]);

  // Update highlighted code when dependencies change
  useEffect(() => {
    if (!isLoaded) return;

    // Register the language if needed
    const languages = monaco.languages.getLanguages();
    if (!languages.some((lang) => lang.id === language)) {
      try {
        monaco.languages.register({ id: language });
      } catch (e) {
        console.warn(`Failed to register language: ${language}`);
      }
    }

    // Convert code to syntax-highlighted HTML
    monaco.editor
      .colorize(code, language, { tabSize })
      .then((colorizedHtml) => {
        setHtml(colorizedHtml);
      })
      .catch((err) => {
        console.error("Monaco colorize error:", err);
        // Fallback to plain text if colorize fails
        setHtml(escapeHtml(code));
      });
  }, [code, language, tabSize, isLoaded]);

  // Helper function to escape HTML for fallback
  const escapeHtml = (text: string): string => {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

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
        lineHeight: "1.4",
        whiteSpace: "pre-wrap",
        wordBreak: "keep-all",
        overflowWrap: "break-word",
        width: "fit-content",
        ...style,
      }}
    />
  );
}
