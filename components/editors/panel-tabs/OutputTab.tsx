"use client";

import { ScrollShadow } from "@nextui-org/react";
import { useState } from "react";

export default function OutputTab() {
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState("");
  const [output, setOutput] = useState("");

  return (
    <div className="relative h-full">
      <div className="relative h-full bg-[#0d0d12] rounded-xl p-2 ring-1 ring-gray-800/50 overflow-hidden">
        <ScrollShadow className="h-full">Output panel</ScrollShadow>
      </div>
    </div>
  );
}
