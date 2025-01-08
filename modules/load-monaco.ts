"use client";

import { Dependency } from "@/store/reactStore";
import { Monaco } from "@monaco-editor/react";
import themeList from "monaco-themes/themes/themelist.json";
import { useState } from "react";

export const useMonaco = () => {
  const [loadedThemes, setLoadedThemes] = useState<boolean>(false);

  const generateMonaco = (monaco: Monaco) => {
    if (loadedThemes) return;

    Object.entries(themeList).forEach(([key, value]) => {
      import(`monaco-themes/themes/${value}.json`).then((data) => {
        monaco.editor.defineTheme(key, data);
      });
    });

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      jsx: monaco.languages.typescript.JsxEmit.React,
      jsxFactory: "React.createElement",
      reactNamespace: "React",
      allowNonTsExtensions: true,
      allowJs: true,
      target: monaco.languages.typescript.ScriptTarget.Latest,
    });

    setLoadedThemes(true);
  };

  const loadDefaultTypes = (monaco: Monaco) => {
    fetch(`https://unpkg.com/typescript/lib/lib.es2016.d.ts`).then(
      async (response) => {
        const content = await response.text();

        monaco.languages.typescript.typescriptDefaults.addExtraLib(
          content,
          `file:///node_modules/typescript/lib/lib.es2016.d.ts`
        );
      }
    );

    fetch(`https://unpkg.com/typescript/lib/lib.dom.d.ts`).then(
      async (response) => {
        const content = await response.text();

        monaco.languages.typescript.typescriptDefaults.addExtraLib(
          content,
          `file:///node_modules/typescript/lib/lib.dom.d.ts`
        );
      }
    );

    fetch(`https://unpkg.com/@types/react/index.d.ts`)
      .then(async (response) => {
        const content = await response.text();

        monaco.languages.typescript.typescriptDefaults.addExtraLib(
          content,
          `file:///node_modules/@types/react/index.d.ts`
        );
      })
      .catch(() => {});

    fetch(`https://unpkg.com/@types/react-dom/index.d.ts`)
      .then(async (response) => {
        const content = await response.text();

        monaco.languages.typescript.typescriptDefaults.addExtraLib(
          content,
          `file:///node_modules/@types/react-dom/index.d.ts`
        );
      })
      .catch(() => {});
  };

  const loadTypesFromPackages = (monaco: Monaco, packages: Dependency) => {
    Object.entries(packages).forEach(([name, version]) => {
      fetch(
        `https://unpkg.com/@types/${name}@${version.replace("^", "").replace("@", "")}/index.d.ts`
      )
        .then(async (response) => {
          const content = await response.text();

          // Add TypeScript definitions for Monaco (React types included)
          monaco.languages.typescript.typescriptDefaults.addExtraLib(
            content,
            `file:///node_modules/@types/${name}/index.d.ts`
          );
          
          monaco.languages.typescript.javascriptDefaults.addExtraLib(
            content,
            `file:///node_modules/@types/${name}/index.d.ts`
          );
        })
        .catch((error) => {
          console.error(`Failed to load types for ${name}:`, error);
        });
    });
  };

  return {
    generateMonaco,
    loadedThemes,
    loadTypesFromPackages,
    loadDefaultTypes,
  };
};
