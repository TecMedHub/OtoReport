import { useState, useCallback } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { readFile } from "@tauri-apps/plugin-fs";
import type { EarData } from "@/types";
import type { EarSide, EarImage } from "@/types/image";
import { FindingType, QuadrantName } from "@/types/findings";
import { FindingsChecklist } from "./FindingsChecklist";
import { TympanicDiagram } from "./TympanicDiagram";
import { SymbolPalette } from "./SymbolPalette";
import { ImageActions } from "@/components/capture/ImageActions";
import { PhotoGallery } from "@/components/capture/PhotoGallery";
import { CameraCapture } from "@/components/capture/CameraCapture";
import { PhotoPreview } from "@/components/capture/PhotoPreview";
import { ImageAnnotator } from "@/components/annotation/ImageAnnotator";
import { useEarImages } from "@/hooks/useEarImages";

interface EarPanelProps {
  side: EarSide;
  data: EarData;
  patientId: string;
  sessionId: string;
  onChange: (data: EarData) => void;
  onMoveImage?: (image: EarImage) => void;
  readOnly?: boolean;
}

export function EarPanel({ side, data, patientId, sessionId, onChange, onMoveImage, readOnly }: EarPanelProps) {
  const title = side === "right" ? "Oído Derecho (OD)" : "Oído Izquierdo (OI)";
  const [selectedFinding, setSelectedFinding] = useState<FindingType | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [previewImage, setPreviewImage] = useState<EarImage | null>(null);
  const [annotatingImage, setAnnotatingImage] = useState<EarImage | null>(null);
  const [annotatingUrl, setAnnotatingUrl] = useState("");

  const { addImage, removeImage, toggleSelected, setPrimary, loadImageUrl } =
    useEarImages({
      patientId,
      sessionId,
      side,
      images: data.images,
      onChange: (images) => onChange({ ...data, images }),
    });

  function handleMarkQuadrant(quadrant: QuadrantName) {
    const existingIdx = data.marks.marks.findIndex(
      (m) => m.quadrant === quadrant
    );
    let newMarks = [...data.marks.marks];

    if (selectedFinding) {
      if (existingIdx >= 0) {
        if (newMarks[existingIdx].finding === selectedFinding) {
          newMarks.splice(existingIdx, 1);
        } else {
          newMarks[existingIdx] = { quadrant, finding: selectedFinding };
        }
      } else {
        newMarks.push({ quadrant, finding: selectedFinding });
      }
    } else if (existingIdx >= 0) {
      newMarks.splice(existingIdx, 1);
    }

    onChange({ ...data, marks: { marks: newMarks } });
  }

  async function handleCapture(frameData: Uint8Array) {
    await addImage(frameData, "camera", "png");
  }

  async function handleLoadFile() {
    const selected = await open({
      multiple: true,
      filters: [
        { name: "Imágenes", extensions: ["png", "jpg", "jpeg", "bmp", "webp"] },
      ],
    });
    if (selected) {
      const paths = Array.isArray(selected) ? selected : [selected];
      for (const filePath of paths) {
        const data = await readFile(filePath);
        const ext = filePath.split(".").pop() || "png";
        await addImage(new Uint8Array(data), "file", ext);
      }
    }
  }

  const loadPreviewImage = useCallback(() => {
    if (!previewImage) return Promise.resolve("");
    return loadImageUrl(previewImage.filename);
  }, [previewImage, loadImageUrl]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="mb-4 text-lg font-semibold text-gray-800">{title}</h3>

      <div className="space-y-4">
        <div className={`flex items-start gap-4${readOnly ? " pointer-events-none opacity-75" : ""}`}>
          <TympanicDiagram
            side={side}
            marks={data.marks}
            selectedFinding={selectedFinding}
            onMarkQuadrant={handleMarkQuadrant}
          />
          <div className="flex-1">
            <p className="mb-2 text-xs font-medium text-gray-500">
              Hallazgo a marcar:
            </p>
            <SymbolPalette
              selected={selectedFinding}
              onSelect={setSelectedFinding}
            />
          </div>
        </div>

        <div className={readOnly ? "pointer-events-none opacity-75" : ""}>
          <FindingsChecklist
            findings={data.findings}
            onChange={(findings) => onChange({ ...data, findings })}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Observaciones
          </label>
          <textarea
            value={data.observations}
            onChange={(e) =>
              onChange({ ...data, observations: e.target.value })
            }
            disabled={readOnly}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            placeholder="Observaciones adicionales..."
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">Imágenes</h4>
            {!readOnly && (
              <ImageActions
                onCapture={() => setShowCamera(true)}
                onLoad={handleLoadFile}
              />
            )}
          </div>
          <PhotoGallery
            images={data.images}
            loadImageUrl={loadImageUrl}
            onToggleSelected={toggleSelected}
            onSetPrimary={setPrimary}
            onRemove={removeImage}
            onPreview={setPreviewImage}
            onAnnotate={async (img) => {
              const url = await loadImageUrl(img.filename);
              setAnnotatingUrl(url);
              setAnnotatingImage(img);
            }}
            onMoveToOtherEar={!readOnly ? onMoveImage : undefined}
            onClearAnnotations={(id) => {
              const updated = data.images.map((img) =>
                img.id === id ? { ...img, annotations: [] } : img
              );
              onChange({ ...data, images: updated });
            }}
          />
        </div>
      </div>

      {showCamera && (
        <CameraCapture
          onCapture={(frame) => {
            handleCapture(frame);
            setShowCamera(false);
          }}
          onClose={() => setShowCamera(false)}
        />
      )}

      {previewImage && (
        <PhotoPreview
          loadImage={loadPreviewImage}
          rotation={previewImage.rotation}
          onClose={() => setPreviewImage(null)}
        />
      )}

      {annotatingImage && annotatingUrl && (
        <ImageAnnotator
          imageUrl={annotatingUrl}
          annotations={annotatingImage.annotations}
          rotation={annotatingImage.rotation}
          onSave={(annotations, rotation) => {
            const updated = data.images.map((img) =>
              img.id === annotatingImage.id
                ? { ...img, annotations, rotation }
                : img
            );
            onChange({ ...data, images: updated });
            setAnnotatingImage(null);
            setAnnotatingUrl("");
          }}
          onClose={() => {
            setAnnotatingImage(null);
            setAnnotatingUrl("");
          }}
        />
      )}
    </div>
  );
}
