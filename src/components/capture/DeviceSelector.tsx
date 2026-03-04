import { Video } from "lucide-react";

interface DeviceSelectorProps {
  devices: MediaDeviceInfo[];
  activeDeviceId: string;
  onSelect: (deviceId: string) => void;
}

export function DeviceSelector({
  devices,
  activeDeviceId,
  onSelect,
}: DeviceSelectorProps) {
  if (devices.length === 0) {
    return (
      <span className="flex items-center gap-2 text-sm text-yellow-400">
        <Video size={16} />
        Buscando cámaras...
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Video size={16} className="text-gray-400" />
      <select
        value={activeDeviceId}
        onChange={(e) => onSelect(e.target.value)}
        className="rounded-lg border border-gray-600 bg-gray-800 px-3 py-1.5 text-sm text-white"
      >
        {devices.map((d, i) => (
          <option key={d.deviceId} value={d.deviceId}>
            {d.label || `Cámara ${i + 1}`}
          </option>
        ))}
      </select>
    </div>
  );
}
