"use client";
import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUserTie, faScissors } from '@fortawesome/free-solid-svg-icons';
import './AgendamentoModal.css';

interface ServiceType {
  id: string;
  name: string;
  priceCents: number;
}
interface Barber {
  id: string;
  name: string;
}
interface Client {
  id: string;
  name: string;
}

interface Appointment {
  id: string;
  startAt: string;
  endAt: string;
  status: string;
  barber: Barber | null;
  client: Client | null;
  items: { serviceType: ServiceType }[];
}

interface AgendamentoModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (appointment: Appointment) => void;
  serviceTypes: ServiceType[];
  barbers: Barber[];
  clients: Client[];
}

export default function AgendamentoModal({ open, onClose, onCreated, serviceTypes, barbers, clients }: Readonly<AgendamentoModalProps>) {
  const [form, setForm] = useState({
    date: "",
    time: "",
    barberId: "",
    clientId: "",
    serviceTypeId: ""
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      // Monta startAt e endAt (duração padrão 1h)
      const startAt = new Date(`${form.date}T${form.time}`);
      const endAt = new Date(startAt.getTime() + 60 * 60 * 1000);
      // Busca o valor correto do serviço selecionado
      const servico = serviceTypes.find(s => s.id === form.serviceTypeId);
      const priceCentsSnapshot = servico ? servico.priceCents : 0;
      const durationMinutesSnapshot = 60; // pode ser ajustado se necessário
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barberId: form.barberId,
          clientId: form.clientId,
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
          items: [{ serviceTypeId: form.serviceTypeId, priceCentsSnapshot, durationMinutesSnapshot }]
        })
      });
      const data = await res.json();
      setSaving(false);
      if (data.success) {
        onCreated(data.appointment);
        onClose();
      } else {
        setError(data.message || "Erro ao agendar");
      }
    } catch {
      setSaving(false);
      setError("Erro ao agendar");
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay escuro com opacidade */}
      <div className="absolute inset-0 bg-black" style={{ opacity: 0.80 }} />
      <div className="relative z-10 bg-white dark:bg-gray-900 rounded shadow-lg p-6 w-full max-w-md">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-3xl font-bold w-10 h-10 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={onClose}
          aria-label="Fechar modal"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4">Novo Agendamento</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label htmlFor="agendamento-date">Data</label>
          <input id="agendamento-date" type="date" name="date" value={form.date} onChange={handleChange} required className="p-2 border rounded bg-gray-800 text-white placeholder-gray-300 w-full date-white" />
          <label htmlFor="agendamento-time">Horário</label>
          <input id="agendamento-time" type="time" name="time" value={form.time} onChange={handleChange} required className="p-2 border rounded bg-gray-800 text-white placeholder-gray-300 w-full time-white" />
          <label htmlFor="agendamento-barber">Barbeiro</label>
          <div className="relative flex items-center">
            <select id="agendamento-barber" name="barberId" value={form.barberId} onChange={handleChange} required className="p-2 border rounded bg-gray-800 text-white w-full appearance-none pr-10" style={{ backgroundImage: 'none' }}>
              <option value="">Selecione</option>
              {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <FontAwesomeIcon icon={faUserTie} className="absolute right-3 text-white pointer-events-none z-10" />
          </div>
          <label htmlFor="agendamento-client">Cliente</label>
          <div className="relative flex items-center">
            <select id="agendamento-client" name="clientId" value={form.clientId} onChange={handleChange} required className="p-2 border rounded bg-gray-800 text-white w-full appearance-none pr-10" style={{ backgroundImage: 'none' }}>
              <option value="">Selecione</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <FontAwesomeIcon icon={faUser} className="absolute right-3 text-white pointer-events-none z-10" />
          </div>
          <label htmlFor="serviceTypeId">Tipo de Serviço</label>
          <div className="relative flex items-center">
            <select
              id="serviceTypeId"
              name="serviceTypeId"
              value={form.serviceTypeId}
              onChange={handleChange}
              required
              className="p-2 border rounded bg-gray-800 text-white w-full appearance-none pr-10 flex-1"
              style={{ minWidth: 0, backgroundImage: 'none' }}
            >
              <option value="">Selecione</option>
              {serviceTypes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <FontAwesomeIcon icon={faScissors} className="absolute right-3 text-white pointer-events-none z-10" />
          </div>
          {/* Exibe valor do serviço selecionado */}
          {form.serviceTypeId && (
            <span className="block text-white text-sm bg-gray-700 rounded px-2 py-1 mt-2">
              {(() => {
                const servico = serviceTypes.find(s => s.id === form.serviceTypeId);
                const preco = servico && typeof servico.priceCents === 'number' ? servico.priceCents : undefined;
                return servico && preco !== undefined
                  ? `R$ ${(preco / 100).toFixed(2)}`
                  : null;
              })()}
            </span>
          )}
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded" disabled={saving}>
            {saving ? "Agendando..." : "Agendar"}
          </button>
        </form>
      </div>
    </div>
  );
}
