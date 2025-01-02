import { bundledLanguages, bundledThemes, getHighlighter } from "shiki";

export const initializeHighlighter = async () => {
  try {
    const highlighter = await getHighlighter({
      themes: Object.keys(bundledThemes),
      langs: Object.keys(bundledLanguages),
    });

    return highlighter;
  } catch (error) {
    console.error("Failed to initialize highlighter:", error);

    return null;
  }
};
