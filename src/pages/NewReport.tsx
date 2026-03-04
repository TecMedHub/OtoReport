import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import { v4 as uuidv4 } from "uuid";
import { Header } from "@/components/layout/Header";
import { ReportForm } from "@/components/otoscopy/ReportForm";
import { useReports } from "@/hooks/useReports";
import { usePatients } from "@/hooks/usePatients";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { formatRut, cleanRut, validateRut, calculateAge } from "@/lib/utils";
import { CheckCircle } from "lucide-react";
import type { Patient } from "@/types";

export function NewReport() {
  const [searchParams] = useSearchParams();
  const patientIdParam = searchParams.get("patient");
  const sessionIdParam = searchParams.get("session");

  const { report, createSession, saveReport, updateReport, loadReport, saving } =
    useReports();
  const { allPatients } = usePatients();
  useWorkspace();
  const { toast } = useToast();

  // Patient inline state
  const [rutInput, setRutInput] = useState("");
  const [foundPatient, setFoundPatient] = useState<Patient | null>(null);
  const [patientName, setPatientName] = useState("");
  const [patientBirthDate, setPatientBirthDate] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [rutValid, setRutValid] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Dropdown state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Si vienen params de edición, cargar directo
  useEffect(() => {
    async function init() {
      try {
        if (patientIdParam && sessionIdParam) {
          await loadReport(patientIdParam, sessionIdParam);
        } else if (patientIdParam) {
          const patient = await invoke<Patient>("get_patient", { id: patientIdParam });
          selectPatient(patient);
        }
      } catch (err) {
        console.error("Error initializing report:", err);
      } finally {
        setInitializing(false);
      }
    }
    init();
  }, [patientIdParam, sessionIdParam, loadReport]);

  function selectPatient(p: Patient) {
    setFoundPatient(p);
    setRutInput(cleanRut(p.rut));
    setPatientName(p.name);
    setPatientBirthDate(p.birth_date);
    setPatientPhone(p.phone);
    setPatientEmail(p.email);
    setRutValid(true);
    setShowSuggestions(false);
  }

  // Filtrar pacientes por lo que se va escribiendo
  const rutClean = cleanRut(rutInput).toLowerCase();
  const suggestions =
    rutClean.length >= 2
      ? allPatients.filter((p) => {
          const pRut = cleanRut(p.rut).toLowerCase();
          return pRut.startsWith(rutClean) || pRut.includes(rutClean);
        })
      : [];

  function handleRutChange(value: string) {
    const clean = cleanRut(value);
    setRutInput(clean);
    setRutValid(validateRut(clean));
    setShowSuggestions(true);

    // Si ya tenían un paciente seleccionado y cambiaron el RUT, desvincularlo
    if (foundPatient && cleanRut(foundPatient.rut) !== clean) {
      setFoundPatient(null);
      setPatientName("");
      setPatientBirthDate("");
      setPatientPhone("");
      setPatientEmail("");
    }
  }

  async function handleStartReport() {
    if (!rutValid || !patientName.trim()) return;

    const now = new Date().toISOString();
    const patient: Patient = foundPatient
      ? {
          ...foundPatient,
          name: patientName,
          birth_date: patientBirthDate,
          age: patientBirthDate ? calculateAge(patientBirthDate) : 0,
          phone: patientPhone,
          email: patientEmail,
          updated_at: now,
        }
      : {
          id: uuidv4(),
          rut: formatRut(rutInput),
          name: patientName,
          birth_date: patientBirthDate,
          age: patientBirthDate ? calculateAge(patientBirthDate) : 0,
          phone: patientPhone,
          email: patientEmail,
          notes: "",
          created_at: now,
          updated_at: now,
        };

    await invoke("save_patient", { patient });
    await createSession(patient);
    toast(foundPatient ? "Informe iniciado" : "Paciente creado e informe iniciado", "success");
  }

  // Loading para edición de informe existente
  if (initializing && (patientIdParam || sessionIdParam)) {
    return (
      <>
        <Header title="Nuevo Informe" />
        <div className="flex flex-1 items-center justify-center">
          <Spinner />
        </div>
      </>
    );
  }

  // Ya hay informe cargado → mostrar formulario
  if (report) {
    const isReadOnly = report.status === "completed";
    return (
      <>
        <Header title={isReadOnly ? "Informe (Solo lectura)" : "Informe"} />
        <div className="flex-1 overflow-auto p-6">
          <ReportForm
            report={report}
            onChange={updateReport}
            onSave={saveReport}
            saving={saving}
            readOnly={isReadOnly}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Nuevo Informe" />
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-lg space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
              Datos del Paciente
            </h3>

            <div className="space-y-4">
              {/* RUT con dropdown de sugerencias */}
              <div className="relative" ref={wrapperRef}>
                <Input
                  label="RUT"
                  id="rut"
                  value={formatRut(rutInput)}
                  onChange={(e) => handleRutChange(e.target.value)}
                  onFocus={() => rutClean.length >= 2 && setShowSuggestions(true)}
                  placeholder="12.345.678-5"
                  autoComplete="off"
                  error={
                    rutInput.length > 0 && !rutValid ? "RUT inválido" : undefined
                  }
                />

                {/* Dropdown sugerencias */}
                {showSuggestions && suggestions.length > 0 && !foundPatient && (
                  <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
                    <div className="max-h-48 overflow-auto py-1">
                      {suggestions.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => selectPatient(p)}
                          className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-blue-50 transition-colors"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">
                              {p.name}
                            </p>
                            <p className="text-xs text-gray-500">{p.rut}</p>
                          </div>
                          {p.age > 0 && (
                            <span className="text-xs text-gray-400">
                              {p.age} años
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {foundPatient && (
                <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                  <CheckCircle size={16} />
                  Paciente existente — datos autocompletados
                </div>
              )}

              <Input
                label="Nombre completo"
                id="name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Juan Pérez González"
              />

              <Input
                label="Fecha de nacimiento"
                id="birth_date"
                type="date"
                value={patientBirthDate}
                onChange={(e) => setPatientBirthDate(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Teléfono"
                  id="phone"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="+56 9 1234 5678"
                />
                <Input
                  label="Email"
                  id="email"
                  type="email"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  placeholder="paciente@email.com"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={handleStartReport}
            disabled={!rutValid || !patientName.trim()}
            className="w-full py-3"
          >
            Comenzar Informe
          </Button>
        </div>
      </div>
    </>
  );
}
