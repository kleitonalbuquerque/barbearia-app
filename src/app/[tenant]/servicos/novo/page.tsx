"use client";
import { useState } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Spinner from "@/components/Spinner";

export default function NovoServicoPage() {
  const { fetchAuthed, loading: authLoading, isAuthenticated } = useAuth();
  const { tenantId, subdomain } = useTenant();
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
          tenantId,
        }),
      });
      const data = await res.json();
      setSaving(false);
      if (data.success) {
        setSuccess("Serviço criado com sucesso!");
        // Preferir subdomínio se disponível
  // Usa subdomínio do contexto React, nunca o tenantId
  router.push(`/${subdomain}/servicos`);
      } else {
        setError(data.error || "Erro ao criar serviço.");
      }
    } catch {
      setSaving(false);
      setError("Erro ao criar serviço.");
    }
  }

  if (authLoading) {
    return <div className="p-8 text-center"><Spinner /></div>;
  }
  if (!isAuthenticated) {
    return <div className="p-8 text-center text-red-600 font-bold">Você precisa estar logado para acessar esta página.</div>;
  }
  return (
    <div className="max-w-lg mx-auto p-4" style={{ background: "#fff", color: "#222" }}>
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Novo Serviço</h1>
      <form onSubmit={handleSave} className="bg-white rounded shadow p-6 flex flex-col gap-4">
        <input
          name="name"
          placeholder="Nome do serviço"
          value={form.name}
          onChange={handleChange}
          required
          className="p-3 border rounded"
          style={{ background: "#fff", color: "#222" }}
        />
        <input
          name="priceCents"
          placeholder="Preço (R$)"
          value={form.priceCents}
          onChange={handleChange}
          required
          className="p-3 border rounded"
          style={{ background: "#fff", color: "#222" }}
        />
        <input
          name="durationMinutes"
          placeholder="Duração (minutos)"
          value={form.durationMinutes}
          onChange={handleChange}
          required
          className="p-3 border rounded"
          style={{ background: "#fff", color: "#222" }}
        />
        <button
          type="submit"
          className="font-semibold px-4 py-2 rounded shadow transition bg-blue-600 text-white"
          disabled={saving}
        >
          {saving ? "Salvando..." : "Salvar Serviço"}
        </button>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        {success && <p className="text-green-600 text-sm mt-2">{success}</p>}
      </form>
    </div>
  );
}
