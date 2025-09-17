"use client";
import { useEffect, useState } from "react";
import { useServiceTypes } from "@/hooks/useServiceTypes";
import { useAuth } from "@/contexts/AuthContext";
import TailwindDatePicker from "@/components/TailwindDatePicker";

import { useParams, useRouter } from "next/navigation";
import AgendamentosTable from "@/components/AgendamentosTable";
import AppointmentEditModal from "@/components/AppointmentEditModal";



interface AppointmentItem {
  id: string;
  serviceTypeId: string;
  priceCentsSnapshot: number;
  durationMinutesSnapshot: number;
  serviceType?: { name: string };
}

interface Appointment {
  id: string;
  startAt: string;
  endAt: string;
  status: string;
  items: AppointmentItem[];
  payment?: Payment;
  client?: { name: string };
  professional?: { id: string; name: string };
}

interface Payment {
  id: string;
  method: string;
  amountCents: number;
  paidAt: string;
}

const PAYMENT_METHODS = ["CASH", "PIX", "CREDIT", "DEBIT"];

export default function ProfessionalDetalhePage() {
  const { fetchAuthed } = useAuth();
  const params = useParams();
  const router = useRouter();
  const professionalId = params?.id as string;
  const [professional, setProfessional] = useState<{ id: string; name: string; email: string; phone: string; cpf: string; cnpj?: string } | null>(null);
  const { serviceTypes } = useServiceTypes();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editAppointment, setEditAppointment] = useState<Appointment | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", cpf: "", cnpj: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // Filtros
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [date, setDate] = useState<Date | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    if (!professionalId) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/professionals/${professionalId}`).then((res) => res.json()),
      fetch(`/api/appointments?professionalId=${professionalId}&page=1&pageSize=50&includeClient=true&includeServiceType=true`).then((res) => res.json()),
    ])
      .then(([professionalData, appointmentsData]) => {
        // Inclui o campo professional em cada appointment
        const professionalObj = professionalData.professional ? { id: professionalData.professional.id, name: professionalData.professional.name } : undefined;
        const appointmentsWithProfessional = (appointmentsData.appointments || []).map((appt: Appointment) => ({
          ...appt,
          professional: professionalObj,
        }));
        setAppointments(appointmentsWithProfessional);
        setProfessional(professionalData.professional || null);
        setForm({
          name: professionalData.professional?.name || "",
          email: professionalData.professional?.email || "",
          phone: professionalData.professional?.phone || "",
          cpf: professionalData.professional?.cpf || "",
          cnpj: professionalData.professional?.cnpj || ""
        });
      })
      .finally(() => setLoading(false));
  }, [professionalId]);

  function handleEdit() {
    setEditMode(true);
    setError("");
    setSuccess("");
  }

  function handleCancel() {
    setEditMode(false);
    if (professional) {
      setForm({
        name: professional.name,
        email: professional.email,
        phone: professional.phone,
        cpf: professional.cpf,
        cnpj: professional.cnpj || ""
      });
    }
    setError("");
    setSuccess("");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
  const res = await fetchAuthed(`/api/professionals/${professionalId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) {
      setSuccess("Dados atualizados com sucesso!");
      setProfessional({ ...professional!, ...form });
      setEditMode(false);
    } else {
      setError(data.error || "Erro ao atualizar profissional.");
    }
  }

  async function handleDelete() {
  if (!confirm("Tem certeza que deseja excluir este profissional?")) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
  const res = await fetchAuthed(`/api/professionals/${professionalId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      setSaving(false);
      if (data.success) {
        setSuccess("Profissional excluído com sucesso!");
        setTimeout(() => router.push("/professionals"), 1200);
      } else {
        setError(data.error || "Erro ao excluir profissional.");
      }
    } catch {
      setSaving(false);
      setError("Erro ao excluir profissional.");
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Filtros locais (mock, depois pode ser server-side)
  const filteredAppointments = appointments.filter((a) => {
    let ok = true;
    if (statusFilter && a.status !== statusFilter) ok = false;
    if (date && a.startAt.slice(0, 10) !== date?.toISOString().slice(0, 10)) ok = false;
    if (startDate && a.startAt.slice(0, 10) < startDate.toISOString().slice(0, 10)) ok = false;
    if (endDate && a.startAt.slice(0, 10) > endDate.toISOString().slice(0, 10)) ok = false;
    return ok;
  });

  let conteudo;
  if (loading) {
    conteudo = (
      <div className="flex flex-col items-center justify-center py-12">
        <svg className="animate-spin h-8 w-8 text-white mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
        <p className="text-white text-lg font-semibold">Carregando...</p>
      </div>
    );
  } else if (professional) {
    conteudo = (
      <>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold brand-title">Profissional: {professional.name}</h1>
          <div className="flex gap-2">
            {editMode ? (
              <>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded shadow transition"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Salvando..." : "Salvar"}
                </button>
                <button
                  className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 font-semibold px-4 py-2 rounded shadow transition"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow transition"
                  onClick={handleEdit}
                >
                  Editar
                </button>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded shadow transition"
                  onClick={handleDelete}
                  disabled={saving}
                >
                  Excluir
                </button>
                <button
                  className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 font-semibold px-4 py-2 rounded shadow transition"
                  onClick={() => router.back()}
                >
                  Voltar
                </button>
              </>
            )}
          </div>
        </div>
        <section className="mb-8">
          {editMode ? (
            <form onSubmit={handleSave} className="flex flex-col gap-3 max-w-md rounded shadow p-6 border border-gray-200">
              <label htmlFor="name" className="text-sm font-semibold brand-title">Nome</label>
              <input
                id="name"
                className="p-3 border-2 border-pink-500 focus:ring-2 focus:ring-pink-400 rounded text-gray-900 bg-white placeholder-gray-500 font-bold"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                autoFocus
                style={{ background: '#fff' }}
              />
              <label htmlFor="email" className="text-sm font-semibold brand-title">Email</label>
              <input
                id="email"
                className="p-3 border border-gray-300 rounded text-gray-900 bg-white placeholder-gray-500"
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                style={{ background: '#fff' }}
              />
              <label htmlFor="phone" className="text-sm font-semibold brand-title">Telefone</label>
              <input
                id="phone"
                className="p-3 border border-gray-300 rounded text-gray-900 bg-white placeholder-gray-500"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                style={{ background: '#fff' }}
              />
              <label htmlFor="cpf" className="text-sm font-semibold brand-title">CPF</label>
              <input
                id="cpf"
                className="p-3 border border-gray-300 rounded text-gray-900 bg-white placeholder-gray-500"
                name="cpf"
                value={form.cpf}
                onChange={handleChange}
                style={{ background: '#fff' }}
              />
              <label htmlFor="cnpj" className="text-sm font-semibold brand-title">CNPJ</label>
              <input
                id="cnpj"
                className="p-3 border border-gray-300 rounded text-gray-900 bg-white placeholder-gray-500"
                name="cnpj"
                value={form.cnpj || ""}
                onChange={handleChange}
                style={{ background: '#fff' }}
                placeholder="CNPJ"
              />
              <hr className="my-4 border-gray-300" />
              {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
              {success && <p className="text-green-600 text-sm mt-2">{success}</p>}
            </form>
          ) : (
            <>
              <div className="mb-2">
                <span className="font-semibold text-white">Email:</span> <span className="text-white">{professional.email}</span>
              </div>
              <div className="mb-2">
                <span className="font-semibold text-white">Telefone:</span> <span className="text-white">{professional.phone}</span>
              </div>
              <div className="mb-2">
                <span className="font-semibold text-white">CPF:</span> <span className="text-white">{professional.cpf}</span>
              </div>
              <div className="mb-2">
                <span className="font-semibold text-white">CNPJ:</span> <span className="text-white">{professional.cnpj || "Não informado"}</span>
              </div>
              <hr className="my-4 border-gray-300 dark:border-gray-700" />
            </>
          )}
        </section>
        <section className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h2 className="text-lg font-semibold brand-title">Serviços realizados/cancelados</h2>
            <span className="text-sm font-semibold brand-title">
              Serviços concluídos: {appointments.filter(a => a.status === 'COMPLETED' || a.status === 'CONCLUÍDO').length}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mb-4 items-end justify-between">
            <div className="flex flex-wrap gap-2 items-end">
              <div className="flex flex-col">
                <label htmlFor="statusFilter" className="text-xs font-semibold brand-title mb-1">Filtrar por status</label>
                <select
                  id="statusFilter"
                  className="p-2 h-[42px] border border-gray-300 rounded text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  style={{ background: '#fff' }}
                >
                  <option value="">Todos</option>
                  <option value="SCHEDULED">Agendado</option>
                  <option value="CANCELED">Cancelado</option>
                  <option value="COMPLETED">Concluído</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label htmlFor="date" className="text-xs font-semibold brand-title mb-1">Buscar por data</label>
                <TailwindDatePicker
                  id="date"
                  value={date}
                  onChange={setDate}
                  placeholder="Selecione a data"
                  inputClassName="p-2 h-[42px] border border-gray-300 rounded text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="startDate" className="text-xs font-semibold brand-title mb-1">Data início</label>
                <TailwindDatePicker
                  id="startDate"
                  value={startDate}
                  onChange={setStartDate}
                  placeholder="Data início"
                  inputClassName="p-2 h-[42px] border border-gray-300 rounded text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="endDate" className="text-xs font-semibold brand-title mb-1">Data fim</label>
                <TailwindDatePicker
                  id="endDate"
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="Data fim"
                  inputClassName="p-2 h-[42px] border border-gray-300 rounded text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>
            </div>
            <div className="flex flex-col justify-end">
              <button
                type="button"
                className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 font-semibold px-4 py-2 rounded shadow transition"
                onClick={() => {
                  setStatusFilter("");
                  setDate(null);
                  setStartDate(null);
                  setEndDate(null);
                }}
              >
                Limpar filtros
              </button>
            </div>
          </div>
          <AgendamentosTable
            appointments={filteredAppointments}
            context="professional"
            onRowClick={(appt) => setEditAppointment(appt)}
          />
          {editAppointment && (
            <AppointmentEditModal
              isOpen={!!editAppointment}
              onClose={() => setEditAppointment(null)}
              appointment={editAppointment}
              canEditStatus={!["COMPLETED", "CANCELLED"].includes(editAppointment.status)}
              paymentMethods={PAYMENT_METHODS}
              onSave={async (data) => {
              // Validação de conflito de datas
              if (data.date && editAppointment) {
                const startAt = data.date.toISOString();
                const endAt = new Date(data.date.getTime() + (editAppointment.items?.[0]?.durationMinutesSnapshot || 30) * 60000).toISOString();
                // Checar conflito (ignorar o próprio agendamento)
                const res = await fetch(`/api/appointments?professionalId=${professionalId}&startAt=${startAt}&endAt=${endAt}`);
                const result = await res.json();
                if (result.appointments && result.appointments.some((appt: Appointment) => appt.id !== editAppointment.id)) {
                  throw new Error("Conflito de horário para o profissional neste período.");
                }
              }
              // Salvar edição
              if (editAppointment) {
                const body: {
                  startAt: string;
                  status: string;
                  payment?: {
                    update?: { method: string };
                    create?: { method: string; amountCents: number };
                  };
                  serviceTypeId?: string;
                  professionalId?: string;
                } = {
                  startAt: data.date ? data.date.toISOString() : editAppointment.startAt,
                  status: data.status,
                  serviceTypeId: data.serviceTypeId,
                  // professionalId não faz parte de AppointmentSaveData, removido
                };
                // Só envie payment se realmente for criar/alterar
                if (
                  (editAppointment.payment && data.paymentMethod && data.paymentMethod !== editAppointment.payment.method) ||
                  (!editAppointment.payment && data.paymentMethod)
                ) {
                  body.payment = editAppointment.payment && editAppointment.payment.id
                    ? { update: { method: data.paymentMethod } }
                    : { create: { method: data.paymentMethod, amountCents: 0 } };
                }
                const res = await fetch(`/api/appointments/${editAppointment.id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(body),
                });
                const result = await res.json();
                if (!result.success) throw new Error(result.message || "Erro ao salvar agendamento.");
                // Atualizar lista local
                setAppointments((prev) => {
                  // Se o barberId mudou, remove da lista local
                  // Se o profissional mudou, remove da lista local (não aplicável neste contexto, pois não há troca de profissional)
                  // Caso contrário, atualiza normalmente
                  return prev.map((a) => {
                    if (a.id !== editAppointment.id) return a;
                    let updatedPayment = a.payment;
                    if (a.payment && data.paymentMethod) {
                      updatedPayment = { ...a.payment, method: data.paymentMethod, id: a.payment.id };
                    }
                    // Atualiza também o serviço e preço localmente
                    let updatedItems = a.items;
                    if (data.serviceTypeId) {
                      const st = serviceTypes.find(s => s.id === data.serviceTypeId);
                      updatedItems = [{
                        ...a.items[0],
                        serviceTypeId: data.serviceTypeId,
                        priceCentsSnapshot: st ? st.priceCents : a.items[0].priceCentsSnapshot,
                        serviceType: st ? { name: st.name } : a.items[0].serviceType,
                      }];
                    }
                    return {
                      ...a,
                      startAt: data.date ? data.date.toISOString() : a.startAt,
                      payment: updatedPayment,
                      status: data.status || a.status,
                      items: updatedItems,
                    };
                  });
                });
                setEditAppointment(null);
              }
            }}
          />
          )}
        </section>
      </>
    );
  } else {
  conteudo = <p>Profissional não encontrado.</p>;
  }

  return (
    <div className="w-full px-2 sm:px-4 md:px-8 lg:px-16 xl:px-32 py-4 mx-auto">
      {conteudo}
    </div>
  );
}
