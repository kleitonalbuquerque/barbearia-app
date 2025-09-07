"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
function getStatusColor(status: string) {
  if (status === "CANCELADO") return "text-red-700";
  if (status === "CONCLUÍDO") return "text-green-700";
  if (status === "AGENDADO") return "text-blue-700";
  return "text-gray-700";
}
// Função para traduzir status para português
function traduzirStatus(status: string) {
  switch (status) {
    case "SCHEDULED":
      return "AGENDADO";
    case "COMPLETED":
      return "CONCLUÍDO";
    case "CANCELED":
      return "CANCELADO";
    default:
      return status;
  }
}

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
        <h1 className="text-2xl font-bold mb-6 text-white">Cliente: {client.name}</h1>
        <section className="mb-8">
          <strong>Email:</strong> {client.email} <br />
          <strong>Telefone:</strong> {client.phone} <br />
          <strong>CPF:</strong> {client.cpf}
        </section>
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-white">Serviços realizados/cancelados</h2>
          {appointments.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded shadow p-6 text-center text-gray-700 dark:text-gray-300">
              Nenhum serviço agendado para este cliente.
            </div>
          ) : (
            <div className="overflow-x-auto rounded shadow">
              <table className="min-w-full bg-white dark:bg-gray-900">
                <thead>
                  <tr>
                    <th className="px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-800 dark:text-gray-200 font-semibold whitespace-nowrap">Data de Agendamento</th>
                    <th className="px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-800 dark:text-gray-200 font-semibold whitespace-nowrap">Hora</th>
                    <th className="px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-800 dark:text-gray-200 font-semibold whitespace-nowrap">Serviço(s)</th>
                    <th className="px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-800 dark:text-gray-200 font-semibold whitespace-nowrap">Barbeiro</th>
                    <th className="px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-800 dark:text-gray-200 font-semibold whitespace-nowrap">Status</th>
                    <th className="px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-800 dark:text-gray-200 font-semibold whitespace-nowrap">Valor</th>
                    <th className="px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-800 dark:text-gray-200 font-semibold whitespace-nowrap">Forma de Pagamento</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appt) => {
                    const data = new Date(appt.startAt);
                    const dataStr = data.toLocaleDateString("pt-BR");
                    const horaStr = data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
                    return (
                      <tr key={appt.id} className="hover:bg-blue-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800">
                        <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{dataStr}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{horaStr}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          {appt.items && appt.items.length > 0
                            ? appt.items.map((item) => item.serviceType?.name || "-").join(", ")
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{appt.barber?.name || "-"}</td>
                        <td className={`px-4 py-3 font-bold ${getStatusColor(traduzirStatus(appt.status))}`}>
                          {traduzirStatus(appt.status)}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          {appt.items && appt.items.length > 0
                            ? appt.items
                                .map((item) =>
                                  (item.priceCentsSnapshot / 100).toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  })
                                )
                                .join(", ")
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          {appt.payment
                            ? `${appt.payment.method} (${(appt.payment.amountCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })})`
                            : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
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
