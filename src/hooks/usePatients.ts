import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { Patient } from "@/types";

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const list = await invoke<Patient[]>("list_patients");
      setPatients(list);
    } catch (err) {
      console.error("Error loading patients:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(
    async (patient: Patient) => {
      await invoke("save_patient", { patient });
      await load();
    },
    [load]
  );

  const remove = useCallback(
    async (id: string) => {
      await invoke("delete_patient", { id });
      await load();
    },
    [load]
  );

  const filtered = patients.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.rut.toLowerCase().includes(q)
    );
  });

  return { patients: filtered, allPatients: patients, loading, search, setSearch, save, remove, reload: load };
}
