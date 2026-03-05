import type { Annotation, CropData } from "./annotation";

export type EarSide = "left" | "right" | "pre_left" | "pre_right" | "post_left" | "post_right";

export interface EarImage {
  id: string;
  filename: string;
  thumbnail: string;
  source: "camera" | "file";
  selected: boolean;
  primary: boolean;
  sort_order: number;
  rotation: number;
  notes: string;
  annotations: Annotation[];
  crop?: CropData | null;
  background?: "black" | "white" | "transparent";
}
