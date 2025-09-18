"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Spinner from "@/components/Spinner";

interface ServiceType {
  id: string;
  name: string;
  priceCents: number;
  durationMinutes: number;
}

export default function ServicoDetalhePage() {
  const { fetchAuthed } = useAuth();
  const params = useParams();
  const router = useRouter();
  const serviceId = params?.id as string;
  const [service, setService] = useState<ServiceType | null>(null);
  const [form, setForm] = useState({ name: "", priceCents: "", durationMinutes: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!serviceId) return;
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
  }, [serviceId]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const priceCents = Number(form.priceCents.replace(',', '.')) * 100;
      const durationMinutes = parseInt(form.durationMinutes, 10);
      if (isNaN(priceCents) || isNaN(durationMinutes)) {
        setSaving(false);
        setError("Preço ou duração inválidos.");
        return;
      }
      const res = await fetchAuthed(`/api/services/${serviceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          priceCents,
          durationMinutes,
        }),
      });
      const data = await res.json();
      setSaving(false);
      if (data.success) {
        setSuccess("Serviço atualizado com sucesso!");
        setEditMode(false);
        setService(data.service);
        setForm({
          name: data.service.name,
          priceCents: String(data.service.priceCents),
          durationMinutes: String(data.service.durationMinutes),
        });
        // Extrai o tenant da URL: /[tenant]/servicos/[id]
        const tenantFromUrl = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : '';
        setTimeout(() => {
          window.location.href = `${window.location.origin}/${tenantFromUrl}/servicos`;
        }, 1200);
      } else {
        setError((data && data.error) || "Erro ao atualizar serviço.");
        if (data && data.error) console.error("API error:", data.error);
      }
    } catch (err) {
      setSaving(false);
      setError("Erro ao atualizar serviço.");
      console.error("Erro ao atualizar serviço:", err);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setError("");
    try {
      const res = await fetchAuthed(`/api/services/${serviceId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      setDeleting(false);
      if (data.success) {
        // Extrai o tenant da URL: /[tenant]/servicos/[id]
        const tenantFromUrl = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : '';
        window.location.href = `${window.location.origin}/${tenantFromUrl}/servicos`;
      } else {
        setError((data && data.error) || "Erro ao remover serviço.");
      }
    } catch (err) {
      setDeleting(false);
      setError("Erro ao remover serviço.");
      console.error("Erro ao remover serviço:", err);
    }
  }

  if (loading) return <div className="p-8 text-center"><Spinner /></div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!service) return <div className="p-8 text-center">Serviço não encontrado.</div>;

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 brand-title">Detalhes do Serviço</h1>
      {/* Modal de confirmação de remoção */}
      {showDeleteConfirm && (
  <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded shadow p-6 w-full max-w-sm text-center">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Confirmar remoção</h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">Tem certeza que deseja remover este serviço?</p>
            <div className="flex gap-2 justify-center">
              <button
                className="bg-red-600 hover:bg-red-700 text-white dark:text-white font-semibold px-4 py-2 rounded shadow transition"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Removendo..." : "Remover"}
              </button>
              <button
                className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-blue-800 dark:text-gray-100 font-semibold px-4 py-2 rounded shadow transition"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      <form onSubmit={handleSave} className="bg-white dark:bg-gray-900 rounded shadow p-6 flex flex-col gap-4">
  <label htmlFor="name" className="text-sm font-semibold brand-title">Nome</label>
        <input
          id="name"
          className="p-3 border border-gray-300 rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
          name="name"
          value={form.name}
          onChange={handleChange}
          disabled={!editMode}
          required
        />
  <label htmlFor="priceCents" className="text-sm font-semibold brand-title">Preço (R$)</label>
        {editMode ? (
          <input
            id="priceCents"
            className="p-3 border border-gray-300 rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
            name="priceCents"
            value={form.priceCents}
            onChange={handleChange}
            required
            type="number"
            min="0"
            step="0.01"
          />
        ) : (
          <input
            id="priceCents"
            className="p-3 border border-gray-300 rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
            name="priceCents"
            value={(Number(form.priceCents) / 100).toFixed(2)}
            disabled
            readOnly
            type="text"
          />
        )}
  <label htmlFor="durationMinutes" className="text-sm font-semibold brand-title">Duração (minutos)</label>
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
                onClick={e => { e.preventDefault(); setEditMode(true); setError(""); setSuccess(""); }}
              >
                Editar Serviço
              </button>
              <button
                type="button"
                className="bg-red-600 hover:bg-red-700 text-white dark:text-white font-semibold px-4 py-2 rounded shadow transition"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Remover Serviço
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
