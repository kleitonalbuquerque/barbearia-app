"use client";
import React from "react";

interface AgendamentoFiltersValues {
  date: string;
  client: string;
  professional: string;
  service: string;
  status: string;
}

interface AgendamentoFiltersProps {
  filters: AgendamentoFiltersValues;
  onChange: (filters: AgendamentoFiltersValues) => void;
}

export default function AgendamentoFilters({ filters, onChange }: AgendamentoFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-4 items-end">
      <div>
        <label className="block text-xs font-semibold mb-1">Data</label>
        <input type="date" value={filters.date} onChange={e => onChange({ ...filters, date: e.target.value })} className="p-2 border rounded" />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1">Cliente</label>
        <input type="text" placeholder="Nome do cliente" value={filters.client} onChange={e => onChange({ ...filters, client: e.target.value })} className="p-2 border rounded" />
      </div>
      <div>
  <label className="block text-xs font-semibold mb-1">Profissional</label>
  <input type="text" placeholder="Nome do profissional" value={filters.professional} onChange={e => onChange({ ...filters, professional: e.target.value })} className="p-2 border rounded" />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1">Serviço</label>
        <input type="text" placeholder="Tipo de serviço" value={filters.service} onChange={e => onChange({ ...filters, service: e.target.value })} className="p-2 border rounded" />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1">Status</label>
        <select value={filters.status} onChange={e => onChange({ ...filters, status: e.target.value })} className="p-2 border rounded w-full min-w-[180px]">
          <option value="">Todos</option>
          <option value="SCHEDULED">Agendado</option>
          <option value="COMPLETED">Concluído</option>
          <option value="CANCELED">Cancelado</option>
        </select>
      </div>
    </div>
  );
}
