import { Header } from "@/components/layout/Header";
import { useWorkspace } from "@/hooks/useWorkspace";
import { FilePlus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function Dashboard() {
  const { activeProfile, config } = useWorkspace();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const displayName = activeProfile?.name || config?.examiner || "";

  return (
    <>
      <Header title={t("dashboard.title")} />
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-text-primary">
            {t("dashboard.welcome")}{displayName ? `, ${displayName}` : ""}
          </h3>
          <p className="mt-1 text-text-tertiary">
            {t("dashboard.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-lg">
          <button
            onClick={() => navigate("/new-report")}
            className="flex flex-col items-center gap-3 rounded-xl border border-border-secondary bg-bg-secondary p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <FilePlus size={32} className="text-accent-text" />
            <span className="font-medium text-text-secondary">{t("dashboard.newReport")}</span>
          </button>
          <button
            onClick={() => navigate("/patients")}
            className="flex flex-col items-center gap-3 rounded-xl border border-border-secondary bg-bg-secondary p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <Users size={32} className="text-accent-text" />
            <span className="font-medium text-text-secondary">{t("dashboard.patients")}</span>
          </button>
        </div>
      </div>
    </>
  );
}
