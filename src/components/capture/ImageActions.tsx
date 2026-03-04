import { Camera, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ImageActionsProps {
  onCapture: () => void;
  onLoad: () => void;
}

export function ImageActions({ onCapture, onLoad }: ImageActionsProps) {
  return (
    <div className="flex gap-2">
      <Button variant="secondary" size="sm" onClick={onCapture}>
        <Camera size={14} />
        Tomar foto
      </Button>
      <Button variant="secondary" size="sm" onClick={onLoad}>
        <ImagePlus size={14} />
        Cargar imagen
      </Button>
    </div>
  );
}
