import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-center gap-2 text-sm text-text-secondary",
        className
      )}
    >
      <input
        ref={ref}
        type="checkbox"
        id={id}
        className="h-4 w-4 rounded border-border-primary text-accent focus:ring-accent"
        {...props}
      />
      {label}
    </label>
  )
);

Checkbox.displayName = "Checkbox";
