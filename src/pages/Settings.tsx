import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Select } from "@/components/ui/Select";
import { useWorkspace } from "@/hooks/useWorkspace";
import { FolderOpen, Save, ImageIcon, X } from "lucide-react";
import type { WorkspaceConfig } from "@/types";

const defaultConfig: WorkspaceConfig = {
  workspace_path: "",
  center_name: "",
  center_address: "",
  center_phone: "",
  center_email: "",
  logo_path: "",
  examiner: "",
  equipment: "",
  report_title: "Informe de Otoscopía",
  show_logo: true,
  show_patient_info: true,
  show_diagram: true,
  show_annotations: true,
  show_findings: true,
  show_observations: true,
  show_images: true,
  show_conclusion: true,
  image_size: "medium",
  images_per_row: 3,
  theme_color: "blue",
};

const THEMES: Record<string, { primary: string; dark: string; label: string }> = {
  blue: { primary: "#2563eb", dark: "#1e3a5f", label: "Azul" },
  green: { primary: "#059669", dark: "#064e3b", label: "Verde" },
  teal: { primary: "#0d9488", dark: "#134e4a", label: "Teal" },
  purple: { primary: "#7c3aed", dark: "#4c1d95", label: "Morado" },
  rose: { primary: "#e11d48", dark: "#881337", label: "Rosa" },
  gray: { primary: "#6b7280", dark: "#1f2937", label: "Gris" },
};

function PdfMockup({ form, logoPreview }: { form: WorkspaceConfig; logoPreview: string | null }) {
  const theme = THEMES[form.theme_color] || THEMES.blue;

  return (
    <div className="w-full rounded-lg border border-gray-300 bg-white shadow-sm"
      style={{ aspectRatio: "210 / 297" }}
    >
      <div className="flex h-full flex-col p-4 text-[7px] leading-tight">
        {/* Header */}
        <div
          className="mb-2 flex items-center gap-2 pb-2"
          style={{ borderBottom: `2px solid ${theme.primary}` }}
        >
          {form.show_logo && (logoPreview ? (
            <img src={logoPreview} alt="" className="h-7 w-7 rounded object-contain" />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded bg-gray-100 text-gray-300">
              <ImageIcon size={10} />
            </div>
          ))}
          <div className="flex-1 min-w-0">
            <div className="truncate font-bold" style={{ color: theme.dark, fontSize: "10px" }}>
              {form.report_title || "Informe de Otoscopía"}
            </div>
            {form.center_name && (
              <div className="truncate font-semibold text-gray-600" style={{ fontSize: "6px" }}>
                {form.center_name}
              </div>
            )}
            {form.center_address && (
              <div className="truncate text-gray-400" style={{ fontSize: "5px" }}>{form.center_address}</div>
            )}
            <div className="text-gray-400" style={{ fontSize: "5px" }}>OtoReport — 04/03/2026</div>
          </div>
        </div>

        {/* Patient info */}
        {form.show_patient_info && (
          <div className="mb-2">
            <div className="mb-1 border-b border-gray-200 pb-0.5 font-bold" style={{ color: theme.dark }}>
              Datos del Paciente
            </div>
            <div className="space-y-px text-gray-500">
              <div><span className="font-semibold text-gray-600">Nombre:</span> Juan Pérez</div>
              <div><span className="font-semibold text-gray-600">RUT:</span> 12.345.678-9</div>
              <div><span className="font-semibold text-gray-600">Edad:</span> 45 años</div>
            </div>
          </div>
        )}

        {/* Exam info */}
        <div className="mb-2">
          <div className="mb-1 border-b border-gray-200 pb-0.5 font-bold" style={{ color: theme.dark }}>
            Datos del Examen
          </div>
          <div className="space-y-px text-gray-500">
            <div><span className="font-semibold text-gray-600">Examinador:</span> {form.examiner || "Dr. Ejemplo"}</div>
            <div><span className="font-semibold text-gray-600">Equipo:</span> {form.equipment || "Otoscopio"}</div>
          </div>
        </div>

        {/* Ears */}
        {(form.show_findings || form.show_observations || form.show_images) && (
          <div className="mb-2 flex-1">
            <div className="mb-1 border-b border-gray-200 pb-0.5 font-bold" style={{ color: theme.dark }}>
              Hallazgos
            </div>
            <div className="flex gap-2">
              {/* OD */}
              <div className="flex-1">
                <div className="mb-1 font-bold" style={{ color: "#dc2626" }}>Oído Derecho (OD)</div>
                {form.show_diagram && (
                  <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full border border-amber-300 bg-amber-50 text-amber-400" style={{ fontSize: "5px" }}>
                    OD
                  </div>
                )}
                {form.show_findings && (
                  <div className="space-y-px text-gray-500">
                    <div>• Normal</div>
                    <div>• Cerumen</div>
                  </div>
                )}
                {form.show_observations && (
                  <div className="mt-0.5 text-gray-400">Obs: Sin novedades</div>
                )}
                {form.show_images && (
                  <div className="mt-1 flex gap-0.5">
                    {Array.from({ length: Math.min(form.images_per_row, 3) }).map((_, i) => (
                      <div key={i} className="rounded bg-gray-100" style={{
                        width: form.image_size === "small" ? 12 : form.image_size === "large" ? 22 : 16,
                        height: form.image_size === "small" ? 9 : form.image_size === "large" ? 16 : 12,
                      }} />
                    ))}
                  </div>
                )}
              </div>
              {/* OI */}
              <div className="flex-1">
                <div className="mb-1 font-bold" style={{ color: "#2563eb" }}>Oído Izquierdo (OI)</div>
                {form.show_diagram && (
                  <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full border border-amber-300 bg-amber-50 text-amber-400" style={{ fontSize: "5px" }}>
                    OI
                  </div>
                )}
                {form.show_findings && (
                  <div className="space-y-px text-gray-500">
                    <div>• Normal</div>
                  </div>
                )}
                {form.show_observations && (
                  <div className="mt-0.5 text-gray-400">Obs: Leve inflamación</div>
                )}
                {form.show_images && (
                  <div className="mt-1 flex gap-0.5">
                    {Array.from({ length: Math.min(form.images_per_row, 3) }).map((_, i) => (
                      <div key={i} className="rounded bg-gray-100" style={{
                        width: form.image_size === "small" ? 12 : form.image_size === "large" ? 22 : 16,
                        height: form.image_size === "small" ? 9 : form.image_size === "large" ? 16 : 12,
                      }} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Conclusion */}
        {form.show_conclusion && (
          <div className="mb-2">
            <div className="mb-1 border-b border-gray-200 pb-0.5 font-bold" style={{ color: theme.dark }}>
              Conclusión
            </div>
            <div className="rounded bg-gray-50 p-1" style={{ borderLeft: `2px solid ${theme.primary}` }}>
              <span className="text-gray-500">Paciente con hallazgos dentro de lo normal...</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto flex justify-between text-gray-300" style={{ fontSize: "5px" }}>
          <span>OtoReport v1.0.0</span>
          <span>Página 1 de 1</span>
        </div>
      </div>
    </div>
  );
}

export function Settings() {
  const { config, workspacePath, selectWorkspace, updateConfig } =
    useWorkspace();
  const [form, setForm] = useState<WorkspaceConfig>(defaultConfig);
  const [saved, setSaved] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (config) {
      setForm({ ...defaultConfig, ...config });
    }
  }, [config]);

  useEffect(() => {
    if (form.logo_path) {
      loadLogoPreview(form.logo_path);
    } else {
      setLogoPreview(null);
    }
  }, [form.logo_path]);

  async function loadLogoPreview(path: string) {
    try {
      const bytes: number[] = await invoke("load_logo", { path });
      const blob = new Blob([new Uint8Array(bytes)]);
      setLogoPreview(URL.createObjectURL(blob));
    } catch {
      setLogoPreview(null);
    }
  }

  async function handleSelectLogo() {
    const selected = await open({
      multiple: false,
      filters: [{ name: "Imágenes", extensions: ["png", "jpg", "jpeg"] }],
    });
    if (selected) {
      setForm((f) => ({ ...f, logo_path: selected as string }));
    }
  }

  function handleRemoveLogo() {
    setForm((f) => ({ ...f, logo_path: "" }));
    setLogoPreview(null);
  }

  async function handleSave() {
    await updateConfig(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function updateField(field: keyof WorkspaceConfig, value: string | boolean | number) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  return (
    <>
      <Header title="Configuración" />
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto flex max-w-5xl gap-6">
          {/* Columna izquierda: Formulario */}
          <div className="flex-1 space-y-6">
            {/* Sección 1: Carpeta de Trabajo */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-800">
                Carpeta de Trabajo
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex-1 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
                  {workspacePath || "No configurado"}
                </div>
                <Button variant="secondary" onClick={selectWorkspace}>
                  <FolderOpen size={16} />
                  Cambiar
                </Button>
              </div>
            </div>

            {/* Sección 2: Centro de Salud y Examinador */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-800">
                Centro de Salud y Examinador
              </h3>
              <div className="space-y-4">
                <Input
                  label="Nombre del centro"
                  id="center_name"
                  value={form.center_name}
                  onChange={(e) => updateField("center_name", e.target.value)}
                  placeholder="Centro Auditivo San Carlos"
                />
                <Input
                  label="Dirección"
                  id="center_address"
                  value={form.center_address}
                  onChange={(e) => updateField("center_address", e.target.value)}
                  placeholder="Av. Libertador 1234, Santiago"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Teléfono"
                    id="center_phone"
                    value={form.center_phone}
                    onChange={(e) => updateField("center_phone", e.target.value)}
                    placeholder="+56 9 1234 5678"
                  />
                  <Input
                    label="Email"
                    id="center_email"
                    value={form.center_email}
                    onChange={(e) => updateField("center_email", e.target.value)}
                    placeholder="contacto@centro.cl"
                  />
                </div>

                {/* Logo */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Logo del centro
                  </label>
                  <div className="flex items-center gap-3">
                    {logoPreview ? (
                      <div className="relative">
                        <img
                          src={logoPreview}
                          alt="Logo"
                          className="h-16 w-16 rounded-lg border border-gray-200 object-contain"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="absolute -right-1.5 -top-1.5 rounded-full bg-red-500 p-0.5 text-white hover:bg-red-600"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400">
                        <ImageIcon size={24} />
                      </div>
                    )}
                    <Button variant="secondary" size="sm" onClick={handleSelectLogo}>
                      <ImageIcon size={14} />
                      {form.logo_path ? "Cambiar logo" : "Seleccionar logo"}
                    </Button>
                  </div>
                </div>

                <hr className="border-gray-200" />

                <Input
                  label="Nombre del examinador"
                  id="examiner"
                  value={form.examiner}
                  onChange={(e) => updateField("examiner", e.target.value)}
                  placeholder="Dr. Juan Pérez"
                />
                <Input
                  label="Equipo utilizado"
                  id="equipment"
                  value={form.equipment}
                  onChange={(e) => updateField("equipment", e.target.value)}
                  placeholder="Otoscopio digital Firefly DE550"
                />
              </div>
            </div>

            {/* Sección 3: Preferencias del Informe */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-800">
                Preferencias del Informe
              </h3>
              <div className="space-y-4">
                <Input
                  label="Título del informe"
                  id="report_title"
                  value={form.report_title}
                  onChange={(e) => updateField("report_title", e.target.value)}
                  placeholder="Informe de Otoscopía"
                />

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Secciones visibles
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Checkbox
                      id="show_logo"
                      label="Logo del centro"
                      checked={form.show_logo}
                      onChange={(e) => updateField("show_logo", e.target.checked)}
                    />
                    <Checkbox
                      id="show_patient_info"
                      label="Datos del paciente"
                      checked={form.show_patient_info}
                      onChange={(e) => updateField("show_patient_info", e.target.checked)}
                    />
                    <Checkbox
                      id="show_diagram"
                      label="Diagrama timpánico"
                      checked={form.show_diagram}
                      onChange={(e) => updateField("show_diagram", e.target.checked)}
                    />
                    <Checkbox
                      id="show_annotations"
                      label="Anotaciones en imágenes"
                      checked={form.show_annotations}
                      onChange={(e) => updateField("show_annotations", e.target.checked)}
                    />
                    <Checkbox
                      id="show_findings"
                      label="Hallazgos"
                      checked={form.show_findings}
                      onChange={(e) => updateField("show_findings", e.target.checked)}
                    />
                    <Checkbox
                      id="show_observations"
                      label="Observaciones"
                      checked={form.show_observations}
                      onChange={(e) => updateField("show_observations", e.target.checked)}
                    />
                    <Checkbox
                      id="show_images"
                      label="Imágenes"
                      checked={form.show_images}
                      onChange={(e) => updateField("show_images", e.target.checked)}
                    />
                    <Checkbox
                      id="show_conclusion"
                      label="Conclusión"
                      checked={form.show_conclusion}
                      onChange={(e) => updateField("show_conclusion", e.target.checked)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Tamaño de imágenes"
                    id="image_size"
                    value={form.image_size}
                    onChange={(e) => updateField("image_size", e.target.value)}
                    options={[
                      { value: "small", label: "Pequeño" },
                      { value: "medium", label: "Mediano" },
                      { value: "large", label: "Grande" },
                    ]}
                  />
                  <Select
                    label="Imágenes por fila"
                    id="images_per_row"
                    value={String(form.images_per_row)}
                    onChange={(e) => updateField("images_per_row", Number(e.target.value))}
                    options={[
                      { value: "2", label: "2" },
                      { value: "3", label: "3" },
                      { value: "4", label: "4" },
                    ]}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Color del informe
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(THEMES).map(([value, t]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => updateField("theme_color", value)}
                        className={`flex items-center gap-2 rounded-lg border-2 px-3 py-1.5 text-sm transition-colors ${
                          form.theme_color === value
                            ? "border-gray-800 bg-gray-50 font-medium"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <span
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: t.primary }}
                        />
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave}>
                <Save size={16} />
                {saved ? "Guardado" : "Guardar Configuración"}
              </Button>
            </div>
          </div>

          {/* Columna derecha: Vista previa */}
          <div className="w-64 shrink-0">
            <div className="sticky top-6 space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Vista previa</h3>
              <PdfMockup form={form} logoPreview={logoPreview} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
