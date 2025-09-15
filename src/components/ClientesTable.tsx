import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import DataTable, { DataTableColumn } from "./DataTable";
import { useRouter } from "next/navigation";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
}

interface ClientesTableProps {
  clients: Client[];
}

const ClientesTable: React.FC<ClientesTableProps> = ({ clients }) => {
  const router = useRouter();
  const columns: DataTableColumn<Client>[] = [
    {
      key: "name",
      header: "Nome",
      render: (client) => client.name,
      className: "brand-table text-left",
    },
    {
      key: "email",
      header: "Email",
      render: (client) => client.email,
      className: "brand-table text-left",
    },
    {
      key: "phone",
      header: "Telefone",
      render: (client) => client.phone,
      className: "brand-table text-left",
    },
    {
      key: "cpf",
      header: "CPF",
      render: (client) => client.cpf,
      className: "brand-table text-left",
    },
    {
      key: "detalhes",
      header: "Detalhes",
      render: (client) => (
        <div className="text-center">
          <button
            type="button"
            aria-label="Ver detalhes"
            className="text-blue-600 hover:text-blue-800 p-2 cursor-pointer"
            style={{ background: 'none', border: 'none', padding: 0 }}
            onClick={() => router.push(`/clientes/${client.id}`)}
          >
            <FontAwesomeIcon icon={faEye} />
          </button>
        </div>
      ),
      className: "brand-table text-center",
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={clients}
      emptyMessage="Nenhum cliente encontrado."
      rowKey={(row) => row.id}
      tableClassName="min-w-full brand-bg brand-table"
    />
  );
};

export default ClientesTable;
