"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useTheme } from "next-themes";
import Editor from "@monaco-editor/react";
import { useMonaco } from "@monaco-editor/react";
import { useCompletion } from "ai/react";
import debounce from "lodash.debounce";

import { CompletionFormatter } from "@/components/editor/completion-formatter";
import { GenerateInstructions } from "@/components/editor/prompt";

interface TextEditorProps {
  language: "javascript" | "typescript" | "python" | "html" | "css";
  cacheSize?: number;
  refreshInterval?: number;
  autoSaveInterval?: number;
}

const TextEditor = ({
  language,
  cacheSize = 10,
  refreshInterval = 500,
  autoSaveInterval = 5000,
}: TextEditorProps) => {
  const monaco = useMonaco();
  const editorRef = useRef<any>(null);
  const fetchSuggestionsIntervalRef = useRef<number | undefined>(undefined);
  const timeoutRef = useRef<number | undefined>(undefined);
  const [cachedSuggestions, setCachedSuggestions] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { completion, stop, complete } = useCompletion({
    api: "/api/completion",
    body: { language },
  });

  const debouncedSuggestions = useCallback(
    debounce(() => {
      const model = monaco?.editor.getModels()[0];

      if (!model || !editorRef.current) return;

      // Clear previous suggestions
      setCachedSuggestions([]);

      const position = editorRef.current.getPosition();
      const offset = model.getOffsetAt(position);
      const textBeforeCursor = model.getValue().substring(0, offset);

      const messages = [
        GenerateInstructions(language),
        { content: textBeforeCursor, role: "user", name: "TextBeforeCursor" },
      ];

      complete("", { body: { messages } })
        .then((newCompletion) => {
          if (newCompletion) {
            const newSuggestion = {
              insertText: newCompletion.trim(),
              range: {
                startLineNumber: position.lineNumber,
                startColumn: position.column,
                endLineNumber:
                  position.lineNumber + (newCompletion.match(/\n/g) || []).length,
                endColumn: position.column + newCompletion.length,
              },
            };

            setCachedSuggestions((prev) =>
              [...prev, newSuggestion].slice(-cacheSize)
            );
          }
        })
        .catch(console.error);
    }, refreshInterval),
    [monaco, complete, language, cacheSize]
  );

  const autoSave = useCallback(
    debounce(() => {
      if (!editorRef.current) return;
      const code = editorRef.current.getValue();

      console.log("Auto-saving code:", code);
      setIsSaving(true);
      setTimeout(() => setIsSaving(false), 1000); // Simulate saving delay
    }, autoSaveInterval),
    [autoSaveInterval]
  );

  const handleEditorChange = useCallback(() => {
    debouncedSuggestions();
    autoSave();
  }, [debouncedSuggestions, autoSave]);

  useEffect(() => {
    if (!monaco) return;

    const provider = monaco.languages.registerInlineCompletionsProvider(
      language,
      {
        provideInlineCompletions: async (model, position) => {
          if (cachedSuggestions.length === 0) {
            return { items: [] };
          }

          const suggestions = cachedSuggestions.filter(
            (suggestion) =>
              suggestion.range.startLineNumber === position.lineNumber &&
              suggestion.range.startColumn >= position.column - 3
          );

          return {
            items: suggestions.map((suggestion) =>
              new CompletionFormatter(model, position).format(
                suggestion.insertText,
                suggestion.range
              )
            ),
          };
        },
        freeInlineCompletions: () => {},
      }
    );

    return () => provider.dispose();
  }, [monaco, cachedSuggestions, language]);

  useEffect(() => {
    if (!editorRef.current) return;

    const editor = editorRef.current;
    const model = editor.getModel();

    const changeListener = model?.onDidChangeContent(() => {
      debouncedSuggestions();
    });

    const cursorListener = editor.onDidChangeCursorPosition(() => {
      debouncedSuggestions();
    });

    const enterListener = editor.onKeyDown((event) => {
      if (event.keyCode === monaco.KeyCode.Enter) {
        debouncedSuggestions();
      }
    });

    return () => {
      changeListener?.dispose();
      cursorListener?.dispose();
      enterListener?.dispose();
    };
  }, [debouncedSuggestions, monaco]);

  useEffect(() => {
    return () => {
      window.clearInterval(fetchSuggestionsIntervalRef.current);
      window.clearTimeout(timeoutRef.current);
      debouncedSuggestions.cancel();
      autoSave.cancel();
    };
  }, [debouncedSuggestions, autoSave]);

  return (
    <>
      <Editor
        defaultLanguage={language}
        defaultValue="# Start typing..."
        height="90vh"
        loading={<div>Loading editor...</div>}
        options={{
          autoClosingBrackets: "always",
          autoClosingQuotes: "always",
          formatOnType: true,
          formatOnPaste: true,
          snippetSuggestions: "inline",
          trimAutoWhitespace: true,
        }}
        theme={useTheme().resolvedTheme === "dark" ? "vs-dark" : "vs"}
        onChange={handleEditorChange}
        onMount={(editor) => {
          editorRef.current = editor;
          editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            autoSave();
            alert("Code saved manually!");
          });
        }}
      />
      {isSaving && <div>Saving...</div>}
    </>
  );
};

export default TextEditor;
