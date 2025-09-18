"use client";

import React, { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import dayjs from "dayjs";
import { useAuth } from "@/contexts/AuthContext";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  created_at?: string;
};

export default function UsuariosTenantPage() {
  const { fetchAuthed, loading: authLoading, isAuthenticated } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", cpf: "", cnpj: "" });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const params = typeof window !== "undefined" ? window.location.pathname.split("/") : [];
  const tenant = params.length > 1 ? params[1] : "";
  useEffect(() => {
    if (!authLoading && isAuthenticated && tenant) {
      fetchAuthed(`/api/users?tenantId=${tenant}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setUsers(data.users);
          else setError(data.error || "Erro ao carregar usuários");
        })
        .catch(() => setError("Erro ao carregar usuários"))
        .finally(() => setLoading(false));
    }
  }, [fetchAuthed, success, authLoading, isAuthenticated, tenant]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      // Adiciona o tenant/subdomínio ao corpo da requisição
      const payload = { ...form, tenantId: tenant };
      const res = await fetchAuthed("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setSaving(false);
      if (data.success) {
        setSuccess("Usuário admin criado com sucesso!");
        setShowForm(false);
        setForm({ name: "", email: "", password: "", phone: "", cpf: "", cnpj: "" });
      } else {
        setError(data.error || "Erro ao criar usuário");
      }
    } catch {
      setSaving(false);
      setError("Erro ao criar usuário");
    }
  }

  let content;
  if (authLoading || loading) {
    content = <div className="p-8 text-center text-gray-700 dark:text-gray-100">Carregando...</div>;
  } else if (!isAuthenticated) {
    content = <div className="p-8 text-center text-red-600">Acesso restrito. Faça login como admin.</div>;
  } else if (error) {
    content = <div className="p-8 text-center text-red-600">{error}</div>;
  } else {
    content = (
      <table className="w-full bg-white dark:bg-gray-900 rounded shadow">
        <thead>
          <tr>
            <th className="p-3 text-left text-gray-800 dark:text-gray-100">Nome</th>
            <th className="p-3 text-left text-gray-800 dark:text-gray-100">E-mail</th>
            <th className="p-3 text-left text-gray-800 dark:text-gray-100">Criado em</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(users) && users.length > 0 ? users.map((u) => {
            let dateStr = '-';
            if (u.created_at) {
              const formatted = dayjs(u.created_at).isValid() ? dayjs(u.created_at).format('DD/MM/YYYY HH:mm') : '-';
              dateStr = formatted;
            } else if (u.createdAt) {
              const formatted = dayjs(u.createdAt).isValid() ? dayjs(u.createdAt).format('DD/MM/YYYY HH:mm') : '-';
              dateStr = formatted;
            }
            return (
              <tr key={u.id} className="border-t border-gray-200 dark:border-gray-700">
                <td className="p-3 text-gray-700 dark:text-gray-100">{u.name}</td>
                <td className="p-3 text-gray-700 dark:text-gray-100">{u.email}</td>
                <td className="p-3 text-gray-700 dark:text-gray-100">{dateStr}</td>
              </tr>
            );
          }) : (
            <tr>
              <td colSpan={3} className="p-3 text-center text-gray-500">Nenhum usuário encontrado</td>
            </tr>
          )}
        </tbody>
      </table>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 brand-title text-gray-800 dark:text-gray-100">Gerenciar Usuários Admin</h1>
      <div className="mb-4 flex justify-end">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow"
          onClick={() => setShowForm(v => !v)}
        >
          {showForm ? "Cancelar" : "Novo Admin"}
        </button>
      </div>
      {showForm && isAuthenticated && !authLoading && (
        <form onSubmit={handleSave} className="bg-white dark:bg-gray-900 rounded shadow p-6 flex flex-col gap-4 mb-6">
          <label htmlFor="name" className="text-sm font-semibold brand-title text-gray-800 dark:text-gray-100">Nome</label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="p-3 border border-gray-300 rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
          />
          <label htmlFor="email" className="text-sm font-semibold brand-title text-gray-800 dark:text-gray-100">E-mail</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            className="p-3 border border-gray-300 rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
          />
          <label htmlFor="phone" className="block text-sm font-medium brand-title mt-4 text-gray-800 dark:text-gray-100">Telefone</label>
          <input
            id="phone"
            name="phone"
            type="text"
            value={form.phone}
            onChange={handleChange}
            required
            placeholder="(11) 99999-9999"
            className="p-3 border border-gray-300 rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
          />
          <label htmlFor="cpf" className="block text-sm font-medium brand-title mt-4 text-gray-800 dark:text-gray-100">CPF (opcional)</label>
          <input
            id="cpf"
            name="cpf"
            type="text"
            value={form.cpf}
            onChange={handleChange}
            placeholder="Somente números, 11 dígitos"
            className="p-3 border border-gray-300 rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
          />
          <label htmlFor="cnpj" className="block text-sm font-medium brand-title mt-4 text-gray-800 dark:text-gray-100">CNPJ (opcional)</label>
          <input
            id="cnpj"
            name="cnpj"
            type="text"
            value={form.cnpj}
            onChange={handleChange}
            placeholder="Somente números, 14 dígitos"
            className="p-3 border border-gray-300 rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
          />
          <label htmlFor="password" className="text-sm font-semibold brand-title text-gray-800 dark:text-gray-100">Senha</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            className="p-3 border border-gray-300 rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
          />
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
          {success && <p className="text-green-600 text-sm mt-2">{success}</p>}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow"
            disabled={saving}
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </form>
      )}
      {content}
    </div>
  );
}
