import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import DataTable, { DataTableColumn } from "./DataTable";
import { useRouter } from "next/navigation";

interface Professional {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  cnpj?: string | null;
}

interface ProfessionalsTableProps {
  professionals: Professional[];
}

const ProfessionalsTable: React.FC<ProfessionalsTableProps> = ({ professionals }) => {
  const router = useRouter();
  const columns: DataTableColumn<Professional>[] = [
    {
      key: "name",
      header: "Nome",
      render: (professional) => professional.name,
      className: "px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-800 dark:text-gray-200",
    },
    {
      key: "email",
      header: "Email",
      render: (professional) => professional.email,
      className: "px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-800 dark:text-gray-200",
    },
    {
      key: "phone",
      header: "Telefone",
      render: (professional) => professional.phone,
      className: "px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-800 dark:text-gray-200",
    },
    {
      key: "cpf",
      header: "CPF",
      render: (professional) => professional.cpf,
      className: "px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-800 dark:text-gray-200",
    },
    {
      key: "cnpj",
      header: "CNPJ",
      render: (professional) => professional.cnpj || "-",
      className: "px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-800 dark:text-gray-200",
    },
    {
      key: "detalhes",
      header: "Detalhes",
      render: (professional) => (
        <div className="text-center">
          <button
            type="button"
            aria-label="Ver detalhes"
            className="text-blue-600 hover:text-blue-800 p-2 cursor-pointer"
            style={{ background: 'none', border: 'none', padding: 0 }}
            onClick={() => router.push(`/professionals/${professional.id}`)}
          >
            <FontAwesomeIcon icon={faEye} />
          </button>
        </div>
      ),
      className: "px-4 py-3 bg-gray-100 dark:bg-gray-800 text-center text-gray-800 dark:text-gray-200",
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={professionals}
      emptyMessage="Nenhum profissional encontrado."
      rowKey={(row) => row.id}
      tableClassName="min-w-full bg-white dark:bg-gray-900"
    />
  );
};

export default ProfessionalsTable;
