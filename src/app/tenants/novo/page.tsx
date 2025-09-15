"use client";
import React, { useState } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { useRouter } from "next/navigation";

type NichoKey = 'barbearia' | 'clinica';
interface CorScheme {
  name: string;
  colors: { primary: string; secondary: string; accent: string; text: string };
}
const NICHOS: Record<NichoKey, CorScheme[]> = {
  barbearia: [
    { name: "Azul Escuro / Branco", colors: { primary: "#1e293b", secondary: "#fff", accent: "#64748b", text: "#000" } },
    { name: "Verde / Branco", colors: { primary: "#047857", secondary: "#fff", accent: "#d1fae5", text: "#000" } },
    { name: "Preto / Dourado", colors: { primary: "#000", secondary: "#ffd700", accent: "#fff", text: "#222" } },
  { name: "Rosa Escuro / Branco", colors: { primary: "#be185d", secondary: "#fff", accent: "#f472b6", text: "#000" } },
  ],
  clinica: [
    { name: "Azul Claro / Branco", colors: { primary: "#38bdf8", secondary: "#fff", accent: "#bae6fd", text: "#000" } },
    { name: "Verde Claro / Branco", colors: { primary: "#22d3ee", secondary: "#fff", accent: "#a7f3d0", text: "#000" } },
    { name: "Cinza / Azul", colors: { primary: "#64748b", secondary: "#38bdf8", accent: "#fff", text: "#222" } },
    { name: "Rosa / Branco", colors: { primary: "#f472b6", secondary: "#fff", accent: "#fbcfe8", text: "#000" } },
  ],
};

export default function NovoTenantPage() {
  const [form, setForm] = useState({
    nome: "",
    nicho: "barbearia" as NichoKey,
    subdominio: "",
    adminNome: "",
    adminEmail: "",
    adminSenha: "",
    cor: 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { setTenantId } = useTenant();
  const router = useRouter();


  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.nome,
          businessType: form.nicho,
          subdomain: form.subdominio,
          admin: {
            name: form.adminNome,
            email: form.adminEmail,
            password: form.adminSenha,
          },
          branding: NICHOS[form.nicho][form.cor].colors,
        }),
      });
      const data = await res.json();
      setSaving(false);
      if (data.success && data.tenant?.id) {
        setSuccess("Projeto implementado com sucesso!");
        setTenantId(data.tenant.id);
        setTimeout(() => router.push("/login"), 1200);
      } else {
        setError(data.error || "Erro ao criar projeto.");
      }
    } catch {
      setSaving(false);
      setError("Erro ao criar projeto.");
    }
  }

  return (
    <div className="max-w-lg mx-auto p-4" style={{ background: "var(--background)", color: "var(--text)" }}>
  <h1 className="text-2xl font-bold mb-6 brand-title">Novo Projeto / Negócio</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 rounded shadow p-6 flex flex-col gap-4"
        style={{ color: "#fff" }}
      >
        <input
          name="nome"
          placeholder="Nome do projeto"
          value={form.nome}
          onChange={handleChange}
          required
          className="p-3 border rounded"
          style={{ background: "#fff", color: "#222" }}
        />
        <select
          name="nicho"
          value={form.nicho}
          onChange={handleChange}
          className="p-3 border rounded"
          style={{ background: "#fff", color: "#222" }}
        >
          {Object.keys(NICHOS).map(n => (
            <option key={n} value={n} style={{ color: "#222", background: "#fff" }}>
              {n.charAt(0).toUpperCase() + n.slice(1)}
            </option>
          ))}
        </select>
        <input
          name="subdominio"
          placeholder="Subdomínio"
          value={form.subdominio}
          onChange={handleChange}
          required
          className="p-3 border rounded"
          style={{ background: "#fff", color: "#222" }}
        />
        <input
          name="adminNome"
          placeholder="Nome do admin"
          value={form.adminNome}
          onChange={handleChange}
          required
          className="p-3 border rounded"
          style={{ background: "#fff", color: "#222" }}
        />
        <input
          name="adminEmail"
          placeholder="E-mail do admin"
          value={form.adminEmail}
          onChange={handleChange}
          required
          className="p-3 border rounded"
          type="email"
          style={{ background: "#fff", color: "#222" }}
        />
        <input
          name="adminSenha"
          placeholder="Senha do admin"
          value={form.adminSenha}
          onChange={handleChange}
          required
          className="p-3 border rounded"
          type="password"
          style={{ background: "#fff", color: "#222" }}
        />
        <div>
          <fieldset>
            <legend className="block mb-2 font-semibold" style={{ color: "#fff" }}>Esquema de cores</legend>
            <div className="flex gap-2 flex-wrap">
              {NICHOS[form.nicho].map((c: CorScheme, idx: number) => (
                <label
                  key={c.name}
                  className="flex flex-col items-center cursor-pointer border rounded p-2"
                  style={{ borderColor: form.cor == idx ? c.colors.primary : '#ccc', borderWidth: form.cor == idx ? 2 : 1, color: "#fff" }}
                >
                  <input
                    type="radio"
                    name="cor"
                    value={idx}
                    checked={form.cor == idx}
                    onChange={handleChange}
                    className="mb-1"
                    aria-label={c.name}
                  />
                  <div className="flex gap-1">
                    <span style={{ background: c.colors.primary, width: 24, height: 24, display: 'inline-block', borderRadius: 4 }} />
                    <span style={{ background: c.colors.secondary, width: 24, height: 24, display: 'inline-block', borderRadius: 4 }} />
                    <span style={{ background: c.colors.accent, width: 24, height: 24, display: 'inline-block', borderRadius: 4 }} />
                    <span style={{ background: c.colors.text, width: 24, height: 24, display: 'inline-block', borderRadius: 4, border: '1px solid #888' }} />
                  </div>
                  <span className="text-xs mt-1">{c.name}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        <button
          type="submit"
          className="font-semibold px-4 py-2 rounded shadow transition"
          style={{ background: "var(--primary)", color: "#fff" }}
          disabled={saving}
        >
          {saving ? "Implementando..." : "Implementar Projeto"}
        </button>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        {success && <p className="text-green-600 text-sm mt-2">{success}</p>}
      </form>
    </div>
  );
}
