"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function NovoServicoPage() {
  const { fetchAuthed, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", priceCents: "", durationMinutes: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    const priceCents = Number(form.priceCents.replace(',', '.')) * 100;
    const durationMinutes = parseInt(form.durationMinutes, 10);
    if (!form.name || isNaN(priceCents) || isNaN(durationMinutes)) {
      setError("Preencha todos os campos corretamente.");
      setSaving(false);
      return;
    }
    try {
      const res = await fetchAuthed("/api/services", {
        method: "POST",
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
        setSuccess("Serviço criado com sucesso!");
        router.push("/servicos");
      } else {
        setError(data.error || "Erro ao criar serviço.");
      }
    } catch {
      setSaving(false);
      setError("Erro ao criar serviço.");
    }
  }

  if (authLoading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }
  if (!isAuthenticated) {
    return <div className="p-8 text-center text-red-600">Acesso restrito. Faça login como admin.</div>;
  }
  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-white">Novo Serviço</h1>
      <form onSubmit={handleSave} className="bg-white dark:bg-gray-900 rounded shadow p-6 flex flex-col gap-4">
        {/* ...existing code... */}
        <label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Nome</label>
        <input
          id="name"
          className="p-3 border border-gray-300 rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <label htmlFor="priceCents" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Preço (R$)</label>
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
        <label htmlFor="durationMinutes" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Duração (minutos)</label>
        <input
          id="durationMinutes"
          className="p-3 border border-gray-300 rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
          name="durationMinutes"
          value={form.durationMinutes}
          onChange={handleChange}
          required
          type="number"
          min="1"
        />
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        {success && <p className="text-green-600 text-sm mt-2">{success}</p>}
        <div className="flex gap-2 mt-4">
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
            onClick={() => router.back()}
            disabled={saving}
          >
            Voltar
          </button>
        </div>
      </form>
    </div>
  );
}
