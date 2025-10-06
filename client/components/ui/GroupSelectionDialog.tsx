import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Button } from "@/components/buttons/Button";
import { Select } from "@/components/forms/Select";

interface GroupSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  groups: string[];
  onConfirm: (selectedGroup: string) => void;
  defaultGroup?: string;
  getCost?: (group: string) => Promise<number | null>;
  costUnit?: string;
  loadingText?: string;
}

export const GroupSelectionDialog: React.FC<GroupSelectionDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  groups,
  onConfirm,
  defaultGroup = "Не корзина",
  getCost,
  costUnit = " л.",
  loadingText = "...",
}) => {
  const [selectedGroup, setSelectedGroup] = useState(defaultGroup);
  const [cost, setCost] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchCost = async () => {
      if (!getCost || !open) return;
      setLoading(true);
      try {
        const c = await getCost(selectedGroup);
        if (!cancelled) setCost(c);
      } catch {
        if (!cancelled) setCost(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchCost();
    return () => {
      cancelled = true;
    };
  }, [selectedGroup, getCost, open]);

  const handleConfirm = () => {
    onConfirm(selectedGroup);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedGroup(defaultGroup);
    onOpenChange(false);
  };

  const confirmLabel = getCost ? (loading ? loadingText : (cost != null ? `${cost}${costUnit}` : "Продолжить")) : "Продолжить";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Select
            label="Выберите группу"
            value={selectedGroup}
            onChange={setSelectedGroup}
            options={groups.map((group) => ({ value: group, label: group }))}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Отменить
          </Button>
          <Button
            variant="filled"
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
