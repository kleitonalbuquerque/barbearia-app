"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { useRouter } from "next/navigation";

	export default function NovoProfissionalPage() {
		const { fetchAuthed, user } = useAuth();
		const { tenantId } = useTenant();
		const [form, setForm] = useState({ name: "", email: "", phone: "", cpf: "", cnpj: "" });
		const [saving, setSaving] = useState(false);
		const [error, setError] = useState("");
		const [success, setSuccess] = useState("");
		const router = useRouter();

		function validateEmail(email: string) {
			return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
		}
		function validateCPF(cpf: string) {
			return /^\d{11}$/.test(cpf);
		}
		function validateCNPJ(cnpj: string) {
			return cnpj === '' || /^\d{14}$/.test(cnpj);
		}
		function validatePhone(phone: string) {
			return /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(phone);
		}
		async function handleSubmit(e: React.FormEvent) {
			e.preventDefault();
				if (form.email && !validateEmail(form.email)) {
					setError("E-mail inválido");
					return;
				}
				if (form.cpf && !validateCPF(form.cpf)) {
					setError("CPF deve ter 11 dígitos numéricos");
					return;
				}
				if (form.cnpj && !validateCNPJ(form.cnpj)) {
					setError("CNPJ deve ter 14 dígitos numéricos ou estar vazio");
					return;
				}
				if (form.phone && !validatePhone(form.phone)) {
					setError("Telefone inválido. Ex: (11) 99999-9999");
					return;
				}
				setSaving(true);
				setError("");
				setSuccess("");
				try {
					// Usa tenantId do contexto, se não houver pega do usuário autenticado
					const effectiveTenantId = tenantId || user?.tenantId;
					if (!effectiveTenantId) {
						setError("TenantId não encontrado. Faça login novamente ou selecione um negócio.");
						setSaving(false);
						return;
					}
					const res = await fetchAuthed("/api/professionals", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ ...form, cnpj: form.cnpj || undefined, tenantId: effectiveTenantId }),
					});
					const data = await res.json();
					setSaving(false);
					if (data.success) {
						setSuccess("Profissional cadastrado com sucesso!");
						setTimeout(() => router.push("/professionals"), 1200);
					} else {
						setError(data.error || "Erro ao cadastrar profissional.");
					}
				} catch {
					setSaving(false);
					setError("Erro ao cadastrar profissional.");
				}
			}

			function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
				setForm({ ...form, [e.target.name]: e.target.value });
			}

			return (
				<div className="max-w-lg mx-auto p-4">
					<h1 className="text-2xl font-bold mb-6 brand-title">Novo Profissional</h1>
					<form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded shadow p-6 flex flex-col gap-4">
						<input
							className="p-3 border border-gray-300 rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500"
							name="name"
							placeholder="Nome completo"
							value={form.name}
							onChange={handleChange}
							required
						/>
						<input
							className="p-3 border border-gray-300 rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500"
							name="email"
							placeholder="E-mail"
							value={form.email}
							onChange={handleChange}
							type="email"
						/>
						<input
							className="p-3 border border-gray-300 rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500"
							name="phone"
							placeholder="Telefone"
							value={form.phone}
							onChange={handleChange}
						/>
						<input
							className="p-3 border border-gray-300 rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500"
							name="cpf"
							placeholder="CPF"
							value={form.cpf}
							onChange={handleChange}
						/>
						<input
							className="p-3 border border-gray-300 rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500"
							name="cnpj"
							placeholder="CNPJ (opcional)"
							value={form.cnpj}
							onChange={handleChange}
						/>

						<div className="flex flex-col gap-2 mt-2">
							<button
								type="submit"
								className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow transition"
								disabled={saving}
							>
								{saving ? "Salvando..." : "Cadastrar"}
							</button>
							<button
								type="button"
								className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded shadow transition"
								onClick={() => router.push("/professionals")}
								disabled={saving}
							>
								Cancelar
							</button>
						</div>
						{error && <p className="text-red-600 text-sm mt-2">{error}</p>}
						{success && <p className="text-green-600 text-sm mt-2">{success}</p>}
					</form>
				</div>
			);
		}
