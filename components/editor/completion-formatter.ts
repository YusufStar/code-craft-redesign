import * as monacoeditor from "monaco-editor";

/** Açılış parantezleri listesi */
const OPENING_BRACKETS = ["(", "[", "{"] as const;
/** Kapanış parantezleri listesi */
const CLOSING_BRACKETS = [")", "]", "}"] as const;
/** Tüm parantezler */
export const ALL_BRACKETS = [...OPENING_BRACKETS, ...CLOSING_BRACKETS] as const;
/** Tek bir parantez tipini temsil eden type */
export type Bracket = (typeof ALL_BRACKETS)[number];

/** Tekli ve çift tırnaklar */
const QUOTES = ['"', "'", "`"];

/**
 * CompletionFormatter:
 * AI'den gelen metni (inline completion), editor'deki cursor konumunu
 * ve çevresindeki metni baz alarak düzenlemeye yarar.
 *
 * Özellikle şu işlemleri yapar:
 *  - Fazladan veya hatalı parantezleri temizleme
 *  - Metnin başındaki, ortasındaki ya da sonundaki gereksiz boşlukları ayıklar
 *  - Orta yerde bulunan gereksiz tırnakları (örn. imleç bir kelimenin ortasındayken) azaltır
 *  - Yukarı/aşağı satırlarda zaten yazılı olan duplicate satırları engeller
 *  - Markdown format kod blokları içindeki backtickleri temizler **/

class CompletionFormatter {
  /** İmleç konumunun sağındaki karakter */
  private _characterAfterCursor: string;
  /** Düzenlenecek olan completion metni (işlenmiş hâli) */
  private _completion = "";
  /** Completion metninin trimlenmiş hâli (ilk orijinal trim) */
  private _normalisedCompletion = "";
  /** Yapay zekadan gelen orijinal completion metni */
  private _originalCompletion = "";
  /** İmleçten sonra, aynı satırdan dosya sonuna kadar olan metin */
  private _textAfterCursor: string;
  /** İmlecin bulunduğu satırın tamamı */
  private _lineText: string;
  /** İmleç konumunun solundaki karakter */
  private _characterBeforeCursor: string;
  /** Monaco Editor modeli (yani dosya içeriği) */
  private _editor: monacoeditor.editor.ITextModel;
  /** İmleç konumu */
  private _cursorPosition: monacoeditor.Position;
  /** Toplam satır sayısı */
  private _lineCount: number;

  constructor(
    editor: monacoeditor.editor.ITextModel,
    position: monacoeditor.Position
  ) {
    this._editor = editor;
    this._cursorPosition = position;

    // Editor'deki en son satır ve sütunu bul
    const lineEndPosition = editor.getFullModelRange()?.getEndPosition();

    // İmleçten dosya sonuna kadar olan Range
    const textAfterRange = new monacoeditor.Range(
      position.lineNumber,
      position.column,
      lineEndPosition?.lineNumber ?? 1,
      lineEndPosition?.column ?? 1
    );

    // Bu satırın içeriği
    this._lineText = editor.getLineContent(position.lineNumber);
    // İmleçten sonra kalan metin
    this._textAfterCursor = editor.getValueInRange(textAfterRange);

    // İmleç solundaki karakter (index hesaplarken -2 diyoruz çünkü column 1 bazlı)
    this._characterBeforeCursor = this._lineText[position.column - 2] ?? "";
    // İmleç sağındaki karakter
    this._characterAfterCursor = this._lineText[position.column] ?? "";

    this._lineCount = editor.getLineCount();
  }

  /**
   * Parantezlerin açılış ve kapanış eşleşmesini basitçe kontrol eder
   */
  private isMatchingPair = (open?: Bracket, close?: string): boolean => {
    return (
      (open === "(" && close === ")") ||
      (open === "[" && close === "]") ||
      (open === "{" && close === "}")
    );
  };

  /**
   * AI'den dönen metni okurken, parantezler tam açılıp kapanıyor mu diye bakar;
   * Eğer kapanış parantezi eşleşmiyorsa geri kalanını 'kesmez' ama
   * en azından düzgün bir şekilde biriktirilmiş kısımları saklar.
   */
  private matchCompletionBrackets = (): CompletionFormatter => {
    let accumulated = "";
    const openBrackets: Bracket[] = [];

    for (const ch of this._originalCompletion) {
      if (OPENING_BRACKETS.includes(ch as Bracket)) {
        openBrackets.push(ch as Bracket);
      } else if (CLOSING_BRACKETS.includes(ch as Bracket)) {
        const top = openBrackets[openBrackets.length - 1];
        // Eğer en üstteki açılışla eşleşiyorsa, stackten popla
        if (top && this.isMatchingPair(top, ch)) {
          openBrackets.pop();
        }
        // Eşleşmese bile 'kesmek' yerine yine biriktiriyoruz
      }
      accumulated += ch;
    }

    // Eğer brackets tam denk gelmişse, accumulated'ı al
    // Aksi halde orijinali vs. diyorduk fakat
    // partial da olsa 'accumulated' bazen yeterli olabilir;
    // yine de temkinli davranalım:
    if (openBrackets.length === 0) {
      // Tam dengeli parantez
      this._completion = accumulated.trimEnd();
    } else {
      // Pek dengeli değilse de belki orijinali korumak istersiniz,
      // isterseniz "accumulated" döndürüp => this._completion = accumulated;
      this._completion =
        accumulated.trimEnd() || this._originalCompletion.trimEnd();
    }

    return this;
  };

  /**
   * AI, sadece boşluk veya boş satır döndürdüyse temizle
   */
  private ignoreBlankLines = (): CompletionFormatter => {
    // Metin baştan boşluksa ve orijinal metin tam olarak "\n" değilse
    if (
      this._completion.trimStart() === "" &&
      this._originalCompletion !== "\n"
    ) {
      this._completion = this._completion.trim();
    }
    return this;
  };

  /**
   * Genel trim yardımı
   */
  private normalise = (text: string): string => text.trim();

  /**
   * Mevcut satırın başında halihazırda yazılmış bir parça,
   * completion'ın da aynı kısım ile başlaması durumunda,
   * o kısımdaki tekrarı kaldırır.
   */
  private removeDuplicateStartOfSuggestions(): CompletionFormatter {
    // Cursor'a kadarki metni al
    const before = this._editor
      .getValueInRange(
        new monacoeditor.Range(
          1, // 1. satır
          1, // 1. sütun
          this._cursorPosition.lineNumber,
          this._cursorPosition.column
        )
      )
      .trim();

    const completion = this.normalise(this._completion);

    const maxLength = Math.min(completion.length, before.length);
    let overlapLength = 0;

    for (let length = 1; length <= maxLength; length++) {
      const endOfBefore = before.slice(-length);
      const startOfCompletion = completion.slice(0, length);

      if (endOfBefore === startOfCompletion) {
        overlapLength = length;
      }
    }

    if (overlapLength > 0) {
      this._completion = this._completion.substring(overlapLength);
    }

    return this;
  }

  /**
   * İmleç bir kelimenin tam ortasındayken,
   * AI tek tırnak vb. getirmişse bunları düzelt
   */
  private isCursorAtMiddleOfWord() {
    return (
      this._characterBeforeCursor &&
      /\w/.test(this._characterBeforeCursor) &&
      /\w/.test(this._characterAfterCursor)
    );
  }

  /**
   * "He" + "'llo" => "Hello"
   * gibi gereksiz tırnakları ortadan kaldırır.
   */
  private removeUnnecessaryMiddleQuote(): CompletionFormatter {
    const startsWithQuote = QUOTES.includes(this._completion[0] ?? "");
    const endsWithQuote = QUOTES.includes(
      this._completion[this._completion.length - 1] ?? ""
    );

    // Hem baş hem son tırnaksa, muhtemelen codeblock vb.
    if (startsWithQuote && endsWithQuote) {
      this._completion = this._completion.substring(1);
    }
    // İmleç ortada ise son tırnağı da kes
    if (endsWithQuote && this.isCursorAtMiddleOfWord()) {
      this._completion = this._completion.slice(0, -1);
    }

    return this;
  }

  /**
   * Aşağıdaki 1-2 satırda, orijinal completion ile aynı olan
   * satır bulunursa tekrarlamamak için completion'ı sıfırlar.
   */
  private preventDuplicateLines = (): CompletionFormatter => {
    let nextLineIndex = this._cursorPosition.lineNumber + 1;

    while (
      nextLineIndex < this._cursorPosition.lineNumber + 3 &&
      nextLineIndex <= this._lineCount
    ) {
      const line = this._editor.getLineContent(nextLineIndex).trim();
      if (this.normalise(line) === this.normalise(this._originalCompletion)) {
        this._completion = "";
        return this;
      }
      nextLineIndex++;
    }
    return this;
  };

  /**
   * Fazladan newline bırakıldıysa sonundan siliyoruz
   * (örneğin AI metni "\n\n" döndürmüşse).
   */
  private removeInvalidLineBreaks = (): CompletionFormatter => {
    if (this._completion.endsWith("\n")) {
      this._completion = this._completion.trimEnd();
    }
    return this;
  };

  /**
   * \n sayısı
   */
  private newLineCount(): number {
    return (this._completion.match(/\n/g) || []).length;
  }

  /**
   * Son satırın karakter sayısı
   */
  private getLastLineColumnCount(): number {
    const lines = this._completion.split("\n");
    return lines[lines.length - 1]?.length ?? 0;
  }

  /**
   * Eğer ilk non-space karakter, cursor sütunundan ilerideyse
   * orayı kes
   */
  private trimStart = (): CompletionFormatter => {
    const firstNonSpaceIndex = this._completion.search(/\S/);
    if (firstNonSpaceIndex > this._cursorPosition.column - 1) {
      this._completion = this._completion.substring(firstNonSpaceIndex);
    }
    return this;
  };

  /**
   *  - "```" gibi code block formatlarını
   *  - "# Suggestion:" benzeri text'leri
   *  - Tek tırnak/backtick kalıntılarını
   * temizler.
   */
  private stripMarkdownAndSuggestionText = (): CompletionFormatter => {
    // ```js ...``` gibi pattern'ları
    this._completion = this._completion.replace(/```.*\n/g, "");
    this._completion = this._completion.replace(/```/g, "");
    this._completion = this._completion.replace(/`/g, "");
    // "# Suggestions:" pattern
    this._completion = this._completion.replace(/# ?Suggestions?: ?/gi, "");
    return this;
  };

  /**
   * Eğer imleç satırının öncesi veya sonrası tamamen boşsa
   * ve AI  Language: x gibi bir context text döndürdüyse,
   **/

  private getNoTextBeforeOrAfter = (): boolean => {
    const textAfter = this._textAfterCursor;
    const textBeforeRange = new monacoeditor.Range(
      1,
      1,
      this._cursorPosition.lineNumber,
      this._cursorPosition.column
    );
    const textBefore = this._editor.getValueInRange(textBeforeRange);
    return !textAfter.trim() || !textBefore.trim();
  };

  /**
   *  "/* Language: ts " vb. context block'ları
   *  dosya başında veya sonunda dönerse ignore'la.
   */
  private ignoreContextCompletionAtStartOrEnd = (): CompletionFormatter => {
    const isNoTextBeforeOrAfter = this.getNoTextBeforeOrAfter();
    const contextMatch = this._normalisedCompletion.match(
      /\/\*\s*Language:\s*(.*)\s*\*\//
    );
    const extensionContext = this._normalisedCompletion.match(
      /\/\*\s*File extension:\s*(.*)\s*\*\//
    );
    const commentMatch = this._normalisedCompletion.match(/\/\*\s*\*\//);

    if (
      isNoTextBeforeOrAfter &&
      (contextMatch || extensionContext || commentMatch)
    ) {
      this._completion = "";
    }
    return this;
  };

  /**
   * Son aşamada, elimizdeki _completion string'ini
   * Monaco'nun beklediği (insertText, range) formatına dönüştürür.
   */
  private formatCompletion = (
    range: monacoeditor.IRange
  ): { insertText: string; range: monacoeditor.IRange } => {
    const newLines = this.newLineCount();
    const lastLineLen = this.getLastLineColumnCount();

    // Başlangıç satırı = cursor'ın olduğu yer
    // Bitiş satırı = cursor satırı + newLine sayısı kadar ilerisi
    // Bitiş sütunu = eğer tek satırsa, cursor sütunu + metnin uzunluğu
    //                yoksa son satırın uzunluğuna denk gelecek şekilde
    return {
      insertText: this._completion,
      range: {
        startLineNumber: this._cursorPosition.lineNumber,
        startColumn: this._cursorPosition.column,
        endLineNumber: this._cursorPosition.lineNumber + newLines,
        endColumn:
          newLines === 0
            ? this._cursorPosition.column + lastLineLen
            : lastLineLen + 1, // Çok satırlıysa son satırın bitişine +1
      },
    };
  };

  /**
   * Dışarıya açılan tek fonksiyon:
   *  - orijinal completion text'i alır
   *  - chain halindeki düzeltme metodlarını uygular
   *  - (insertText, range) objesi döndürür.
   */
  public format(
    insertText: string,
    range: monacoeditor.IRange
  ): { insertText: string; range: monacoeditor.IRange } {
    // Her çağrıda yeniden sıfırla
    this._completion = "";
    this._normalisedCompletion = this.normalise(insertText);
    this._originalCompletion = insertText;

    return this.matchCompletionBrackets()
      .ignoreBlankLines()
      .removeDuplicateStartOfSuggestions()
      .removeUnnecessaryMiddleQuote()
      .preventDuplicateLines()
      .removeInvalidLineBreaks()
      .trimStart()
      .stripMarkdownAndSuggestionText()
      .ignoreContextCompletionAtStartOrEnd()
      .formatCompletion(range);
  }
}

export { CompletionFormatter };
