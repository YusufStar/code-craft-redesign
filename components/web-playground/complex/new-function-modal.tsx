import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";

interface NewFunctionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddFunction: (functionName: string, functionCode: string) => void;
  existingFunctionNames: string[];
}

const NewFunctionModal: React.FC<NewFunctionModalProps> = ({
  open,
  onOpenChange,
  onAddFunction,
  existingFunctionNames,
}) => {
  const [functionName, setFunctionName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const formatFunctionName = (name: string) => {
    const trimmedName = name.trim();
    const words = trimmedName.split(/[\s-]+/);
    const formattedWords = words.map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    );
    return formattedWords.join("");
  };

  const generateDefaultCode = (formattedName: string) => {
    return `
function ${formattedName}() {
    return (
        <div>
        </div>
    );
}
`;
  };

  const handleAdd = () => {
    const normalizedFunctionName = functionName.trim().toLowerCase();

    if (
      existingFunctionNames
        .map((name) => name.toLowerCase())
        .includes(normalizedFunctionName)
    ) {
      setError("Bu fonksiyon adı zaten kullanılıyor.");

      return;
    }
    if (!functionName.trim()) {
      setError("Fonksiyon adı boş olamaz.");

      return;
    }
    setError(null);
    const formattedName = formatFunctionName(functionName);
    const defaultCode = generateDefaultCode(formattedName);
    onAddFunction(formattedName, defaultCode);
    onOpenChange(false);
    setFunctionName("");
  };

  return (
    <Modal isOpen={open} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Yeni Fonksiyon Ekle
            </ModalHeader>
            <ModalBody>
              <Input
                description="Fonksiyon adı benzersiz olmalıdır."
                errorMessage={error}
                label="Fonksiyon Adı"
                placeholder="Fonksiyon adını girin"
                size="sm"
                value={functionName}
                onValueChange={setFunctionName}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="danger" size="sm" variant="flat" onPress={onClose}>
                Kapat
              </Button>
              <Button color="primary" size="sm" onPress={handleAdd}>
                Ekle
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default NewFunctionModal;
