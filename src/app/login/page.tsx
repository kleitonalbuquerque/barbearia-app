"use client";
import { useState } from "react";
// ...existing code...
import { useTenant } from "@/contexts/TenantContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  // ...existing code...
  const { setTenantId } = useTenant();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    // login retorna true/false, mas precisamos buscar o tenantId
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success && data.user?.tenantId) {
      setTenantId(data.user.tenantId);
      // Branding pode ser salvo em localStorage se quiser usar depois
      if (data.user.branding) {
        window.localStorage.setItem("branding", JSON.stringify(data.user.branding));
      }
      router.replace("/");
    } else {
      setError("Credenciais inválidas");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded shadow-md w-full max-w-sm flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-center text-white mb-4">Entrar</h1>
        <input
          type="email"
          placeholder="E-mail"
          className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-gray-900"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-gray-900"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow transition"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
