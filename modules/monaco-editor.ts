export const getLanguage = (filename: string) => {
  const ext = filename.toLowerCase().split(".").pop();

  switch (ext) {
    case "html":
    case "htm": {
      return "html";
    }
    case "css": {
      return "css";
    }
    case "js":
    case "cjs":
    case "mjs": {
      return "typescript";
    }
    case "jsx": {
      return "typescript";
    }
    case "ts":
    case "cts":
    case "mts": {
      return "typescript";
    }
    case "tsx": {
      return "typescript";
    }
    case "vue": {
      return "vue";
    }
    case "svelte": {
      return "svelte";
    }
    case "json": {
      return "json";
    }
    case "yaml":
    case "yml": {
      return "yaml";
    }
    case "md": {
      return "markdown";
    }
    default: {
      return;
    }
  }
};
