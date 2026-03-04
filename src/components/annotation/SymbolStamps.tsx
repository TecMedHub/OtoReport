import type { Annotation } from "@/types/annotation";
import { AnnotationType } from "@/types/annotation";

export function renderAnnotation(
  ctx: CanvasRenderingContext2D,
  annotation: Annotation,
  canvasWidth: number,
  canvasHeight: number
) {
  const x = annotation.x * canvasWidth;
  const y = annotation.y * canvasHeight;
  const size = annotation.size;

  ctx.save();
  ctx.strokeStyle = annotation.color;
  ctx.fillStyle = annotation.color;
  ctx.lineWidth = 2;

  switch (annotation.type) {
    case AnnotationType.Arrow:
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y - size);
      ctx.stroke();
      // Arrowhead
      ctx.beginPath();
      ctx.moveTo(x - 6, y - size + 8);
      ctx.lineTo(x, y - size);
      ctx.lineTo(x + 6, y - size + 8);
      ctx.stroke();
      break;

    case AnnotationType.Circle:
      ctx.beginPath();
      ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      ctx.stroke();
      break;

    case AnnotationType.Cross:
      const half = size / 2;
      ctx.beginPath();
      ctx.moveTo(x - half, y - half);
      ctx.lineTo(x + half, y + half);
      ctx.moveTo(x + half, y - half);
      ctx.lineTo(x - half, y + half);
      ctx.stroke();
      break;

    case AnnotationType.Dot:
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      break;

    case AnnotationType.Text:
      ctx.font = `${size}px sans-serif`;
      ctx.fillText(annotation.text || "", x, y);
      break;
  }

  ctx.restore();
}
