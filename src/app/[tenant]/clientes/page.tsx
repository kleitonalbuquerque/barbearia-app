"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import ClientesTable from "@/components/ClientesTable";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
}

export default function ClientesPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  // Extrai o tenant da URL: /[tenant]/clientes
  const tenant = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : '';
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [orderBy, setOrderBy] = useState("createdAt");
  const [orderDir, setOrderDir] = useState<"asc"|"desc">("desc");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && isAuthenticated && tenant) {
      setLoading(true);
      fetch(`/api/clients?q=${encodeURIComponent(search)}&orderBy=${orderBy}&orderDir=${orderDir}&page=${page}&pageSize=${pageSize}&tenantId=${tenant}`)
        .then((res) => res.json())
        .then((data) => {
          setClients(data.clients || []);
          setTotal(data.total || 0);
        })
        .finally(() => setLoading(false));
    }
  }, [search, orderBy, orderDir, page, pageSize, authLoading, isAuthenticated, tenant]);

  // Resetar para página 1 ao mudar filtros
  useEffect(() => { setPage(1); }, [search, orderBy, orderDir]);



  if (!authLoading && !isAuthenticated) {
    return <div className="p-8 text-center text-red-600 font-bold">Você precisa estar logado para acessar esta página.</div>;
  }
  return (
    <div className="w-full px-2 sm:px-4 md:px-8 lg:px-16 xl:px-32 py-4 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold brand-title">Clientes</h1>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow transition"
          onClick={() => router.push(`/${tenant}/clientes/novo`)}
        >
          + Novo Cliente
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-2 mb-6">
        <input
          className="w-full px-3 py-2 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-gray-900"
          placeholder="Buscar por nome, e-mail, telefone ou CPF..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="px-3 py-2 text-base border border-gray-300 rounded text-gray-900 bg-gray-50"
          value={orderBy}
          onChange={e => setOrderBy(e.target.value)}
        >
          <option value="createdAt">Mais recente</option>
          <option value="name">Nome</option>
          <option value="email">Email</option>
        </select>
        <select
          className="px-3 py-2 text-base border border-gray-300 rounded text-gray-900 bg-gray-50"
          value={orderDir}
          onChange={e => setOrderDir(e.target.value as "asc"|"desc")}
        >
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
      </div>
      <ClientesTable clients={clients} />
      {/* Paginação */}
      <div className="flex items-center justify-between mt-4">
        <div>
          <span className="text-black dark:text-white">Página {page} de {Math.max(1, Math.ceil(total / pageSize))}</span>
        </div>
        <div className="flex gap-2 items-center">
          <button
            className="px-3 py-1 rounded font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:text-gray-200 transition"
            onClick={() => setPage(1)}
            disabled={page === 1}
          >Início</button>
          <button
            className="px-3 py-1 rounded font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:text-gray-200 transition"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >Anterior</button>
          <button
            className="px-3 py-1 rounded font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:text-gray-200 transition"
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(total / pageSize)}
          >Próxima</button>
          <button
            className="px-3 py-1 rounded font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:text-gray-200 transition"
            onClick={() => setPage(Math.max(1, Math.ceil(total / pageSize)))}
            disabled={page >= Math.ceil(total / pageSize)}
          >Última</button>
          <select
            className="ml-2 p-1 border rounded bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            {[5, 10, 20, 50].map(size => (
              <option key={size} value={size} className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100">{size} por página</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
