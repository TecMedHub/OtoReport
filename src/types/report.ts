import type { EarFindings, EarMarks } from "./findings";
import type { EarImage } from "./image";
import type { Patient } from "./patient";

export interface EarData {
  findings: EarFindings;
  marks: EarMarks;
  images: EarImage[];
  observations: string;
}

export type ReportStatus = "in_progress" | "completed";
export type ReportType = "otoscopy" | "ear_wash";

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  otoscopy: "Otoscopía",
  ear_wash: "Lavado de Oído",
};

export interface Report {
  id: string;
  patient_id: string;
  patient: Patient;
  session_id: string;
  status: ReportStatus;
  report_type: ReportType;
  examiner: string;
  equipment: string;
  right_ear: EarData;
  left_ear: EarData;
  post_right_ear?: EarData;
  post_left_ear?: EarData;
  conclusion: string;
  created_at: string;
  updated_at: string;
  findings_categories?: FindingsCategoryConfig[];
}

export interface UserProfile {
  id: string;
  name: string;
  color: string;
  avatar?: number;
  center_name: string;
  center_address: string;
  center_phone: string;
  center_email: string;
  logo_path: string;
  examiner: string;
  equipment: string;
  report_title: string;
  ear_wash_report_title: string;
  show_header: boolean;
  show_logo: boolean;
  show_patient_info: boolean;
  show_exam_info: boolean;
  show_diagram: boolean;
  show_annotations: boolean;
  show_findings: boolean;
  show_observations: boolean;
  show_images: boolean;
  show_conclusion: boolean;
  show_footer: boolean;
  image_size: string;
  images_per_row: number;
  theme_color: string;
  section_order: string[];
  findings_categories?: FindingsCategoryConfig[];
  app_theme: string;
}

export const PROFILE_COLORS = [
  "#3B82F6", "#EF4444", "#10B981", "#F59E0B",
  "#8B5CF6", "#EC4899", "#06B6D4", "#F97316",
];

export interface WorkspaceConfig {
  workspace_path: string;
  center_name: string;
  center_address: string;
  center_phone: string;
  center_email: string;
  logo_path: string;
  examiner: string;
  equipment: string;
  report_title: string;
  ear_wash_report_title: string;
  show_header: boolean;
  show_logo: boolean;
  show_patient_info: boolean;
  show_exam_info: boolean;
  show_diagram: boolean;
  show_annotations: boolean;
  show_findings: boolean;
  show_observations: boolean;
  show_images: boolean;
  show_conclusion: boolean;
  show_footer: boolean;
  image_size: "small" | "medium" | "large";
  images_per_row: number;
  theme_color: string;
  section_order: string[];
  findings_categories?: FindingsCategoryConfig[];
  app_theme: string;
}

export interface FindingCheckConfig {
  key: string;
  label: string;
  enabled: boolean;
  description?: string;
}

export interface FindingsCategoryConfig {
  id: string;
  name: string;
  checks: FindingCheckConfig[];
}

export const DEFAULT_FINDINGS_CATEGORIES: FindingsCategoryConfig[] = [
  {
    id: "membrane",
    name: "Membrana Timpánica",
    checks: [
      { key: "normal", label: "Normal", enabled: true, description: "Membrana timpánica de aspecto normal, translúcida, con cono luminoso presente" },
      { key: "retraction", label: "Retracción", enabled: true, description: "Retracción de la membrana timpánica" },
      { key: "perforation", label: "Perforación", enabled: true, description: "Perforación de la membrana timpánica" },
      { key: "effusion", label: "Efusión", enabled: true, description: "Presencia de líquido en oído medio" },
      { key: "inflammation", label: "Inflamación", enabled: true, description: "Membrana timpánica eritematosa e inflamada" },
    ],
  },
  {
    id: "cae",
    name: "Conducto Auditivo Externo",
    checks: [
      { key: "cae_normal", label: "Normal", enabled: true, description: "Conducto auditivo externo de aspecto normal, permeable" },
      { key: "cae_cerumen", label: "Cerumen", enabled: true, description: "Presencia de cerumen en el conducto auditivo" },
      { key: "cae_edema", label: "Edema", enabled: true, description: "Edema de la piel del conducto auditivo" },
      { key: "cae_otorrhea", label: "Otorrea", enabled: true, description: "Secreción en el conducto auditivo" },
      { key: "cae_exostosis", label: "Exostosis", enabled: true, description: "Crecimientos óseos múltiples bilaterales (oído de surfista)" },
    ],
  },
];

export interface SessionInfo {
  id: string;
  patient_id: string;
  patient_name: string;
  created_at: string;
  status: ReportStatus;
  report_type: ReportType;
}
