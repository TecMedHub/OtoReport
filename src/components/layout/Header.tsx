import { useWorkspace } from "@/hooks/useWorkspace";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { config } = useWorkspace();

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      {config?.examiner && (
        <span className="text-sm text-gray-500">
          Examinador: {config.examiner}
        </span>
      )}
    </header>
  );
}
