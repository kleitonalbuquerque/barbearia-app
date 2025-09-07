"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DataTable, { DataTableColumn } from "@/components/DataTable";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
}

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    fetch(`/api/clients?q=${encodeURIComponent(search)}`)
      .then((res) => res.json())
      .then((data) => setClients(data.clients || []))
      .finally(() => setLoading(false));
  }, [search]);

  const columns: DataTableColumn<Client>[] = [
    {
      key: "name",
      header: "Nome",
      render: (client) => client.name,
      className: "px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-800 dark:text-gray-200 font-semibold",
    },
    {
      key: "email",
      header: "Email",
      render: (client) => client.email,
      className: "px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-800 dark:text-gray-200 font-semibold",
    },
    {
      key: "phone",
      header: "Telefone",
      render: (client) => client.phone,
      className: "px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-800 dark:text-gray-200 font-semibold",
    },
    {
      key: "cpf",
      header: "CPF",
      render: (client) => client.cpf,
      className: "px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-800 dark:text-gray-200 font-semibold",
    },
  ];

  return (
    <div className="w-full px-2 sm:px-4 md:px-8 lg:px-16 xl:px-32 py-4 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Clientes</h1>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow transition"
          onClick={() => router.push("/clientes/novo")}
        >
          + Novo Cliente
        </button>
      </div>
      <input
        className="w-full p-3 text-base border border-gray-300 rounded mb-6 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-gray-900"
        placeholder="Buscar por nome, e-mail, telefone ou CPF..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {loading ? (
        <p className="text-gray-700">Carregando...</p>
      ) : (
        <DataTable
          columns={columns}
          data={clients}
          emptyMessage="Nenhum cliente encontrado."
          rowKey={(row) => row.id}
          tableClassName="min-w-full bg-white dark:bg-gray-900"
          onRowClick={(client) => router.push(`/clientes/${client.id}`)}
        />
      )}
    </div>
  );
}
