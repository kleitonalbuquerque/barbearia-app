"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BarbeirosTable from "@/components/BarbeirosTable";

interface Barber {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
}

export default function BarbeirosPage() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [search, setSearch] = useState("");
  const [orderBy, setOrderBy] = useState("createdAt");
  const [orderDir, setOrderDir] = useState<"asc"|"desc">("desc");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    fetch(`/api/barbers?q=${encodeURIComponent(search)}&orderBy=${orderBy}&orderDir=${orderDir}`)
      .then((res) => res.json())
      .then((data) => setBarbers(data.barbers || []))
      .finally(() => setLoading(false));
  }, [search, orderBy, orderDir]);

  
  // Removed columns definition as BarbeirosTable handles it internally

  return (
    <div className="w-full px-2 sm:px-4 md:px-8 lg:px-16 xl:px-32 py-4 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Barbeiros</h1>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow transition"
          onClick={() => router.push("/barbeiros/novo")}
        >
          + Novo Barbeiro
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-2 mb-6">
        <input
          className="w-full p-3 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-gray-900"
          placeholder="Buscar por nome, e-mail, telefone ou CPF..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="p-3 border border-gray-300 rounded text-gray-900 bg-gray-50"
          value={orderBy}
          onChange={e => setOrderBy(e.target.value)}
        >
          <option value="createdAt">Mais recente</option>
          <option value="name">Nome</option>
          <option value="email">Email</option>
        </select>
        <select
          className="p-3 border border-gray-300 rounded text-gray-900 bg-gray-50"
          value={orderDir}
          onChange={e => setOrderDir(e.target.value as "asc"|"desc")}
        >
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
      </div>
      {loading ? (
        <p className="text-gray-700">Carregando...</p>
      ) : (
        <BarbeirosTable barbers={barbers} />
      )}
    </div>
  );
}
