interface AgendamentosTableProps {
  appointments: Appointment[];
  emptyServiceMessageClient?: string;
  emptyServiceMessageBarber?: string;
  context?: "client" | "barber";
  onRowClick?: (appt: Appointment) => void;
}
import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
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

export interface Appointment {
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

function getColumns(context: "client" | "barber" = "barber", onEditClick?: (appt: Appointment) => void): DataTableColumn<Appointment>[] {
  const columns: DataTableColumn<Appointment>[] = [
    {
      key: "startAt",
      header: "Data de Agendamento",
      render: (appt: Appointment) => {
        const data = new Date(appt.startAt);
        return data.toLocaleDateString("pt-BR");
      },
      className: "px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-800 dark:text-gray-200 font-semibold whitespace-nowrap",
    },
    {
      key: "hora",
      header: "Hora",
      render: (appt: Appointment) => {
        const data = new Date(appt.startAt);
        return data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      },
      className: "px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-800 dark:text-gray-200 font-semibold whitespace-nowrap",
    },
    {
      key: "servicos",
      header: "Serviço(s)",
      render: (appt: Appointment) =>
        appt.items && appt.items.length > 0
          ? appt.items.map((item) => item.serviceType?.name || "-").join(", ")
          : "-",
      className: "px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-800 dark:text-gray-200 font-semibold whitespace-nowrap",
    },
    context === "barber"
      ? {
          key: "client",
          header: "Cliente",
          render: (appt: Appointment) => appt.client?.name || "-",
          className: "px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-800 dark:text-gray-200 font-semibold whitespace-nowrap",
        }
      : {
          key: "barber",
          header: "Barbeiro",
          render: (appt: Appointment) => appt.barber?.name || "-",
          className: "px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-800 dark:text-gray-200 font-semibold whitespace-nowrap",
        },
    {
      key: "status",
      header: "Status",
      render: (appt: Appointment) => {
        const status = traduzirStatus(appt.status);
        return <span className={`font-bold ${getStatusColor(status)}`}>{status}</span>;
      },
      className: "px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-800 dark:text-gray-200 font-semibold whitespace-nowrap",
    },
    {
      key: "valor",
      header: "Valor",
      render: (appt: Appointment) =>
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
      render: (appt: Appointment) => {
        if (!appt.payment) return "-";
        switch (appt.payment.method) {
          case "PIX": return "PIX";
          case "CREDIT": return "Crédito";
          case "DEBIT": return "Débito";
          case "CASH": return "Dinheiro";
          default: return appt.payment.method;
        }
      },
      className: "px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-800 dark:text-gray-200 font-semibold whitespace-nowrap",
    },
    // Coluna de detalhes (ícone olho) só para barbeiro
    ...(context === "barber"
      ? [{
          key: "detalhes",
          header: "Detalhes",
          render: (appt: Appointment) => (
            <div className="text-center" onClick={e => e.stopPropagation()}>
              <button
                type="button"
                aria-label="Ver detalhes"
                className="text-blue-600 hover:text-blue-800 p-2 cursor-pointer"
                tabIndex={-1}
                style={{ background: 'none', border: 'none', padding: 0 }}
                onClick={e => e.stopPropagation()}
              >
                <FontAwesomeIcon
                  icon={faEye}
                  tabIndex={0}
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (onEditClick) onEditClick(appt);
                  }}
                  style={{ cursor: 'pointer' }}
                />
              </button>
            </div>
          ),
          className: "px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-semibold whitespace-nowrap",
        }]
      : []),
  ];
  return columns;
}

const AgendamentosTable: React.FC<AgendamentosTableProps> = ({ appointments, emptyServiceMessageClient = "Nenhum serviço agendado para este cliente.", emptyServiceMessageBarber = "Nenhum serviço agendado para este barbeiro.", context = "barber", onRowClick }) => (
  <DataTable
    columns={getColumns(context, onRowClick)}
    data={appointments}
    emptyMessage={context === "client" ? emptyServiceMessageClient : emptyServiceMessageBarber}
    rowKey={(row) => row.id}
    onRowClick={onRowClick}
  />
);
export default AgendamentosTable;
