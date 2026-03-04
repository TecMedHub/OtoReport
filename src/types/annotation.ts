export enum AnnotationType {
  Arrow = "arrow",
  Text = "text",
  Circle = "circle",
  Cross = "cross",
  Dot = "dot",
}

export type EditorTool = AnnotationType | "eraser" | "crop-rect" | "crop-circle";

export interface Annotation {
  id: string;
  type: AnnotationType;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  text?: string;
}
