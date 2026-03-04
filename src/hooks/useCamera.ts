import { useState, useRef, useCallback } from "react";

export function useCamera() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState<string>("");
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startStream = useCallback(
    async (deviceId: string) => {
      // Stop any existing stream first
      stopStream();

      try {
        const constraints: MediaStreamConstraints = {
          video: deviceId
            ? { deviceId: { exact: deviceId }, width: { ideal: 1920 }, height: { ideal: 1080 } }
            : { width: { ideal: 1920 }, height: { ideal: 1080 } },
        };

        const mediaStream =
          await navigator.mediaDevices.getUserMedia(constraints);

        streamRef.current = mediaStream;
        setActiveDeviceId(deviceId);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play().catch(() => {});
        }
      } catch (err) {
        console.error("Error starting camera:", err);
      }
    },
    [stopStream]
  );

  const init = useCallback(async () => {
    // First request permission with any camera so labels are available
    try {
      const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Get device list now that we have permission
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter((d) => d.kind === "videoinput");
      setDevices(videoDevices);

      // Stop the temp stream
      tempStream.getTracks().forEach((t) => t.stop());

      // Start with first device
      if (videoDevices.length > 0) {
        await startStream(videoDevices[0].deviceId);
      }
    } catch (err) {
      console.error("Error initializing camera:", err);
    }
  }, [startStream]);

  const switchDevice = useCallback(
    async (deviceId: string) => {
      await startStream(deviceId);
    },
    [startStream]
  );

  const captureFrame = useCallback((): Uint8Array | null => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return null;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/png");
    const base64 = dataUrl.split(",")[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }, []);

  return {
    devices,
    activeDeviceId,
    videoRef,
    init,
    startStream,
    stopStream,
    captureFrame,
    switchDevice,
  };
}
