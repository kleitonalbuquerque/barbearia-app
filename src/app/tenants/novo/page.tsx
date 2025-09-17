type NichoKey = 'barbearia' | 'clinica';
"use client";
import React, { useState } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { useRouter } from "next/navigation";



export default function NovoTenantPage() {
  const [form, setForm] = useState({
    nome: "",
    nicho: "barbearia" as NichoKey,
    subdominio: "",
    adminNome: "",
    adminEmail: "",
    adminSenha: "",
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
          branding: {
            primary: "#1e293b",
            secondary: "#fff",
            accent: "#374151",
            text: "#000"
          },
        }),
      });
      const data = await res.json();
      setSaving(false);
      if (data.success && data.tenant?.id) {
        setSuccess("Projeto implementado com sucesso!");
        setTenantId(data.tenant.id, form.subdominio);
        window.localStorage.setItem('tenantSubdomain', form.subdominio);
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
  <h1 className="text-2xl font-bold mb-6 text-white">Novo Projeto / Negócio</h1>
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
          <option value="barbearia">Barbearia</option>
          <option value="clinica">Clínica</option>
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
