
import React, { useState, useEffect } from "react";
import { useServiceTypes, ServiceType } from "@/hooks/useServiceTypes";
import { useProfessionals } from "@/hooks/useProfessionals";
import TailwindDatePicker from "@/components/TailwindDatePicker";
import { Dialog, DialogPanel, DialogTitle, DialogBackdrop } from "@headlessui/react";
import type { Appointment } from "./AgendamentosTable";

interface AppointmentSaveData {
  date: Date | null;
  status: string;
  paymentMethod: string;
  serviceTypeId: string;
  professionalId: string;
}
interface AppointmentEditModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly appointment: Appointment;
  readonly onSave: (data: AppointmentSaveData) => Promise<void>;
  readonly canEditStatus: boolean;
  readonly paymentMethods: readonly string[];
}

export default function AppointmentEditModal({ isOpen, onClose, appointment, onSave, canEditStatus, paymentMethods }: AppointmentEditModalProps) {
  const [date, setDate] = useState<Date | null>(null);
  const [status, setStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [serviceTypeId, setServiceTypeId] = useState("");
  const [servicePrice, setServicePrice] = useState(0);
  const [professionalId, setProfessionalId] = useState("");
  const { professionals } = useProfessionals();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { serviceTypes } = useServiceTypes();

  useEffect(() => {
    if (!appointment) return;
    setDate(appointment.startAt ? new Date(appointment.startAt) : null);
    setStatus(appointment.status || "");
    setPaymentMethod(appointment.payment?.method ?? "");
    setServiceTypeId(appointment.items?.[0]?.serviceTypeId || "");
    if (appointment.items?.[0]?.priceCentsSnapshot) {
      setServicePrice(appointment.items[0].priceCentsSnapshot / 100);
    } else if (appointment.items?.[0]?.serviceTypeId && serviceTypes.length) {
      const st = serviceTypes.find(s => s.id === appointment.items[0].serviceTypeId);
      setServicePrice(st ? st.priceCents / 100 : 0);
    }
  }, [appointment, isOpen, serviceTypes]);

  // Sincroniza professionalId após professionals carregar
  useEffect(() => {
    if (!appointment || !professionals.length) return;
    // Debug: log valores atuais
    console.log("[DEBUG] appointment.professional:", appointment.professional);
    console.log("[DEBUG] professionals:", professionals);
    if (appointment.professional?.id) {
      setProfessionalId(appointment.professional.id);
      console.log("[DEBUG] setProfessionalId pelo id:", appointment.professional.id);
    } else if (appointment.professional?.name) {
      const found = professionals.find(p => p.name === appointment.professional?.name);
      setProfessionalId(found?.id || "");
      console.log("[DEBUG] setProfessionalId pelo nome:", found?.id || "");
    }
  }, [appointment, professionals, isOpen]);

  useEffect(() => {
    if (status === "CANCELLED" && paymentMethod) {
      setPaymentMethod("");
    }
  }, [status, paymentMethod]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await onSave({
        date,
        status,
        paymentMethod,
        serviceTypeId,
        professionalId,
      });
      setSuccess("Agendamento atualizado com sucesso!");
      setTimeout(() => {
        setSuccess("");
        onClose();
      }, 1200);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Erro ao salvar agendamento.");
      } else {
        setError("Erro ao salvar agendamento.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0">
  <DialogBackdrop className="fixed inset-0 bg-black/60" />
      <div className="fixed inset-0 flex items-center justify-center">
        <DialogPanel className="relative bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md z-10">
          <DialogTitle className="text-lg font-bold mb-4">Editar Agendamento</DialogTitle>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            {/* Profissional editável */}
            <div>
              <label htmlFor="edit-professional" className="block text-sm font-semibold mb-1">Profissional</label>
              <select
                id="edit-professional"
                className="p-2 border rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                value={professionalId}
                onChange={e => setProfessionalId(e.target.value)}
                required
              >
                <option value="">Selecione</option>
                {professionals.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            {/* Nome do cliente (readonly) */}
            {appointment?.client?.name && (
              <div>
                <label htmlFor="edit-client" className="block text-sm font-semibold mb-1">Cliente</label>
                <input
                  id="edit-client"
                  type="text"
                  value={appointment.client.name}
                  readOnly
                  disabled
                  className="p-2 border rounded w-full bg-gray-100 text-gray-900 dark:text-gray-100 dark:bg-gray-800 cursor-not-allowed"
                />
              </div>
            )}
            {/* Data e hora */}
            <div>
              <label htmlFor="edit-date" className="block text-sm font-semibold mb-1">Data e hora</label>
              <TailwindDatePicker id="edit-date" value={date} onChange={setDate} placeholder="dd/mm/yyyy" />
            </div>
            {/* Serviço e preço editáveis */}
            <div>
              <label htmlFor="edit-service" className="block text-sm font-semibold mb-1">Serviço</label>
              <select
                id="edit-service"
                className="p-2 border rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                value={serviceTypeId}
                onChange={e => {
                  setServiceTypeId(e.target.value);
                  const st = serviceTypes.find(s => s.id === e.target.value);
                  setServicePrice(st ? st.priceCents / 100 : 0);
                }}
                required
                disabled={status === "CANCELED"}
              >
                <option value="">Selecione</option>
                {serviceTypes.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="edit-price" className="block text-sm font-semibold mb-1">Preço</label>
              <input
                id="edit-price"
                type="text"
                value={servicePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                readOnly
                disabled
                className="p-2 border rounded w-full bg-gray-100 text-gray-900 dark:text-gray-100 dark:bg-gray-800 cursor-not-allowed"
              />
            </div>
            {/* Forma de pagamento */}
            <div>
              <label htmlFor="edit-payment-method" className="block text-sm font-semibold mb-1">Forma de pagamento</label>
                <select
                  id="edit-payment-method"
                  className="p-2 h-[42px] border border-gray-300 rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={status === "CANCELED" ? "" : paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  required={status === "COMPLETED"}
                  disabled={status === "CANCELED"}
                >
                <option value="">Selecione</option>
                {paymentMethods.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            {canEditStatus && (
              <div>
                <label htmlFor="edit-status" className="block text-sm font-semibold mb-1">Status</label>
                <select
                  id="edit-status"
                  className="p-2 h-[42px] border border-gray-300 rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={status === "CANCELLED" ? "CANCELED" : status}
                  onChange={e => {
                    const val = e.target.value === "CANCELLED" ? "CANCELED" : e.target.value;
                    setStatus(val);
                  }}
                  required
                >
                  <option value="SCHEDULED">Agendado</option>
                  <option value="COMPLETED">Concluído</option>
                  <option value="CANCELED">Cancelado</option>
                </select>
              </div>
            )}
            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            {success && <p className="text-green-600 text-sm mt-2">{success}</p>}
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow transition"
                disabled={saving}
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
              <button
                type="button"
                className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 font-semibold px-4 py-2 rounded shadow transition"
                onClick={onClose}
                disabled={saving}
              >
                Cancelar
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
