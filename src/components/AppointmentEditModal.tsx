import React, { useState } from "react";
import TailwindDatePicker from "@/components/TailwindDatePicker";
import { Dialog } from "@headlessui/react";

interface AppointmentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any;
  onSave: (data: any) => Promise<void>;
  canEditStatus: boolean;
  paymentMethods: string[];
}

export default function AppointmentEditModal({ isOpen, onClose, appointment, onSave, canEditStatus, paymentMethods }: AppointmentEditModalProps) {
  const [date, setDate] = useState<Date | null>(appointment ? new Date(appointment.startAt) : null);
  const [status, setStatus] = useState(appointment?.status || "");
  const [paymentMethod, setPaymentMethod] = useState(appointment?.payment?.method || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    } catch (err: any) {
      setError(err.message || "Erro ao salvar agendamento.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 flex items-center justify-center">
      <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-40" />
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md z-10">
        <Dialog.Title className="text-lg font-bold mb-4">Editar Agendamento</Dialog.Title>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Data e hora</label>
            <TailwindDatePicker value={date} onChange={setDate} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Forma de pagamento</label>
            <select
              className="p-2 h-[42px] border border-gray-300 rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
              required
            >
              <option value="">Selecione</option>
              {paymentMethods.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          {canEditStatus && (
            <div>
              <label className="block text-sm font-semibold mb-1">Status</label>
              <select
                className="p-2 h-[42px] border border-gray-300 rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={status}
                onChange={e => setStatus(e.target.value)}
                required
              >
                <option value="SCHEDULED">Agendado</option>
                <option value="COMPLETED">Concluído</option>
                <option value="CANCELLED">Cancelado</option>
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
      </div>
    </Dialog>
  );
}
