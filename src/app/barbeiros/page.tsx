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
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    fetch(`/api/barbers?q=${encodeURIComponent(search)}`)
      .then((res) => res.json())
      .then((data) => setBarbers(data.barbers || []))
      .finally(() => setLoading(false));
  }, [search]);

  
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
      <input
        className="w-full p-3 text-base border border-gray-300 rounded mb-6 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-gray-900"
        placeholder="Buscar por nome, e-mail, telefone ou CPF..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {loading ? (
        <p className="text-gray-700">Carregando...</p>
      ) : (
        <BarbeirosTable barbers={barbers} />
      )}
    </div>
  );
}
