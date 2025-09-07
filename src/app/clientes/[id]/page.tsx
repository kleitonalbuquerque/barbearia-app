"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AgendamentosTable from "@/components/AgendamentosTable";

interface Client {
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
  barber?: { name: string };
}

interface Payment {
  id: string;
  method: string;
  amountCents: number;
  paidAt: string;
}

export default function ClienteDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params?.id as string;
  const [client, setClient] = useState<Client | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/clients/${clientId}`).then((res) => res.json()),
      fetch(`/api/appointments?clientId=${clientId}&page=1&pageSize=50&includeBarber=true&includeServiceType=true`).then((res) => res.json()),
    ])
      .then(([clientData, appointmentsData]) => {
        setClient(clientData.client || null);
        setAppointments(appointmentsData.appointments || []);
      })
      .finally(() => setLoading(false));
  }, [clientId]);

  let conteudo;
  if (loading) {
    conteudo = <p>Carregando...</p>;
  } else if (client) {
    conteudo = (
      <>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Cliente: {client.name}</h1>
          <button
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 font-semibold px-4 py-2 rounded shadow transition"
            onClick={() => router.back()}
          >
            Voltar
          </button>
        </div>
        <section className="mb-8">
          <strong>Email:</strong> {client.email} <br />
          <strong>Telefone:</strong> {client.phone} <br />
          <strong>CPF:</strong> {client.cpf}
        </section>
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-white">Serviços realizados/cancelados</h2>
          <AgendamentosTable appointments={appointments} />
        </section>
      </>
    );
  } else {
    conteudo = <p>Cliente não encontrado.</p>;
  }

  return (
    <div className="w-full px-2 sm:px-4 md:px-8 lg:px-16 xl:px-32 py-4 mx-auto">
      {conteudo}
    </div>
  );
}
