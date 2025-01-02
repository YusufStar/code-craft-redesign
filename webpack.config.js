import MonacoWebPackPlugin from "monaco-editor-webpack-plugin";

module.exports = {
  plugins: [
    new MonacoWebPackPlugin({
      languages: [
        "json",
        "javascript",
        "typescript",
        "html",
        "css",
        "scss",
        "python",
        "markdown",
        "yaml",
        "plaintext"
      ],
      features: ["coreCommands", "find", "format", "hover", "suggest"],
      globalAPI: false,
    }),
  ],
};
