import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import DataTable, { DataTableColumn } from "./DataTable";
import { useRouter } from "next/navigation";

interface ServiceType {
  id: string;
  name: string;
  priceCents: number;
  durationMinutes: number;
}

interface ServicesTableProps {
  services: ServiceType[];
}

const ServicesTable: React.FC<ServicesTableProps> = ({ services }) => {
  const router = useRouter();
  const columns: DataTableColumn<ServiceType>[] = [
    {
      key: "name",
      header: "Nome",
      render: (service) => service.name,
      className: "px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-800 dark:text-gray-200 bg-inherit group-hover:bg-gray-100 group-hover:dark:bg-gray-800 transition-colors",
    },
    {
      key: "priceCents",
      header: "Preço",
      render: (service) => `R$ ${(service.priceCents/100).toFixed(2)}`,
      className: "px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-800 dark:text-gray-200 bg-inherit group-hover:bg-gray-100 group-hover:dark:bg-gray-800 transition-colors",
    },
    {
      key: "durationMinutes",
      header: "Duração (min)",
      render: (service) => service.durationMinutes,
      className: "px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-800 dark:text-gray-200 bg-inherit group-hover:bg-gray-100 group-hover:dark:bg-gray-800 transition-colors",
    },
    {
      key: "detalhes",
      header: "Detalhes",
      render: (service) => (
        <div className="text-center">
          <button
            type="button"
            aria-label="Ver detalhes"
            className="text-blue-600 hover:text-blue-800 p-2 cursor-pointer"
            style={{ background: 'none', border: 'none', padding: 0 }}
            onClick={() => router.push(`/servicos/${service.id}`)}
          >
            <FontAwesomeIcon icon={faEye} />
          </button>
        </div>
      ),
      className: "px-4 py-3 bg-gray-100 dark:bg-gray-800 text-center text-gray-800 dark:text-gray-200 bg-inherit group-hover:bg-gray-100 group-hover:dark:bg-gray-800 transition-colors",
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={services}
      emptyMessage="Nenhum serviço encontrado."
      rowKey={(row) => row.id}
      tableClassName="min-w-full bg-white dark:bg-gray-900"
      rowClassName="group hover:bg-gray-100 hover:dark:bg-gray-800 transition-colors"
    />
  );
};

export default ServicesTable;
