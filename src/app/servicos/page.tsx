"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from "next/navigation";

interface ServiceType {
  id: string;
  name: string;
  priceCents: number;
  durationMinutes: number;
}

export default function ServicosPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [services, setServices] = useState<ServiceType[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderBy, setOrderBy] = useState("createdAt");
  const [orderDir, setOrderDir] = useState<"asc"|"desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      setLoading(true);
      fetch(`/api/services?q=${encodeURIComponent(search)}&orderBy=${orderBy}&orderDir=${orderDir}&page=${page}&pageSize=${pageSize}`)
        .then((res) => res.json())
        .then((data) => {
          setServices(data.services || []);
          setTotal(data.total || 0);
        })
        .finally(() => setLoading(false));
    }
  }, [search, orderBy, orderDir, page, pageSize, authLoading, isAuthenticated]);

  // Resetar para página 1 ao mudar filtros
  useEffect(() => { setPage(1); }, [search, orderBy, orderDir]);

  if (!authLoading && !isAuthenticated) {
    return <div className="p-8 text-center text-red-600 font-bold">Você precisa estar logado para acessar esta página.</div>;
  }
  return (
    <div className="w-full px-2 sm:px-4 md:px-8 lg:px-16 xl:px-32 py-4 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Serviços</h1>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow transition"
          onClick={() => router.push("/servicos/novo")}
        >
          + Novo Serviço
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-2 mb-6">
        <input
          className="w-full min-w-[200px] px-3 py-2 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-gray-900"
          placeholder="Buscar por nome..."
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
          <option value="priceCents">Preço</option>
        </select>
        <select
          className="px-3 py-2 text-base border border-gray-300 rounded text-gray-900 bg-gray-50"
          value={orderDir}
          onChange={e => setOrderDir(e.target.value as "asc"|"desc")}
        >
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
        <button
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded shadow transition min-w-[120px] whitespace-nowrap text-base flex-shrink-0"
          onClick={() => {
            setSearch("");
            setOrderBy("createdAt");
            setOrderDir("desc");
          }}
        >
          Limpar filtros
        </button>
      </div>
      {loading ? (
        <p className="text-gray-700">Carregando...</p>
      ) : (
        <>
          <table className="min-w-full bg-white dark:bg-gray-900 rounded shadow">
            <thead>
              <tr>
                <th className="px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-800 dark:text-gray-200 font-semibold">Nome</th>
                <th className="px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-800 dark:text-gray-200 font-semibold">Preço</th>
                <th className="px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-800 dark:text-gray-200 font-semibold">Duração (min)</th>
                <th className="px-4 py-3 bg-gray-100 dark:bg-gray-800 text-center text-gray-800 dark:text-gray-200 font-semibold">Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {services.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-6 text-gray-500">Nenhum serviço encontrado.</td></tr>
              ) : (
                services.map(service => (
                  <tr key={service.id} className="hover:bg-blue-50 dark:hover:bg-gray-800 transition">
                    <td className="px-4 py-3">{service.name}</td>
                    <td className="px-4 py-3">R$ {(service.priceCents/100).toFixed(2)}</td>
                    <td className="px-4 py-3">{service.durationMinutes}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        className="text-blue-600 hover:text-blue-800 p-2 cursor-pointer"
                        style={{ background: 'none', border: 'none', padding: 0 }}
                        onClick={() => router.push(`/servicos/${service.id}`)}
                        aria-label="Ver detalhes"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {/* Paginação */}
          <div className="flex items-center justify-between mt-4">
            <div>
              Página {page} de {Math.max(1, Math.ceil(total / pageSize))}
            </div>
            <div className="flex gap-2 items-center">
              <button
                className="px-3 py-2 text-base rounded font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:text-gray-200 transition"
                onClick={() => setPage(1)}
                disabled={page === 1}
              >Início</button>
              <button
                className="px-3 py-2 text-base rounded font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:text-gray-200 transition"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >Anterior</button>
              <button
                className="px-3 py-2 text-base rounded font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:text-gray-200 transition"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(total / pageSize)}
              >Próxima</button>
              <button
                className="px-3 py-2 text-base rounded font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:text-gray-200 transition"
                onClick={() => setPage(Math.max(1, Math.ceil(total / pageSize)))}
                disabled={page >= Math.ceil(total / pageSize)}
              >Última</button>
              <select
                className="ml-2 px-3 py-2 text-base border rounded bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
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
        </>
      )}
    </div>
  );
}
