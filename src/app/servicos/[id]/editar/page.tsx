"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface ServiceType {
  id: string;
  name: string;
  priceCents: number;
  durationMinutes: number;
}

export default function EditarServicoPage() {
  const { fetchAuthed, loading: authLoading, isAuthenticated } = useAuth();
  const params = useParams();
  const router = useRouter();
  const serviceId = params?.id as string;
  const [service, setService] = useState<ServiceType | null>(null);
  const [form, setForm] = useState({ name: "", priceCents: "", durationMinutes: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (!serviceId || authLoading || !isAuthenticated) return;
    setLoading(true);
    fetch(`/api/services/${serviceId}`)
      .then((res) => res.json())
      .then((data) => {
        setService(data.service || null);
        setForm({
          name: data.service?.name || "",
          priceCents: data.service ? String(data.service.priceCents / 100) : "",
          durationMinutes: data.service ? String(data.service.durationMinutes) : "",
        });
        setError(data.success ? "" : data.error || "Erro ao carregar serviço.");
      })
      .catch(() => setError("Erro ao carregar serviço."))
      .finally(() => setLoading(false));
  }, [serviceId, authLoading, isAuthenticated]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetchAuthed(`/api/services/${serviceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          priceCents: Math.round(Number(form.priceCents.replace(',', '.')) * 100),
          durationMinutes: Number(form.durationMinutes),
        }),
      });
      const data = await res.json();
      setSaving(false);
      if (data.success) {
  setSuccess("Serviço atualizado com sucesso!");
  setEditMode(false);
  setService(data.service);
  setTimeout(() => router.push(`/servicos/${serviceId}`), 1200);
      } else {
        setError(data.error || "Erro ao atualizar serviço.");
      }
    } catch {
      setSaving(false);
      setError("Erro ao atualizar serviço.");
    }
  }

  if (authLoading) return <div className="p-8 text-center">Carregando...</div>;
  if (!isAuthenticated) return <div className="p-8 text-center text-red-600">Acesso restrito. Faça login como admin.</div>;
  if (loading) return <div className="p-8 text-center">Carregando...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!service) return <div className="p-8 text-center">Serviço não encontrado.</div>;

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-white">Editar Serviço</h1>
      <form onSubmit={handleSave} className="bg-white dark:bg-gray-900 rounded shadow p-6 flex flex-col gap-4">
        <label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Nome</label>
        <input
          id="name"
          className="p-3 border border-gray-300 rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
          name="name"
          value={form.name}
          onChange={handleChange}
          disabled={!editMode}
          required
        />
        <label htmlFor="priceCents" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Preço (R$)</label>
        <input
          id="priceCents"
          className="p-3 border border-gray-300 rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
          name="priceCents"
          value={form.priceCents}
          onChange={handleChange}
          disabled={!editMode}
          required
          type="number"
          min="0"
          step="0.01"
        />
        <label htmlFor="durationMinutes" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Duração (minutos)</label>
        <input
          id="durationMinutes"
          className="p-3 border border-gray-300 rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
          name="durationMinutes"
          value={form.durationMinutes}
          onChange={handleChange}
          disabled={!editMode}
          required
          type="number"
          min="1"
        />
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        {success && <p className="text-green-600 text-sm mt-2">{success}</p>}
        <div className="flex gap-2 mt-4">
          {editMode ? (
            <>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow transition"
                disabled={saving}
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
              <button
                type="button"
                className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 font-semibold px-4 py-2 rounded shadow transition"
                onClick={() => { setEditMode(false); setForm({ name: service.name, priceCents: String(service.priceCents/100), durationMinutes: String(service.durationMinutes) }); setError(""); setSuccess(""); }}
                disabled={saving}
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow transition"
                onClick={() => setEditMode(true)}
              >
                Editar
              </button>
              <button
                type="button"
                className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 font-semibold px-4 py-2 rounded shadow transition"
                onClick={() => router.back()}
              >
                Voltar
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
