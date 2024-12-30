"use client";

import { Input, Button, ScrollShadow } from "@nextui-org/react";
import { Send } from "lucide-react";

export default function AIChatTab() {
  return (
    <div className="h-full flex flex-col">
      <ScrollShadow className="flex-1">
        <div className="space-y-4">
          {/* Mesaj örnekleri */}
          <div className="bg-content3/50 rounded-lg p-3">
            <p className="text-sm text-default-700">
              Nasıl yardımcı olabilirim?
            </p>
          </div>
        </div>
      </ScrollShadow>

      <div className="mt-4 flex gap-2">
        <Input
          className="flex-1"
          placeholder="Bir soru sorun..."
          size="sm"
          variant="bordered"
        />
        <Button isIconOnly color="primary" size="sm">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
