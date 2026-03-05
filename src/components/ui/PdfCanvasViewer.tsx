import { useEffect, useRef, useState } from "react";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();


interface PdfCanvasViewerProps {
  pdfBlob: Blob;
  className?: string;
}

export function PdfCanvasViewer({ pdfBlob, className }: PdfCanvasViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const arrayBuffer = await pdfBlob.arrayBuffer();
        const pdfDoc = await getDocument({
          data: arrayBuffer,
          standardFontDataUrl: "/standard_fonts/",
        }).promise;
        const images: string[] = [];

        for (let i = 1; i <= pdfDoc.numPages; i++) {
          if (cancelled) return;
          const page = await pdfDoc.getPage(i);
          const scale = 2; // High-res rendering
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d")!;

          await page.render({ canvasContext: ctx, canvas, viewport } as never).promise;
          images.push(canvas.toDataURL("image/png"));
        }

        if (!cancelled) {
          setPageImages(images);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error rendering PDF pages:", err);
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [pdfBlob]);

  if (loading) return null;

  return (
    <div ref={containerRef} className={className}>
      {pageImages.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`Página ${i + 1}`}
          className="w-full rounded-lg shadow-sm"
          style={i > 0 ? { marginTop: 8 } : undefined}
        />
      ))}
    </div>
  );
}
