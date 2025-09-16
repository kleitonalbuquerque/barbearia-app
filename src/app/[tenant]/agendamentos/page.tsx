
"use client";
import React, { useEffect, useState } from "react";
import AgendamentosTable from "@/components/AgendamentosTable";
import { useAuth } from "@/contexts/AuthContext";
import AgendamentoModal from "@/components/agendamentos/AgendamentoModal";

interface Appointment {
  id: string;
  startAt: string;
  endAt: string;
  status: string;
  professional: { id: string; name: string } | null;
  client: { id: string; name: string } | null;
  items: { serviceType: { id: string; name: string; priceCents: number } }[];
}
interface Professional { id: string; name: string; }
interface Client { id: string; name: string; }
interface ServiceType { id: string; name: string; priceCents: number; }

export default function AgendamentosPage() {
  const { fetchAuthed, loading: authLoading, isAuthenticated } = useAuth();
  // Extrai o tenant da URL: /[tenant]/agendamentos
  const tenant = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : '';
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ search: "", date: "", status: "" });
  const [showModal, setShowModal] = useState(false);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  // Paginação
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Carregar professionals, clients, services para selects
  useEffect(() => {
    if (!tenant) return;
    fetch(`/api/professionals?tenantId=${tenant}`).then(r => r.json()).then(d => d.success && setProfessionals(d.professionals || d.data || d)).catch(() => {});
    fetch(`/api/clients?tenantId=${tenant}`).then(r => r.json()).then(d => d.success && setClients(d.clients || d.data || d)).catch(() => {});
    fetch(`/api/services?tenantId=${tenant}`).then(r => r.json()).then(d => d.success && setServiceTypes(d.services || d.data || d)).catch(() => {});
  }, [tenant]);

  // Monta query string dos filtros
  const buildQuery = React.useCallback(() => {
    const params = [];
    if (filters.search) params.push(`q=${encodeURIComponent(filters.search)}`);
    if (filters.date) params.push(`startAt=${filters.date}`);
    if (filters.status) params.push(`status=${filters.status}`);
    params.push("includeProfessional=true", "includeClient=true");
    params.push(`page=${page}`);
    params.push(`pageSize=${pageSize}`);
    if (tenant) params.push(`tenantId=${tenant}`);
    return params.length ? "?" + params.join("&") : "";
  }, [filters, page, pageSize, tenant]);

  // Buscar agendamentos com filtros
  const fetchAppointments = React.useCallback(() => {
    setLoading(true);
    setError("");
    const fetchFn = isAuthenticated ? fetchAuthed : fetch;
    fetchFn(`/api/appointments${buildQuery()}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAppointments(data.appointments);
          setTotal(data.total || 0);
        } else setError(data.message || "Erro ao carregar agendamentos");
      })
      .catch(() => setError("Erro ao carregar agendamentos"))
      .finally(() => setLoading(false));
  }, [fetchAuthed, buildQuery, isAuthenticated]);


  // Sempre carrega agendamentos ao abrir a tela e ao mudar filtros, mas só após autenticação
  useEffect(() => {
    if (!authLoading) fetchAppointments();
  }, [authLoading, fetchAppointments]);

  // Resetar para página 1 ao mudar filtros
  useEffect(() => {
    setPage(1);
  }, [filters]);

  function handleCreated(appointment: Appointment) {
    setAppointments(a => [appointment, ...a]);
  }

  // Se não autenticado e não está carregando, mostra mensagem de login obrigatório
  if (!authLoading && !isAuthenticated) {
    return <div className="p-8 text-center text-red-600 font-bold">Você precisa estar logado para acessar esta página.</div>;
  }

  let content;
  if (authLoading || loading) {
    content = <div className="p-8 text-center text-gray-300">Carregando...</div>;
  } else if (error) {
    content = <div className="p-8 text-center text-red-600">{error}</div>;
  } else {
    // Adaptar os dados para o formato esperado por AgendamentosTable
    const appointmentsAdapted = appointments.map(a => ({
      ...a,
      professional: a.professional || undefined,
      client: a.client || undefined,
      items: a.items.map((i, idx) => ({
        id: i.serviceType?.id || String(idx),
        serviceTypeId: i.serviceType?.id || String(idx),
        priceCentsSnapshot: i.serviceType?.priceCents || 0,
        durationMinutesSnapshot: 0,
        serviceType: i.serviceType ? { name: i.serviceType.name } : undefined,
      })),
    }));
    content = (
      <AgendamentosTable appointments={appointmentsAdapted} />
    );
  }

  return (
    <div className="w-full px-2 sm:px-4 md:px-8 lg:px-16 xl:px-32 py-4 mx-auto">
      <h1 className="text-2xl font-bold mb-6 brand-title">Agendamentos</h1>
      <div className="flex flex-col md:flex-row md:items-end gap-2 mb-6">
        <input
          className="flex-1 p-3 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-gray-900 min-w-[200px]"
          placeholder="Buscar por cliente, profissional, serviço..."
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
      {/* Paginação */}
      <div className="flex items-center justify-between mt-4">
        <div>
          <span style={{ color: '#000' }}>Página {page} de {Math.max(1, Math.ceil(total / pageSize))}</span>
        </div>
        <div className="flex gap-2 items-center">
          <button
            className="px-3 py-1 rounded font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:text-gray-200 transition"
            onClick={() => setPage(1)}
            disabled={page === 1}
          >Início</button>
          <button
            className="px-3 py-1 rounded font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:text-gray-200 transition"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >Anterior</button>
          <button
            className="px-3 py-1 rounded font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:text-gray-200 transition"
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(total / pageSize)}
          >Próxima</button>
          <button
            className="px-3 py-1 rounded font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:text-gray-200 transition"
            onClick={() => setPage(Math.max(1, Math.ceil(total / pageSize)))}
            disabled={page >= Math.ceil(total / pageSize)}
          >Última</button>
          <select
            className="ml-2 p-1 border rounded bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            {[5, 10, 20, 50].map(size => (
              <option key={size} value={size} className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100">{size} por página</option>
            ))}
          </select>
        </div>
      </div>
      <AgendamentoModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreated={handleCreated}
        serviceTypes={serviceTypes}
        professionals={professionals}
        clients={clients}
      />
    </div>
  );
}
