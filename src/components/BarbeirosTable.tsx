import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import DataTable, { DataTableColumn } from "./DataTable";
import { useRouter } from "next/navigation";

interface Barber {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  cnpj?: string | null;
}

interface BarbeirosTableProps {
  barbers: Barber[];
}

const BarbeirosTable: React.FC<BarbeirosTableProps> = ({ barbers }) => {
  const router = useRouter();
  const columns: DataTableColumn<Barber>[] = [
    {
      key: "name",
      header: "Nome",
      render: (barber) => barber.name,
      className: "px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-800 dark:text-gray-200 font-semibold",
    },
    {
      key: "email",
      header: "Email",
      render: (barber) => barber.email,
      className: "px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-800 dark:text-gray-200 font-semibold",
    },
    {
      key: "phone",
      header: "Telefone",
      render: (barber) => barber.phone,
      className: "px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-800 dark:text-gray-200 font-semibold",
    },
    {
      key: "cpf",
      header: "CPF",
      render: (barber) => barber.cpf,
      className: "px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-800 dark:text-gray-200 font-semibold",
    },
    {
      key: "cnpj",
      header: "CNPJ",
      render: (barber) => barber.cnpj || "-",
      className: "px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-800 dark:text-gray-200 font-semibold",
    },
    {
      key: "detalhes",
      header: "Detalhes",
      render: (barber) => (
        <div className="text-center">
          <button
            type="button"
            aria-label="Ver detalhes"
            className="text-blue-600 hover:text-blue-800 p-2 cursor-pointer"
            style={{ background: 'none', border: 'none', padding: 0 }}
            onClick={() => router.push(`/barbeiros/${barber.id}`)}
          >
            <FontAwesomeIcon icon={faEye} />
          </button>
        </div>
      ),
      className: "px-4 py-3 bg-gray-100 dark:bg-gray-800 text-center text-gray-800 dark:text-gray-200 font-semibold",
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={barbers}
      emptyMessage="Nenhum barbeiro encontrado."
      rowKey={(row) => row.id}
      tableClassName="min-w-full bg-white dark:bg-gray-900"
    />
  );
};

export default BarbeirosTable;
