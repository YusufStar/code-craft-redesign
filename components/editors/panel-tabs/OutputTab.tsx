"use client";

import { ScrollShadow } from "@nextui-org/react";
import { AlertTriangle, CheckCircle, Clock, Loader2 } from "lucide-react";
import useEditorStore from "@/store/editorStore";

export default function OutputTab() {
  const { output, isRunning } = useEditorStore();

  return (
    <div className="relative h-full">
      <div className="relative h-full bg-gradient-to-b from-[#0d0d12] to-[#1a1a20] rounded-xl p-4 ring-1 ring-gray-700/70 overflow-hidden">
        <ScrollShadow className="h-full">
          {isRunning && (
            <div className="flex items-center gap-2 animate-pulse text-amber-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-base font-medium">Running...</span>
            </div>
          )}

          {!isRunning && output.error && (
            <div className="text-red-500">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium text-lg">Error:</span>
              </div>

              <pre className="whitespace-pre-wrap mt-3 bg-red-900/20 border border-white/10 p-3 rounded-lg text-sm font-mono">{output.error}</pre>
            </div>
          )}

          {!isRunning && output.result && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="w-6 h-6" />
                <span className="font-medium text-lg">Execution Successful</span>
              </div>

              <pre className="whitespace-pre-wrap bg-gray-900/30 border border-white/10 p-3 rounded-lg text-sm text-gray-300 font-mono">
                {output.result}
              </pre>
            </div>
          )}

          {!isRunning && output.logs.length > 0 && (
            <div className="mt-4">
              <div className="text-blue-400 font-medium text-lg">Logs:</div>

              <ul className="mt-2 space-y-2 bg-gray-800/20 p-3 rounded-lg">
                {output.logs.map((log, index) => (
                  <li key={index} className="text-gray-300 text-sm font-mono">
                    {log}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!isRunning &&
            !output.error &&
            !output.result &&
            output.logs.length === 0 && (
              <div className="text-gray-500 text-sm font-medium mt-4">
                No output to display.
              </div>
            )}
        </ScrollShadow>
      </div>
    </div>
  );
}
