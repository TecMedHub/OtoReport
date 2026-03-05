import { useState, useRef, useEffect, useMemo } from "react";
import { Search, X, Plus } from "lucide-react";
import { searchLibrary, type LibraryFinding } from "@/lib/findings-library";

interface FindingsSearchModalProps {
  excludeKeys: Set<string>;
  targetCategoryId: string;
  onAdd: (finding: LibraryFinding) => void;
  onClose: () => void;
}

export function FindingsSearchModal({
  excludeKeys,
  targetCategoryId,
  onAdd,
  onClose,
}: FindingsSearchModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const results = useMemo(
    () => searchLibrary(query, excludeKeys),
    [query, excludeKeys]
  );

  const membraneResults = results.filter((f) => f.category === "membrane");
  const caeResults = results.filter((f) => f.category === "cae");

  // Show target category first
  const sections =
    targetCategoryId === "cae"
      ? [
          { label: "Conducto Auditivo Externo", items: caeResults },
          { label: "Membrana Timpánica", items: membraneResults },
        ]
      : [
          { label: "Membrana Timpánica", items: membraneResults },
          { label: "Conducto Auditivo Externo", items: caeResults },
        ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-overlay pt-[10vh]"
      onClick={onClose}
    >
      <div
        className="flex max-h-[70vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-bg-secondary shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search header */}
        <div className="flex items-center gap-3 border-b border-border-secondary px-4 py-3">
          <Search size={18} className="shrink-0 text-text-tertiary" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar hallazgo..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-tertiary outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="rounded p-0.5 text-text-tertiary hover:text-text-secondary"
            >
              <X size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-xs text-text-tertiary hover:bg-bg-tertiary"
          >
            Esc
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-text-tertiary">
              No se encontraron hallazgos
            </div>
          ) : (
            sections.map((section) => {
              if (section.items.length === 0) return null;
              return (
                <div key={section.label} className="mb-2">
                  <div className="px-3 py-1.5 text-xs font-semibold uppercase text-text-tertiary">
                    {section.label} ({section.items.length})
                  </div>
                  {section.items.map((finding) => (
                    <button
                      key={finding.key}
                      type="button"
                      onClick={() => onAdd(finding)}
                      className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent-subtle"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-text-secondary group-hover:text-accent-text">
                          {finding.label}
                        </div>
                        <div className="truncate text-xs text-text-tertiary group-hover:text-accent-text">
                          {finding.description}
                        </div>
                      </div>
                      <Plus
                        size={16}
                        className="shrink-0 text-text-tertiary group-hover:text-accent-text"
                      />
                    </button>
                  ))}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border-secondary px-4 py-2 text-xs text-text-tertiary">
          {results.length} hallazgo{results.length !== 1 ? "s" : ""} disponible{results.length !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}
