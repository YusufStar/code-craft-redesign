"use client";
import React, { useState } from "react";
import { Button } from "@nextui-org/button";

import ComplexWebEditor from "./complex/complex-web-editor";
import BasicWebEditor from "./basic/basic-web-editor";

const WebPlayground = () => {
  const [editor, setEditor] = useState<"complex" | "basic" | null>(null);

  const editors = {
    complex: <ComplexWebEditor />,
    basic: <BasicWebEditor />,
  };

  return (
    <>
      {editor === null ? (
        <div className="h-full w-full flex items-center justify-center gap-4">
          <Button
            color="primary"
            variant="shadow"
            onClick={() => setEditor("complex")}
          >
            Complex Editor
          </Button>
          <Button
            color="secondary"
            variant="shadow"
            onClick={() => setEditor("basic")}
          >
            Basic Editor
          </Button>
        </div>
      ) : (
        editors[editor]
      )}
    </>
  );
};

export default WebPlayground;
