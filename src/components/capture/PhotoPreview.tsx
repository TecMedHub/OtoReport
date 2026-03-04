import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PhotoPreviewProps {
  loadImage: () => Promise<string>;
  rotation: number;
  onClose: () => void;
  onAnnotate?: () => void;
}

export function PhotoPreview({
  loadImage,
  rotation,
  onClose,
}: PhotoPreviewProps) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    loadImage().then(setUrl);
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [loadImage]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="relative max-h-[90vh] max-w-[90vw]">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute right-2 top-2 z-10 text-white hover:bg-white/20"
        >
          <X size={20} />
        </Button>
        {url && (
          <img
            src={url}
            alt="Preview"
            className="max-h-[85vh] max-w-[85vw] rounded-lg object-contain"
            style={{ transform: `rotate(${rotation}deg)` }}
          />
        )}
      </div>
    </div>
  );
}
