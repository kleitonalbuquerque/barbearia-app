"use client";
import { useEffect, useState } from "react";
import { useServiceTypes } from "@/hooks/useServiceTypes";
import { useAuth } from "@/contexts/AuthContext";
import TailwindDatePicker from "@/components/TailwindDatePicker";

import { useParams, useRouter } from "next/navigation";
import AgendamentosTable from "@/components/AgendamentosTable";
import AppointmentEditModal from "@/components/AppointmentEditModal";

interface Barber {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
}

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
}

interface Payment {
  id: string;
  method: string;
  amountCents: number;
  paidAt: string;
}

const PAYMENT_METHODS = ["CASH", "PIX", "CREDIT", "DEBIT"];

export default function BarbeiroDetalhePage() {
  const { fetchAuthed } = useAuth();
  const params = useParams();
  const router = useRouter();
  const barberId = params?.id as string;
  const [barber, setBarber] = useState<Barber | null>(null);
  const { serviceTypes } = useServiceTypes();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editAppointment, setEditAppointment] = useState<Appointment | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", cpf: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // Filtros
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [date, setDate] = useState<Date | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    if (!barberId) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/barbers/${barberId}`).then((res) => res.json()),
      fetch(`/api/appointments?barberId=${barberId}&page=1&pageSize=50&includeClient=true&includeServiceType=true`).then((res) => res.json()),
    ])
      .then(([barberData, appointmentsData]) => {
        setBarber(barberData.barber || null);
        setAppointments(appointmentsData.appointments || []);
        setForm({
          name: barberData.barber?.name || "",
          email: barberData.barber?.email || "",
          phone: barberData.barber?.phone || "",
          cpf: barberData.barber?.cpf || "",
        });
      })
      .finally(() => setLoading(false));
  }, [barberId]);

  function handleEdit() {
    setEditMode(true);
    setError("");
    setSuccess("");
  }

  function handleCancel() {
    setEditMode(false);
    if (barber) {
      setForm({
        name: barber.name,
        email: barber.email,
        phone: barber.phone,
        cpf: barber.cpf,
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
    const res = await fetchAuthed(`/api/barbers/${barberId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) {
      setSuccess("Dados atualizados com sucesso!");
      setBarber({ ...barber!, ...form });
      setEditMode(false);
    } else {
      setError(data.error || "Erro ao atualizar barbeiro.");
    }
  }

  async function handleDelete() {
    if (!confirm("Tem certeza que deseja excluir este barbeiro?")) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetchAuthed(`/api/barbers/${barberId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      setSaving(false);
      if (data.success) {
        setSuccess("Barbeiro excluído com sucesso!");
        setTimeout(() => router.push("/barbeiros"), 1200);
      } else {
        setError(data.error || "Erro ao excluir barbeiro.");
      }
    } catch (err) {
      setSaving(false);
      setError("Erro ao excluir barbeiro.");
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
    conteudo = <p>Carregando...</p>;
  } else if (barber) {
    conteudo = (
      <>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Barbeiro: {barber.name}</h1>
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
            <form onSubmit={handleSave} className="flex flex-col gap-3 max-w-md">
              <label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Nome</label>
              <input
                id="name"
                className="p-3 border-2 border-blue-500 focus:ring-2 focus:ring-blue-400 rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 font-bold"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                autoFocus
              />
              <label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Email</label>
              <input
                id="email"
                className="p-3 border border-gray-300 rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500"
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
              />
              <label htmlFor="phone" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Telefone</label>
              <input
                id="phone"
                className="p-3 border border-gray-300 rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
              <label htmlFor="cpf" className="text-sm font-semibold text-gray-700 dark:text-gray-200">CPF</label>
              <input
                id="cpf"
                className="p-3 border border-gray-300 rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500"
                name="cpf"
                value={form.cpf}
                onChange={handleChange}
              />
              <hr className="my-4 border-gray-300 dark:border-gray-700" />
              {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
              {success && <p className="text-green-600 text-sm mt-2">{success}</p>}
            </form>
          ) : (
            <>
              <strong>Email:</strong> {barber.email} <br />
              <strong>Telefone:</strong> {barber.phone} <br />
              <strong>CPF:</strong> {barber.cpf}
              <hr className="my-4 border-gray-300 dark:border-gray-700" />
            </>
          )}
        </section>
        <section className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h2 className="text-lg font-semibold text-white">Serviços realizados/cancelados</h2>
            <span className="text-sm text-gray-700 dark:text-gray-300 font-semibold">
              Serviços concluídos: {appointments.filter(a => a.status === 'COMPLETED' || a.status === 'CONCLUÍDO').length}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mb-4 items-end justify-between">
            <div className="flex flex-wrap gap-2 items-end">
              <div className="flex flex-col">
                <label htmlFor="statusFilter" className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">Filtrar por status</label>
                <select
                  id="statusFilter"
                  className="p-2 h-[42px] border border-gray-300 rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="SCHEDULED">Agendado</option>
                  <option value="CANCELED">Cancelado</option>
                  <option value="COMPLETED">Concluído</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label htmlFor="date" className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">Buscar por data</label>
                <TailwindDatePicker
                  id="date"
                  value={date}
                  onChange={setDate}
                  placeholder="Selecione a data"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="startDate" className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">Data início</label>
                <TailwindDatePicker
                  id="startDate"
                  value={startDate}
                  onChange={setStartDate}
                  placeholder="Data início"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="endDate" className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">Data fim</label>
                <TailwindDatePicker
                  id="endDate"
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="Data fim"
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
            context="barber"
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
                const res = await fetch(`/api/appointments?barberId=${barberId}&startAt=${startAt}&endAt=${endAt}`);
                const result = await res.json();
                if (result.appointments && result.appointments.some((appt: Appointment) => appt.id !== editAppointment.id)) {
                  throw new Error("Conflito de horário para o barbeiro neste período.");
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
                } = {
                  startAt: data.date ? data.date.toISOString() : editAppointment.startAt,
                  status: data.status,
                  serviceTypeId: data.serviceTypeId,
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
                setAppointments((prev) => prev.map((a) => {
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
                }));
                setEditAppointment(null);
              }
            }}
          />
          )}
        </section>
      </>
    );
  } else {
    conteudo = <p>Barbeiro não encontrado.</p>;
  }

  return (
    <div className="w-full px-2 sm:px-4 md:px-8 lg:px-16 xl:px-32 py-4 mx-auto">
      {conteudo}
    </div>
  );
}
