
import React, { useState } from "react";
import TailwindDatePicker from "@/components/TailwindDatePicker";
import { Dialog, DialogPanel, DialogTitle, DialogBackdrop } from "@headlessui/react";
import type { Appointment } from "./AgendamentosTable";

interface AppointmentSaveData {
  date: Date | null;
  status: string;
  paymentMethod: string;
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
  const [paymentMethod, setPaymentMethod] = useState("");
  const [serviceTypeName, setServiceTypeName] = useState("");
  const [servicePrice, setServicePrice] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Sempre sincronizar os states com o appointment ao abrir o modal ou mudar o appointment
  React.useEffect(() => {
    if (appointment) {
      setDate(appointment.startAt ? new Date(appointment.startAt) : null);
      setStatus(appointment.status || "");
      setPaymentMethod(appointment.payment?.method || "");
      setServiceTypeName(appointment.items?.[0]?.serviceType?.name || "");
      setServicePrice(appointment.items?.[0]?.priceCentsSnapshot ? appointment.items[0].priceCentsSnapshot / 100 : 0);
    }
  }, [appointment, isOpen]);

  // Limpa método de pagamento se status for CANCELLED
  React.useEffect(() => {
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
      <DialogBackdrop className="fixed inset-0 bg-black bg-opacity-40" />
      <div className="fixed inset-0 flex items-center justify-center">
        <DialogPanel className="relative bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md z-10">
          <DialogTitle className="text-lg font-bold mb-4">Editar Agendamento</DialogTitle>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
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
            {/* Serviço e preço (estrutura inicial, select será implementado em seguida) */}
            <div>
              <label htmlFor="edit-service" className="block text-sm font-semibold mb-1">Serviço</label>
              <input
                id="edit-service"
                type="text"
                value={serviceTypeName}
                readOnly
                disabled
                className="p-2 border rounded w-full bg-gray-100 text-gray-900 dark:text-gray-100 dark:bg-gray-800 cursor-not-allowed"
              />
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
                  required={status !== "CANCELED"}
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
