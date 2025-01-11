"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useTheme } from "next-themes";
import Editor from "@monaco-editor/react";
import { useMonaco } from "@monaco-editor/react";
import { useCompletion } from "ai/react";
import debounce from "lodash.debounce";

// Sizin CompletionFormatter dosyanızı da içe aktarın
import { CompletionFormatter } from "@/components/editor/completion-formatter";
import { GenerateInstructions } from "@/components/editor/prompt";

interface TextEditorProps {
  language: "javascript" | "typescript" | "python" | "html" | "css";
  cacheSize?: number;
  refreshInterval?: number; // API'den öneri alma debounced süresi
  autoSaveInterval?: number; // Otomatik kaydetme debounced süresi
}

export default function TextEditor({
  language,
  cacheSize = 10,
  autoSaveInterval = 3000,
}: TextEditorProps) {
  const monaco = useMonaco();
  const editorRef = useRef<any>(null);

  // Tek bir completion saklamak için, isterseniz array de kullanabilirsiniz
  const [cachedSuggestion, setCachedSuggestion] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // useCompletion Hook'u
  const { complete } = useCompletion({
    api: "/api/completion",
    body: { language },
  });

  /**
   * 1) Kod değişikliği ya da imleç hareketi oldukça
   *    API'ye istek atıp completion çekmeyi deneyeceğiz (debounce ile).
   */
  const fetchSuggestion = useCallback(() => {
    if (!editorRef.current || !monaco) return;

    const model = monaco.editor.getModels()[0];
    const position = editorRef.current.getPosition();
    if (!model || !position) return;

    // Metnin imleç öncesindeki bölümünü al
    const offset = model.getOffsetAt(position);
    const textBeforeCursor = model.getValue().substring(0, offset);

    // Bu da senaryonuza göre, prompt + user message
    const messages = [
      GenerateInstructions(language),
      { content: textBeforeCursor, role: "user", name: "TextBeforeCursor" },
    ];

    setCachedSuggestion(null);

    // Yeni completion çek
    complete("", { body: { messages } })
      .then((newCompletion) => {
        if (!newCompletion) {
          setCachedSuggestion(null);
          return;
        }

        // Editor'deki konum bazlı Range
        const newSuggestionRange = {
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        };

        // Tek sihirli obje tutuyoruz
        const newSuggestion = {
          insertText: newCompletion.trim(),
          range: newSuggestionRange,
        };

        setCachedSuggestion(newSuggestion);
      })
      .catch((error) => {
        console.error("Completion API hatası:", error);
        setCachedSuggestion(null);
      });
  }, [monaco, complete, language]);

  // Debounce'lı fonksiyon
  const debouncedFetchSuggestions = useCallback(
    debounce(fetchSuggestion, 500),
    [fetchSuggestion]
  );

  useEffect(() => {
    if (!editorRef.current) return;
    const editor = editorRef.current;

    // 1) Model içeriği değiştiğinde (ör. kullanıcı karakter yazınca)
    const changeListener = editor.onDidChangeModelContent(() => {
      debouncedFetchSuggestions(); // 500ms debounce
    });

    // 2) Enter tuşuna basıldığında, anında tetikle
    const enterListener = editor.onKeyDown((event: any) => {
      if (event.keyCode === monaco?.KeyCode.Enter) {
        // Debounce olmadan direkt
        fetchSuggestion();
      }
    });

    return () => {
      changeListener.dispose();
      enterListener.dispose();
    };
  }, [debouncedFetchSuggestions, fetchSuggestion]);

  /**
   * 2) Otomatik kaydetme mekanizması
   */
  const autoSaveCode = useCallback(() => {
    if (!editorRef.current) return;
    const code = editorRef.current.getValue();
    setIsSaving(true);
    // Burada gerçek bir API'ye post edebilirsiniz veya localStorage'a atabilirsiniz
    setTimeout(() => setIsSaving(false), 800); // Simüle amaçlı
  }, []);

  // Debounced auto-save fonksiyonu
  const debouncedAutoSave = useCallback(
    debounce(autoSaveCode, autoSaveInterval),
    [autoSaveCode, autoSaveInterval]
  );

  /**
   * 3) Editor içeriği değiştiğinde hem suggestion'ı, hem auto-save'i tetikle
   */
  const handleEditorChange = useCallback(() => {
    debouncedFetchSuggestions();
    debouncedAutoSave();
  }, [debouncedFetchSuggestions, debouncedAutoSave]);

  /**
   * 4) Inline Completions Provider
   *    Basit bir şekilde, elimizde bir tane suggestion varsa döndürür,
   *    yoksa boş array döndürür.
   */
  useEffect(() => {
    if (!monaco) return;

    const provider = monaco.languages.registerInlineCompletionsProvider(
      language,
      {
        provideInlineCompletions(model, position) {
          if (!cachedSuggestion) {
            return { items: [] };
          }
          // Tek bir suggestion döndürdüğümüz senaryo
          // Gerekirse birden fazla item da oluşturabilirsiniz.
          const item = new CompletionFormatter(model, position).format(
            cachedSuggestion.insertText,
            cachedSuggestion.range
          );
          return { items: [item] };
        },
        freeInlineCompletions() {
          // Boş bir cleanup
        },
      }
    );

    return () => {
      provider.dispose();
    };
  }, [monaco, cachedSuggestion, language]);

  /**
   * 5) Editor Mount olunca, Ctrl+S kaydet komutu vb.
   *    Inline suggest ayarını da aktif hâle getiriyoruz.
   */
  function handleEditorMount(editor: any) {
    editorRef.current = editor;
    if (monaco) {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        // Manuel kaydetme
        autoSaveCode();
        alert("Kod manuel olarak kaydedildi!");
      });

      // Inline ghost text özelliğini açık hale getir
      editor.updateOptions({
        autoClosingBrackets: false,
        "inlineSuggest.enabled": true,
      });
    }
  }

  /**
   * 6) Cursor değiştiğinde de benzer şekilde suggestion iste
   */
  useEffect(() => {
    if (!editorRef.current) return;
    const editor = editorRef.current;

    const cursorListener = editor.onDidChangeCursorPosition(() => {
      debouncedFetchSuggestions();
    });

    // Cleanup
    return () => {
      cursorListener?.dispose();
    };
  }, [debouncedFetchSuggestions]);

  /**
   * 7) Unmount aşamasında bellek sızıntılarını engellemek için
   *    debounce fonksiyonlarını iptal ediyoruz.
   */
  useEffect(() => {
    return () => {
      debouncedFetchSuggestions.cancel();
      debouncedAutoSave.cancel();
    };
  }, [debouncedFetchSuggestions, debouncedAutoSave]);

  return (
    <>
      <Editor
        height="80vh"
        defaultLanguage={language}
        defaultValue=""
        onMount={handleEditorMount}
        onChange={handleEditorChange}
        theme={useTheme().resolvedTheme === "dark" ? "vs-dark" : "vs"}
        options={{
          formatOnType: true,
          formatOnPaste: true,
          snippetSuggestions: "inline",
          // Yeni Monaco versiyonlarında inline suggest için bu ayar da işe yarar
          // "inlineSuggest.enabled": true, // handleEditorMount içinde de set edilebilir
          tabSize: 2,
        }}
      />
      {isSaving && <div style={{ marginTop: 8 }}>Kaydediliyor...</div>}
    </>
  );
}
