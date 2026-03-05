import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon size={48} className="mb-4 text-text-tertiary" />
      <h3 className="mb-1 text-lg font-medium text-text-secondary">{title}</h3>
      {description && (
        <p className="mb-4 max-w-sm text-sm text-text-tertiary">{description}</p>
      )}
      {action}
    </div>
  );
}
