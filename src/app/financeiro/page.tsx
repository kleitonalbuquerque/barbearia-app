"use client";
import { useEffect, useState, useRef } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

interface Appointment {
  id: string;
  startAt: string;
  endAt: string;
  status: string;
  barber: { id: string; name: string } | null;
  items: { priceCentsSnapshot: number }[];
}

interface Barber {
  id: string;
  name: string;
}



export default function FinanceiroPage() {
  const [showBarberDropdown, setShowBarberDropdown] = useState(false);
  const barberDropdownRef = useRef<HTMLDivElement>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [selectedBarbers, setSelectedBarbers] = useState<string[]>([]); // array de ids

  // Carrega barbeiros para o filtro
  useEffect(() => {
    fetch("/api/barbers")
      .then(res => res.json())
      .then(data => {
        if (data.success) setBarbers(data.barbers);
      });
  }, []);

  // Busca dados apenas ao clicar no botão
  const handleGenerate = () => {
    let url = "/api/appointments?status=COMPLETED&includeBarber=true&pageSize=100";
    if (startDate) url += `&startAt=${startDate}`;
    if (endDate) url += `&endAt=${endDate}`;
    if (selectedBarbers.length > 0 && !selectedBarbers.includes("ALL")) {
      url += selectedBarbers.map(id => `&barberId=${id}`).join("");
    }
    setLoading(true);
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.success) setAppointments(data.appointments);
        else setAppointments([]);
      })
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  };

  // Agrupa receita por barbeiro
  const receitaPorBarbeiro: Record<string, { nome: string; total: number }> = {};
  let totalGeral = 0;
  appointments.forEach(a => {
    const valor = a.items.reduce((acc, i) => acc + (i.priceCentsSnapshot || 0), 0) / 100;
    totalGeral += valor;
    if (a.barber) {
      if (!receitaPorBarbeiro[a.barber.id]) receitaPorBarbeiro[a.barber.id] = { nome: a.barber.name, total: 0 };
      receitaPorBarbeiro[a.barber.id].total += valor;
    }
  });

  // Dados para o gráfico
  const chartData = {
    labels: Object.values(receitaPorBarbeiro).map(b => b.nome),
    datasets: [
      {
        label: "Receita por Profissional (R$)",
        data: Object.values(receitaPorBarbeiro).map(b => b.total),
        backgroundColor: Object.values(receitaPorBarbeiro).map((_, idx) => {
          const palette = [
            "#22c55e", // verde
            "#2563eb", // azul
            "#facc15", // amarelo
            "#f87171", // vermelho
            "#a78bfa", // roxo
            "#f472b6", // rosa
            "#38bdf8", // ciano
            "#fb923c", // laranja
          ];
          return palette[idx % palette.length];
        }),
      },
    ],
  };

  function exportToCSV() {
    const header = "Data,Barbeiro,Valor (R$)\n";
    const rows = appointments.map(a => {
      const data = new Date(a.startAt).toLocaleDateString("pt-BR");
      const nome = a.barber?.name || "-";
      const valor = (a.items.reduce((acc, i) => acc + (i.priceCentsSnapshot || 0), 0) / 100).toFixed(2);
      return `${data},${nome},${valor}`;
    });
    const csv = header + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `faturamento-periodo.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 md:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-400">Financeiro</h1>
  <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
          <label className="block text-sm font-semibold mb-1" htmlFor="start-date">Data início</label>
          <input id="start-date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="p-2 border rounded w-full bg-white text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1" htmlFor="end-date">Data fim</label>
          <input id="end-date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="p-2 border rounded w-full bg-white text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1" htmlFor="barber-select">Profissional</label>
          <div className="relative" ref={barberDropdownRef}>
            <button
              type="button"
              id="barber-select"
              className="p-2 border rounded w-full min-w-[180px] h-[42px] text-left bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              onClick={() => setShowBarberDropdown(v => !v)}
            >
              {selectedBarbers.length === 0 || selectedBarbers.includes("ALL")
                ? "Todos"
                : barbers.filter(b => selectedBarbers.includes(b.id)).map(b => b.name).join(", ")}
              <span className="float-right">▼</span>
            </button>
            {showBarberDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-lg max-h-60 overflow-y-auto">
                <div
                  className={`px-3 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-700 rounded flex items-center gap-2 ${selectedBarbers.includes("ALL") ? "font-bold text-blue-700 dark:text-blue-400" : ""}`}
                  onClick={() => {
                    if (selectedBarbers.includes("ALL") || selectedBarbers.length === barbers.length) {
                      setSelectedBarbers([]); // Limpa todos
                    } else {
                      setSelectedBarbers(["ALL", ...barbers.map(b => b.id)]); // Seleciona todos
                    }
                  }}
                >
                  <input type="checkbox" checked={selectedBarbers.includes("ALL") || selectedBarbers.length === barbers.length} readOnly />
                  Todos
                </div>
                {barbers.map(b => (
                  <div
                    key={b.id}
                    className={`px-3 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-700 rounded flex items-center gap-2 ${selectedBarbers.includes(b.id) ? "font-bold text-blue-700 dark:text-blue-400" : ""}`}
                    onClick={() => {
                      let newSelected = selectedBarbers.includes("ALL") ? [] : [...selectedBarbers];
                      if (newSelected.includes(b.id)) {
                        newSelected = newSelected.filter(id => id !== b.id);
                      } else {
                        newSelected.push(b.id);
                      }
                      // Se todos selecionados, marca ALL
                      if (newSelected.length === barbers.length) {
                        setSelectedBarbers(["ALL", ...barbers.map(b => b.id)]);
                      } else {
                        setSelectedBarbers(newSelected);
                      }
                    }}
                  >
                    <input type="checkbox" checked={selectedBarbers.includes(b.id) || selectedBarbers.includes("ALL") } readOnly />
                    {b.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow transition h-[42px]" onClick={handleGenerate}>
          Gerar Gráfico
        </button>
        <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded shadow transition h-[42px]" onClick={exportToCSV}>
          Exportar CSV
        </button>
      </div>
      <div className="mb-8 min-h-[100px] flex items-center justify-center">
        {loading ? (
          <div className="flex items-center gap-2"><span className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></span> Carregando...</div>
        ) : (
          <Bar data={chartData} options={{ plugins: { legend: { display: false } } }} height={80} />
        )}
      </div>
      <div className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
        Valor total do período: <span className="text-blue-700 dark:text-blue-400">R$ {totalGeral.toFixed(2)}</span>
      </div>
      <div className="overflow-x-auto w-full">
        <table className="min-w-full bg-white dark:bg-gray-900 rounded shadow">
          <thead>
            <tr>
              <th className="p-3 text-left">Data</th>
              <th className="p-3 text-left">Barbeiro</th>
              <th className="p-3 text-left">Valor (R$)</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-500">Nenhum agendamento concluído encontrado.</td>
              </tr>
            ) : appointments.map((a) => {
              const data = new Date(a.startAt).toLocaleDateString("pt-BR");
              const nome = a.barber?.name || "-";
              const valor = (a.items.reduce((acc, i) => acc + (i.priceCentsSnapshot || 0), 0) / 100).toFixed(2);
              return (
                <tr key={a.id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="p-3">{data}</td>
                  <td className="p-3">{nome}</td>
                  <td className="p-3">R$ {valor}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
