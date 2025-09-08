"use client";
import React, { useState } from "react";

interface ServiceType {
  id: string;
  name: string;
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

export default function AgendamentoModal({ open, onClose, onCreated, serviceTypes, barbers, clients }: AgendamentoModalProps) {
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
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barberId: form.barberId,
          clientId: form.clientId,
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
          items: [{ serviceTypeId: form.serviceTypeId, priceCentsSnapshot: 0, durationMinutesSnapshot: 60 }]
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-900 rounded shadow-lg p-6 w-full max-w-md relative">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-800" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">Novo Agendamento</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label>Data</label>
          <input type="date" name="date" value={form.date} onChange={handleChange} required className="p-2 border rounded" />
          <label>Horário</label>
          <input type="time" name="time" value={form.time} onChange={handleChange} required className="p-2 border rounded" />
          <label>Barbeiro</label>
          <select name="barberId" value={form.barberId} onChange={handleChange} required className="p-2 border rounded">
            <option value="">Selecione</option>
            {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <label>Cliente</label>
          <select name="clientId" value={form.clientId} onChange={handleChange} required className="p-2 border rounded">
            <option value="">Selecione</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <label>Tipo de Serviço</label>
          <select name="serviceTypeId" value={form.serviceTypeId} onChange={handleChange} required className="p-2 border rounded">
            <option value="">Selecione</option>
            {serviceTypes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded" disabled={saving}>
            {saving ? "Agendando..." : "Agendar"}
          </button>
        </form>
      </div>
    </div>
  );
}
