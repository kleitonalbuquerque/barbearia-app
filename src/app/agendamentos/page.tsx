
"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";


import AgendamentoFilters from "@/components/agendamentos/AgendamentoFilters";
import AgendamentoModal from "@/components/agendamentos/AgendamentoModal";

interface Appointment {
  id: string;
  startAt: string;
  endAt: string;
  status: string;
  barber: { id: string; name: string } | null;
  client: { id: string; name: string } | null;
  items: { serviceType: { id: string; name: string; priceCents: number } }[];
}
interface Barber { id: string; name: string; }
interface Client { id: string; name: string; }
interface ServiceType { id: string; name: string; }
export default function AgendamentosPage() {
  const { fetchAuthed, loading: authLoading, isAuthenticated } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ search: "", date: "", status: "" });
  const [showModal, setShowModal] = useState(false);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);

  // Carregar barbers, clients, services para selects
  useEffect(() => {
    fetch("/api/barbers").then(r => r.json()).then(d => d.success && setBarbers(d.barbers || d.data || d)).catch(() => {});
    fetch("/api/clients").then(r => r.json()).then(d => d.success && setClients(d.clients || d.data || d)).catch(() => {});
    fetch("/api/services").then(r => r.json()).then(d => d.success && setServiceTypes(d.services || d.data || d)).catch(() => {});
  }, []);

  // Monta query string dos filtros
  const buildQuery = React.useCallback(() => {
    const params = [];
    if (filters.search) params.push(`q=${encodeURIComponent(filters.search)}`);
    if (filters.date) params.push(`startAt=${filters.date}`);
    if (filters.status) params.push(`status=${filters.status}`);
    params.push("includeBarber=true", "includeClient=true", "pageSize=50");
    return params.length ? "?" + params.join("&") : "";
  }, [filters]);

  // Buscar agendamentos com filtros
  const fetchAppointments = React.useCallback(() => {
    setLoading(true);
    setError("");
    const fetchFn = isAuthenticated ? fetchAuthed : fetch;
    fetchFn(`/api/appointments${buildQuery()}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setAppointments(data.appointments);
        else setError(data.message || "Erro ao carregar agendamentos");
      })
      .catch(() => setError("Erro ao carregar agendamentos"))
      .finally(() => setLoading(false));
  }, [fetchAuthed, buildQuery, isAuthenticated]);

  // Sempre carrega agendamentos ao abrir a tela e ao mudar filtros, mas só após autenticação
  useEffect(() => {
    if (!authLoading) fetchAppointments();
  }, [authLoading, fetchAppointments]);

  function handleCreated(appointment: Appointment) {
    setAppointments(a => [appointment, ...a]);
  }

  let content;
  if (authLoading || loading) {
    content = <div className="p-8 text-center">Carregando...</div>;
  } else if (error) {
    content = <div className="p-8 text-center text-red-600">{error}</div>;
  } else {
    content = (
      <div className="overflow-x-auto w-full">
        <table className="min-w-full bg-white dark:bg-gray-900 rounded shadow">
          <thead>
            <tr>
              <th className="p-3 text-left">Data</th>
              <th className="p-3 text-left">Hora</th>
              <th className="p-3 text-left">Barbeiro</th>
              <th className="p-3 text-left">Cliente</th>
              <th className="p-3 text-left">Serviço</th>
              <th className="p-3 text-left">Preço</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">Nenhum agendamento encontrado.</td>
              </tr>
            ) : appointments.map((a) => {
              const data = new Date(a.startAt);
              const dataStr = data.toLocaleDateString("pt-BR");
              const horaStr = data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
              const servico = a.items.map(i => i.serviceType.name).join(", ");
              const preco = a.items.reduce((acc, i) => acc + (i.serviceType.priceCents || 0), 0) / 100;
              let statusLabel = a.status;
              if (a.status === "SCHEDULED") statusLabel = "Agendado";
              else if (a.status === "COMPLETED") statusLabel = "Concluído";
              else if (a.status === "CANCELED") statusLabel = "Cancelado";
              return (
                <tr key={a.id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="p-3">{dataStr}</td>
                  <td className="p-3">{horaStr}</td>
                  <td className="p-3">{a.barber?.name || "-"}</td>
                  <td className="p-3">{a.client?.name || "-"}</td>
                  <td className="p-3">{servico}</td>
                  <td className="p-3">R$ {preco.toFixed(2)}</td>
                  <td className="p-3">{statusLabel}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="w-full px-2 sm:px-4 md:px-8 lg:px-16 xl:px-32 py-4 mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-white">Agendamentos</h1>
      <div className="flex flex-col md:flex-row md:items-end gap-2 mb-6">
        <input
          className="flex-1 p-3 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-gray-900 min-w-[200px]"
          placeholder="Buscar por cliente, barbeiro, serviço..."
          value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
        />
        <input
          type="date"
          className="p-3 border border-gray-300 rounded text-gray-900 bg-gray-50 min-w-[150px]"
          value={filters.date}
          onChange={e => setFilters(f => ({ ...f, date: e.target.value }))}
        />
        <select
          value={filters.status}
          onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          className="p-3 border border-gray-300 rounded text-gray-900 bg-gray-50 min-w-[150px] w-full md:w-auto"
        >
          <option value="">Todos</option>
          <option value="SCHEDULED">Agendado</option>
          <option value="COMPLETED">Concluído</option>
          <option value="CANCELED">Cancelado</option>
        </select>
        <button
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded shadow transition w-full md:w-auto"
          onClick={() => setFilters({ search: "", date: "", status: "" })}
        >
          Limpar filtros
        </button>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow transition w-full md:w-auto" onClick={() => setShowModal(true)}>
          Agendar
        </button>
      </div>
      {content}
      <AgendamentoModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreated={handleCreated}
        serviceTypes={serviceTypes}
        barbers={barbers}
        clients={clients}
      />
    </div>
  );
}
