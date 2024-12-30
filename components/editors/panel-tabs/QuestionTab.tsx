"use client";

import { Card, CardBody } from "@nextui-org/react";

export default function QuestionTab() {
  return (
    <div className="space-y-4">
      <Card>
        <CardBody>
          <h4 className="text-medium font-medium mb-2">Soru #1</h4>
          <p className="text-sm text-default-500">
            İkili arama ağacında (Binary Search Tree) en küçük değeri bulan bir
            fonksiyon yazın.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
