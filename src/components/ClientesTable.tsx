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
  className: "px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-900 dark:text-gray-100",
    },
    {
      key: "email",
      header: "Email",
      render: (client) => client.email,
  className: "px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-900 dark:text-gray-100",
    },
    {
      key: "phone",
      header: "Telefone",
      render: (client) => client.phone,
  className: "px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-900 dark:text-gray-100",
    },
    {
      key: "cpf",
      header: "CPF",
      render: (client) => client.cpf,
  className: "px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-900 dark:text-gray-100",
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
  className: "px-4 py-3 bg-gray-100 dark:bg-gray-800 text-center text-gray-900 dark:text-gray-100",
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={clients}
      emptyMessage="Nenhum cliente encontrado."
      rowKey={(row) => row.id}
      tableClassName="min-w-full bg-white dark:bg-gray-900"
    />
  );
};

export default ClientesTable;
