import { useEffect, useCallback } from "react";
import { X, Camera } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DeviceSelector } from "./DeviceSelector";
import { useCamera } from "@/hooks/useCamera";

interface CameraCaptureProps {
  onCapture: (data: Uint8Array) => void;
  onClose: () => void;
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const {
    devices,
    activeDeviceId,
    videoRef,
    init,
    stopStream,
    captureFrame,
    switchDevice,
  } = useCamera();

  // Initialize camera once on mount
  useEffect(() => {
    init();
    return () => {
      stopStream();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCapture = useCallback(() => {
    const frame = captureFrame();
    if (frame) {
      stopStream();
      onCapture(frame);
    }
  }, [captureFrame, onCapture, stopStream]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        handleCapture();
      } else if (e.code === "Escape") {
        stopStream();
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleCapture, stopStream, onClose]);

  function handleClose() {
    stopStream();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex items-center justify-between bg-gray-900 px-4 py-2">
        <DeviceSelector
          devices={devices}
          activeDeviceId={activeDeviceId}
          onSelect={switchDevice}
        />
        <span className="text-sm text-gray-400">
          Espacio / Enter para capturar
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="text-white hover:bg-gray-800"
        >
          <X size={20} />
        </Button>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="max-h-full max-w-full"
        />
      </div>
      <div className="flex justify-center bg-gray-900 py-4">
        <button
          onClick={handleCapture}
          className="rounded-full bg-white p-4 transition-transform hover:scale-105 active:scale-95"
        >
          <Camera size={24} className="text-gray-900" />
        </button>
      </div>
    </div>
  );
}
