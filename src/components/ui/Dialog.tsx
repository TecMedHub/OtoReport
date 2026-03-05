import { type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Dialog({ open, onClose, title, children }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay">
      <div className="w-full max-w-lg rounded-xl bg-bg-secondary shadow-2xl">
        <div className="flex items-center justify-between border-b border-border-secondary px-6 py-4">
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
}
