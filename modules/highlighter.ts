import { bundledLanguages, bundledThemes, getHighlighter } from "shiki";

export const initializeHighlighter = async () => {
  const highlighter = await getHighlighter({
    themes: Object.keys(bundledThemes),
    langs: Object.keys(bundledLanguages),
  });

  return highlighter;
};
