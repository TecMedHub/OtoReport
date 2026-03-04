import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { TympanicDiagram } from "@/components/otoscopy/TympanicDiagram";
import type { EarMarks } from "@/types/findings";
import type { EarSide } from "@/types/image";

export async function renderDiagramToImage(
  side: EarSide,
  marks: EarMarks
): Promise<string> {
  const svgMarkup = renderToStaticMarkup(
    createElement(TympanicDiagram, {
      side,
      marks,
      selectedFinding: null,
      onMarkQuadrant: () => {},
      showLegend: true,
    })
  );

  const svgString = svgMarkup.includes("xmlns")
    ? svgMarkup
    : svgMarkup.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');

  // Extraer el viewBox para calcular la proporción
  const vbMatch = svgString.match(/viewBox="0 0 (\d+) (\d+)"/);
  const vbW = vbMatch ? parseInt(vbMatch[1]) : 200;
  const vbH = vbMatch ? parseInt(vbMatch[2]) : 200;
  const width = 400;
  const height = Math.round(width * (vbH / vbW));

  return svgToPng(svgString, width, height);
}

function svgToPng(
  svgString: string,
  width: number,
  height: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}
