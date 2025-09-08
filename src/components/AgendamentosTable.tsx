import React from "react";
import DataTable, { DataTableColumn } from "./DataTable";

interface AppointmentItem {
  id: string;
  serviceTypeId: string;
  priceCentsSnapshot: number;
  durationMinutesSnapshot: number;
  serviceType?: { name: string };
}

interface Payment {
  id: string;
  method: string;
  amountCents: number;
  paidAt: string;
}

interface Appointment {
  id: string;
  startAt: string;
  endAt: string;
  status: string;
  items: AppointmentItem[];
  payment?: Payment;
  barber?: { name: string };
  client?: { name: string };
}

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

function getStatusColor(status: string) {
  if (status === "CANCELADO") return "text-red-700";
  if (status === "CONCLUÍDO") return "text-green-700";
  if (status === "AGENDADO") return "text-blue-700";
  return "text-gray-700";
}

interface AgendamentosTableProps {
  appointments: Appointment[];
  emptyServiceMessageClient?: string;
  emptyServiceMessageBarber?: string;
  context?: "client" | "barber";
}

function getColumns(context: "client" | "barber" = "barber"): DataTableColumn<Appointment>[] {
  return [
    {
      key: "startAt",
      header: "Data de Agendamento",
      render: (appt) => {
        const data = new Date(appt.startAt);
        return data.toLocaleDateString("pt-BR");
      },
      className: "px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-800 dark:text-gray-200 font-semibold whitespace-nowrap",
    },
    {
      key: "hora",
      header: "Hora",
      render: (appt) => {
        const data = new Date(appt.startAt);
        return data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      },
      className: "px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-800 dark:text-gray-200 font-semibold whitespace-nowrap",
    },
    {
      key: "servicos",
      header: "Serviço(s)",
      render: (appt) =>
        appt.items && appt.items.length > 0
          ? appt.items.map((item) => item.serviceType?.name || "-").join(", ")
          : "-",
      className: "px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-800 dark:text-gray-200 font-semibold whitespace-nowrap",
    },
    context === "barber"
      ? {
          key: "client",
          header: "Cliente",
          render: (appt) => appt.client?.name || "-",
          className: "px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-800 dark:text-gray-200 font-semibold whitespace-nowrap",
        }
      : {
          key: "barber",
          header: "Barbeiro",
          render: (appt) => appt.barber?.name || "-",
          className: "px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-800 dark:text-gray-200 font-semibold whitespace-nowrap",
        },
    {
      key: "status",
      header: "Status",
      render: (appt) => {
        const status = traduzirStatus(appt.status);
        return <span className={`font-bold ${getStatusColor(status)}`}>{status}</span>;
      },
      className: "px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-800 dark:text-gray-200 font-semibold whitespace-nowrap",
    },
    {
      key: "valor",
      header: "Valor",
      render: (appt) =>
        appt.items && appt.items.length > 0
          ? appt.items
              .map((item) =>
                (item.priceCentsSnapshot / 100).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })
              )
              .join(", ")
          : "-",
      className: "px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-800 dark:text-gray-200 font-semibold whitespace-nowrap",
    },
    {
      key: "pagamento",
      header: "Forma de Pagamento",
      render: (appt) =>
        appt.payment
          ? `${appt.payment.method} (${(appt.payment.amountCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })})`
          : "-",
      className: "px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-800 dark:text-gray-200 font-semibold whitespace-nowrap",
    },
  ];
}

const AgendamentosTable: React.FC<AgendamentosTableProps> = ({ appointments, emptyServiceMessageClient = "Nenhum serviço agendado para este cliente.", emptyServiceMessageBarber = "Nenhum serviço agendado para este barbeiro.", context = "barber" }) => (
  <DataTable
    columns={getColumns(context)}
    data={appointments}
    emptyMessage={context === "client" ? emptyServiceMessageClient : emptyServiceMessageBarber}
    rowKey={(row) => row.id}
  />
);
export default AgendamentosTable;
