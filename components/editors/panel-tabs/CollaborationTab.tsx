"use client";

import { Avatar, AvatarGroup, Button } from "@nextui-org/react";
import { UserPlus } from "lucide-react";

export default function CollaborationTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-2">Aktif Kullanıcılar</h3>
        <AvatarGroup>
          <Avatar name="John Doe" />
          <Avatar name="Jane Doe" />
        </AvatarGroup>
      </div>
      
      <Button
        className="w-full"
        color="primary"
        startContent={<UserPlus className="w-4 h-4" />}
        variant="flat"
      >
        Kullanıcı Davet Et
      </Button>
    </div>
  );
} 