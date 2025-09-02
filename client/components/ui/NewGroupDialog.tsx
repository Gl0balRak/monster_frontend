import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Button } from "@/components/buttons/Button";
import { AutocompleteInput } from "./AutocompleteInput";

interface NewGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: (groupName: string) => void;
  placeholder?: string;
  existingGroups?: string[];
}

export const NewGroupDialog: React.FC<NewGroupDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  placeholder = "Введите название группы",
  existingGroups = [],
}) => {
  const [groupName, setGroupName] = useState("");

  const handleConfirm = () => {
    if (groupName.trim()) {
      onConfirm(groupName.trim());
      setGroupName("");
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setGroupName("");
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setGroupName("");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <AutocompleteInput
            label="Название группы"
            value={groupName}
            onChange={setGroupName}
            placeholder={placeholder}
            suggestions={existingGroups}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Отменить
          </Button>
          <Button
            variant="filled"
            onClick={handleConfirm}
            disabled={!groupName.trim()}
            className="bg-red-600 hover:bg-red-700"
          >
            Создать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
