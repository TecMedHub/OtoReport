import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import type { Report, EarData, WorkspaceConfig } from "@/types";
import type { EarFindings } from "@/types/findings";

const IMAGE_SIZES = {
  small: { width: 80, height: 60 },
  medium: { width: 120, height: 90 },
  large: { width: 200, height: 150 },
} as const;

const PRIMARY_SIZE = { width: 200, height: 150 };

const THEMES: Record<string, { primary: string; dark: string }> = {
  blue: { primary: "#2563eb", dark: "#1e3a5f" },
  green: { primary: "#059669", dark: "#064e3b" },
  teal: { primary: "#0d9488", dark: "#134e4a" },
  purple: { primary: "#7c3aed", dark: "#4c1d95" },
  rose: { primary: "#e11d48", dark: "#881337" },
  gray: { primary: "#6b7280", dark: "#1f2937" },
};

const EAR_COLORS = {
  right: "#dc2626",
  left: "#2563eb",
};

function getTheme(name: string) {
  return THEMES[name] || THEMES.blue;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerLogo: {
    width: 60,
    height: 60,
    objectFit: "contain",
  },
  headerInfo: {
    flex: 1,
  },
  centerName: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 2,
  },
  centerDetail: {
    fontSize: 9,
    color: "#6b7280",
  },
  subtitle: {
    fontSize: 10,
    color: "#6b7280",
  },
  section: {
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    marginBottom: 3,
  },
  label: {
    width: 120,
    fontWeight: "bold",
    color: "#374151",
  },
  value: {
    flex: 1,
    color: "#4b5563",
  },
  earContainer: {
    flexDirection: "row",
    gap: 20,
  },
  earColumn: {
    flex: 1,
  },
  findingItem: {
    fontSize: 9,
    color: "#4b5563",
    marginBottom: 2,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#9ca3af",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

const findingLabels: Record<keyof EarFindings, string> = {
  normal: "Normal",
  retraction: "Retracción",
  perforation: "Perforación",
  effusion: "Efusión",
  tympanosclerosis: "Timpanoesclerosis",
  cholesteatoma: "Colesteatoma",
  inflammation: "Inflamación",
  cerumen: "Cerumen",
  foreign_body: "Cuerpo extraño",
  tube: "Tubo de ventilación",
  myringitis: "Miringitis",
  neomembrane: "Neomembrana",
  cae_normal: "CAE Normal",
  cae_edema: "CAE Edema",
  cae_exostosis: "CAE Exostosis",
  cae_otorrhea: "CAE Otorrea",
};

function ActiveFindings({ findings }: { findings: EarFindings }) {
  const active = (Object.keys(findings) as (keyof EarFindings)[]).filter(
    (k) => findings[k]
  );

  if (active.length === 0) return <Text style={styles.findingItem}>Sin hallazgos</Text>;

  return (
    <>
      {active.map((k) => (
        <Text key={k} style={styles.findingItem}>
          • {findingLabels[k]}
        </Text>
      ))}
    </>
  );
}

function EarSection({
  title,
  side,
  data,
  primaryImage,
  secondaryImages,
  diagramUrl,
  config,
}: {
  title: string;
  side: "right" | "left";
  data: EarData;
  primaryImage: string | null;
  secondaryImages: string[];
  diagramUrl?: string;
  config: WorkspaceConfig;
}) {
  const secSize = IMAGE_SIZES[config.image_size] || IMAGE_SIZES.medium;
  const earColor = EAR_COLORS[side];

  return (
    <View style={styles.earColumn}>
      <Text style={{ fontSize: 11, fontWeight: "bold", color: earColor, marginBottom: 6 }}>
        {title}
      </Text>
      {config.show_diagram && diagramUrl && (
        <Image
          src={diagramUrl}
          style={{
            width: 100,
            height: 100,
            marginBottom: 6,
          }}
        />
      )}
      {config.show_findings && <ActiveFindings findings={data.findings} />}
      {config.show_observations && data.observations && (
        <Text style={[styles.findingItem, { marginTop: 4 }]}>
          Obs: {data.observations}
        </Text>
      )}
      {config.show_images && primaryImage && (
        <View style={{ marginTop: 6 }}>
          <Image
            src={primaryImage}
            style={{
              width: PRIMARY_SIZE.width,
              height: PRIMARY_SIZE.height,
              objectFit: "cover" as const,
              borderRadius: 4,
              border: "1px solid #d1d5db",
            }}
          />
          {secondaryImages.length > 0 && (
            <View style={styles.imageGrid}>
              {secondaryImages.map((url, i) => (
                <Image
                  key={i}
                  src={url}
                  style={{
                    width: secSize.width,
                    height: secSize.height,
                    objectFit: "cover" as const,
                    borderRadius: 4,
                    border: "1px solid #e5e7eb",
                  }}
                />
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

interface PdfReportProps {
  report: Report;
  rightEarPrimary: string | null;
  rightEarSecondary: string[];
  leftEarPrimary: string | null;
  leftEarSecondary: string[];
  rightDiagramUrl?: string;
  leftDiagramUrl?: string;
  config: WorkspaceConfig;
  logoUrl: string | null;
}

export function PdfReport({
  report,
  rightEarPrimary,
  rightEarSecondary,
  leftEarPrimary,
  leftEarSecondary,
  rightDiagramUrl,
  leftDiagramUrl,
  config,
  logoUrl,
}: PdfReportProps) {
  const theme = getTheme(config.theme_color);
  const date = new Date(report.created_at).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const showLogo = config.show_logo && logoUrl;
  const hasCenterInfo = config.center_name || config.center_address || config.center_phone || config.center_email;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={[styles.header, { borderBottom: `2px solid ${theme.primary}` }]}>
          {showLogo && (
            <Image src={logoUrl} style={styles.headerLogo} />
          )}
          <View style={styles.headerInfo}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: theme.dark, marginBottom: 4 }}>
              {config.report_title || "Informe de Otoscopía"}
            </Text>
            {hasCenterInfo && (
              <>
                {config.center_name && (
                  <Text style={styles.centerName}>{config.center_name}</Text>
                )}
                {config.center_address && (
                  <Text style={styles.centerDetail}>{config.center_address}</Text>
                )}
                {(config.center_phone || config.center_email) && (
                  <Text style={styles.centerDetail}>
                    {[config.center_phone, config.center_email].filter(Boolean).join(" • ")}
                  </Text>
                )}
              </>
            )}
            <Text style={styles.subtitle}>OtoReport — {date}</Text>
          </View>
        </View>

        {/* Patient info */}
        {config.show_patient_info && (
          <View style={styles.section}>
            <Text style={{ fontSize: 12, fontWeight: "bold", color: theme.dark, marginBottom: 6, borderBottom: "1px solid #e5e7eb", paddingBottom: 3 }}>
              Datos del Paciente
            </Text>
            <View style={styles.row}>
              <Text style={styles.label}>Nombre:</Text>
              <Text style={styles.value}>{report.patient.name}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>RUT:</Text>
              <Text style={styles.value}>{report.patient.rut}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Edad:</Text>
              <Text style={styles.value}>{report.patient.age} años</Text>
            </View>
          </View>
        )}

        {/* Exam info */}
        <View style={styles.section}>
          <Text style={{ fontSize: 12, fontWeight: "bold", color: theme.dark, marginBottom: 6, borderBottom: "1px solid #e5e7eb", paddingBottom: 3 }}>
            Datos del Examen
          </Text>
          <View style={styles.row}>
            <Text style={styles.label}>Examinador:</Text>
            <Text style={styles.value}>{report.examiner}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Equipo:</Text>
            <Text style={styles.value}>{report.equipment}</Text>
          </View>
        </View>

        {/* Ears */}
        {(config.show_findings || config.show_observations || config.show_images) && (
          <View style={styles.section}>
            <Text style={{ fontSize: 12, fontWeight: "bold", color: theme.dark, marginBottom: 6, borderBottom: "1px solid #e5e7eb", paddingBottom: 3 }}>
              Hallazgos
            </Text>
            <View style={styles.earContainer}>
              <EarSection
                title="Oído Derecho (OD)"
                side="right"
                data={report.right_ear}
                primaryImage={rightEarPrimary}
                secondaryImages={rightEarSecondary}
                diagramUrl={rightDiagramUrl}
                config={config}
              />
              <EarSection
                title="Oído Izquierdo (OI)"
                side="left"
                data={report.left_ear}
                primaryImage={leftEarPrimary}
                secondaryImages={leftEarSecondary}
                diagramUrl={leftDiagramUrl}
                config={config}
              />
            </View>
          </View>
        )}

        {/* Conclusion */}
        {config.show_conclusion && report.conclusion && (
          <View style={styles.section}>
            <Text style={{ fontSize: 12, fontWeight: "bold", color: theme.dark, marginBottom: 6, borderBottom: "1px solid #e5e7eb", paddingBottom: 3 }}>
              Conclusión
            </Text>
            <View style={{ marginTop: 10, padding: 10, backgroundColor: "#f9fafb", borderRadius: 4, borderLeft: `3px solid ${theme.primary}` }}>
              <Text>{report.conclusion}</Text>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>OtoReport v1.0.0</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Página ${pageNumber} de ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
