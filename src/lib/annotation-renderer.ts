import { renderAnnotation } from "@/components/annotation/SymbolStamps";
import type { Annotation } from "@/types/annotation";

export function compositeAnnotations(
  imageUrl: string,
  annotations: Annotation[],
  rotation: number,
  pivot?: { x: number; y: number } | null
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;

      // Apply rotation with pivot support
      const pivotX = pivot ? pivot.x * canvas.width : canvas.width / 2;
      const pivotY = pivot ? pivot.y * canvas.height : canvas.height / 2;
      ctx.save();
      ctx.translate(pivotX, pivotY);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(img, -pivotX, -pivotY);
      ctx.restore();

      // Render annotations
      for (const annotation of annotations) {
        renderAnnotation(ctx, annotation, canvas.width, canvas.height);
      }

      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = imageUrl;
  });
}
