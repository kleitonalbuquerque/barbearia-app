"use client";
function traduzirStatus(status: string) {
  switch (status) {
    case "SCHEDULED": return "AGENDADO";
    case "COMPLETED": return "CONCLUÍDO";
    case "CANCELED": return "CANCELADO";
    default: return status;
  }
}
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Spinner from "@/components/Spinner";

interface Appointment {
  id: string;
  startAt: string;
  endAt: string;
  status: string;
  items: { serviceType?: { name: string }; priceCentsSnapshot: number }[];
  payment?: { method: string; amountCents: number; paidAt: string };
  professional?: { id: string; name: string };
  client?: { id: string; name: string };
}

export default function AgendamentoDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/appointments/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setAppointment(data.appointment);
        else setError(data.error || "Agendamento não encontrado.");
      })
      .catch(() => setError("Erro ao carregar agendamento."))
      .finally(() => setLoading(false));
  }, [id]);

  let conteudo;
  if (loading) {
    conteudo = (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  } else if (appointment) {
    conteudo = (
      <>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold brand-title">Agendamento: {appointment.id}</h1>
          <button
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 font-semibold px-4 py-2 rounded shadow transition"
            onClick={() => router.back()}
          >Voltar</button>
        </div>
        <section className="mb-8">
          <div className="mb-2">
            <span className="font-semibold text-white">Cliente:</span> <span className="text-white font-normal drop-shadow-lg">{appointment.client?.name || '-'}</span>
          </div>
          <div className="mb-2">
            <span className="font-semibold text-white">Profissional:</span> <span className="text-white font-normal drop-shadow-lg">{appointment.professional?.name || '-'}</span>
          </div>
          <div className="mb-2">
            <span className="font-semibold text-white">Data:</span> <span className="text-white font-normal drop-shadow-lg">{new Date(appointment.startAt).toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="mb-2">
            <span className="font-semibold text-white">Hora:</span> <span className="text-white font-normal drop-shadow-lg">{new Date(appointment.startAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="mb-2">
            <span className="font-semibold text-white">Serviço(s):</span> <span className="text-white font-normal drop-shadow-lg">{appointment.items.map(i => i.serviceType?.name).join(', ')}</span>
          </div>
          <div className="mb-2">
            <span className="font-semibold text-white">Valor:</span> <span className="text-white font-normal drop-shadow-lg">{appointment.items.map(i => (i.priceCentsSnapshot / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })).join(', ')}</span>
          </div>
          <div className="mb-2">
            <span className="font-semibold text-white">Status:</span> <span className="font-bold text-blue-700 dark:text-blue-400 font-normal drop-shadow-lg">{traduzirStatus(appointment.status)}</span>
          </div>
          {appointment.payment && (
            <div className="mb-2">
              <span className="font-semibold text-white">Pagamento:</span> <span className="text-white font-normal drop-shadow-lg">{appointment.payment.method} - {appointment.payment.amountCents ? (appointment.payment.amountCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : ''}</span>
            </div>
          )}
          <hr className="my-4 border-gray-300 dark:border-gray-700" />
        </section>
      </>
    );
  } else {
    conteudo = <div className="p-8 text-center text-red-600 font-bold">{error || "Agendamento não encontrado."}</div>;
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      {conteudo}
    </main>
  );
}

