"use client";

import { useEffect, useRef, useState } from "react";
import type { Ace } from "ace-builds";

interface AceEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export function AceEditor({ value, onChange, placeholder, minHeight = 400 }: AceEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const aceEditorRef = useRef<Ace.Editor | null>(null);
  const initialValueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let editor: Ace.Editor | null = null;
    let disposed = false;

    const initAce = async () => {
      if (!editorRef.current) return;

      const ace = await import("ace-builds");
      await import("ace-builds/src-noconflict/mode-markdown");
      await import("ace-builds/src-noconflict/theme-monokai");
      await import("ace-builds/src-noconflict/ext-language_tools");

      if (disposed || !editorRef.current) return;

      ace.config.set("basePath", "/ace-builds/src-noconflict");

      editor = ace.edit(editorRef.current);
      aceEditorRef.current = editor;

      editor.setTheme("ace/theme/monokai");
      editor.session.setMode("ace/mode/markdown");
      editor.setOptions({
        showLineNumbers: true,
        tabSize: 2,
        wrap: true,
        fontSize: 14,
        showPrintMargin: false,
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: false,
      });

      editor.setValue(initialValueRef.current, -1);
      editor.on("change", () => {
        if (!editor) return;
        onChangeRef.current(editor.getValue());
      });

      setIsLoading(false);
    };

    initAce();

    return () => {
      disposed = true;
      if (editor) {
        editor.destroy();
      }
      if (aceEditorRef.current) {
        aceEditorRef.current = null;
      }
    };
    // The Ace instance owns its initial value; external value changes are synced below.
  }, []);

  useEffect(() => {
    if (aceEditorRef.current && aceEditorRef.current.getValue() !== value) {
      const cursorPosition = aceEditorRef.current.getCursorPosition();
      aceEditorRef.current.setValue(value, -1);
      aceEditorRef.current.moveCursorToPosition(cursorPosition);
    }
  }, [value]);

  // Auto-save to localStorage every 5 seconds
  useEffect(() => {
    if (!value || isLoading) return;

    const timer = setTimeout(() => {
      try {
        localStorage.setItem("diary-draft-autosave", value);
        localStorage.setItem("diary-draft-autosave-timestamp", new Date().toISOString());
      } catch (error) {
        console.error("Failed to auto-save to localStorage:", error);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [value, isLoading]);

  return (
    <div className="relative">
      {isLoading && (
        <div className="flex items-center justify-center" style={{ minHeight: `${minHeight}px` }}>
          <div className="text-gray-400">Loading editor...</div>
        </div>
      )}
      <div
        ref={editorRef}
        className="rounded-md border border-night-muted"
        style={{ minHeight: `${minHeight}px`, display: isLoading ? "none" : "block" }}
        aria-label="Markdown editor"
      />
      {placeholder && !value && !isLoading && (
        <div className="pointer-events-none absolute left-4 top-4 text-gray-500">{placeholder}</div>
      )}
    </div>
  );
}
