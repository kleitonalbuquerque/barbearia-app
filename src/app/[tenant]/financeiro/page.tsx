"use client";
import { useEffect, useState, useRef } from "react";
import Spinner from "@/components/Spinner";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

interface Appointment {
  id: string;
  startAt: string;
  endAt: string;
  status: string;
  professional: { id: string; name: string } | null;
  items: { priceCentsSnapshot: number }[];
}

interface Professional {
  id: string;
  name: string;
}

export default function FinanceiroTenantPage() {
  const [showProfessionalDropdown, setShowProfessionalDropdown] = useState(false);
  const professionalDropdownRef = useRef<HTMLDivElement>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedProfessionals, setSelectedProfessionals] = useState<string[]>([]); // array de ids

  // Carrega profissionais para o filtro
  const params = typeof window !== "undefined" ? window.location.pathname.split("/") : [];
  const tenant = params.length > 1 ? params[1] : "";
  useEffect(() => {
    if (!tenant) return;
    fetch(`/api/professionals?tenantId=${tenant}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setProfessionals(data.professionals);
      });
  }, [tenant]);

  // Busca dados apenas ao clicar no botão
  const handleGenerate = () => {
    let url = "/api/appointments?status=COMPLETED&includeProfessional=true&pageSize=100";
    if (startDate) url += `&startAt=${startDate}`;
    if (endDate) url += `&endAt=${endDate}`;
    if (selectedProfessionals.length > 0 && !selectedProfessionals.includes("ALL")) {
      url += selectedProfessionals.map(id => `&professionalId=${id}`).join("");
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

  // Agrupa receita por profissional
  const receitaPorProfissional: Record<string, { nome: string; total: number }> = {};
  let totalGeral = 0;
  appointments.forEach(a => {
    const valor = a.items.reduce((acc, i) => acc + (i.priceCentsSnapshot || 0), 0) / 100;
    totalGeral += valor;
    if (a.professional) {
      if (!receitaPorProfissional[a.professional.id]) receitaPorProfissional[a.professional.id] = { nome: a.professional.name, total: 0 };
      receitaPorProfissional[a.professional.id].total += valor;
    }
  });

  // Dados para o gráfico
  const chartData = {
    labels: Object.values(receitaPorProfissional).map(b => b.nome),
    datasets: [
      {
        label: "Receita por Profissional (R$)",
        data: Object.values(receitaPorProfissional).map(b => b.total),
        backgroundColor: Object.values(receitaPorProfissional).map((_, idx) => {
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
    const header = "Data,Profissional,Valor (R$)\n";
    const rows = appointments.map(a => {
      const data = new Date(a.startAt).toLocaleDateString("pt-BR");
      const nome = a.professional?.name || "-";
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
      <h1 className="text-2xl font-bold mb-6 brand-title">Financeiro</h1>
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
          <label className="block text-sm font-semibold mb-1 text-white" htmlFor="start-date">Data início</label>
          <input id="start-date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="p-2 border rounded w-full bg-white text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-white" htmlFor="end-date">Data fim</label>
          <input id="end-date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="p-2 border rounded w-full bg-white text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-white" htmlFor="professional-select">Profissional</label>
          <div className="relative" ref={professionalDropdownRef}>
            <button
              type="button"
              id="professional-select"
              className="p-2 border rounded w-full min-w-[180px] h-[42px] text-left bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              onClick={() => setShowProfessionalDropdown(v => !v)}
            >
              {selectedProfessionals.length === 0 || selectedProfessionals.includes("ALL")
                ? "Todos"
                : professionals.filter(b => selectedProfessionals.includes(b.id)).map(b => b.name).join(", ")}
              <span className="float-right">▼</span>
            </button>
            {showProfessionalDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-lg max-h-60 overflow-y-auto">
                <div
                  className={`px-3 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-700 rounded flex items-center gap-2 ${selectedProfessionals.includes("ALL") ? "font-bold text-blue-700 dark:text-blue-400" : ""}`}
                  onClick={() => {
                    if (selectedProfessionals.includes("ALL") || selectedProfessionals.length === professionals.length) {
                      setSelectedProfessionals([]); // Limpa todos
                    } else {
                      setSelectedProfessionals(["ALL", ...professionals.map(b => b.id)]); // Seleciona todos
                    }
                  }}
                >
                  <input type="checkbox" checked={selectedProfessionals.includes("ALL") || selectedProfessionals.length === professionals.length} readOnly />
                  Todos
                </div>
                {professionals.map(b => (
                  <div
                    key={b.id}
                    className={`px-3 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-700 rounded flex items-center gap-2 ${selectedProfessionals.includes(b.id) ? "font-bold text-blue-700 dark:text-blue-400" : ""}`}
                    onClick={() => {
                      let newSelected = selectedProfessionals.includes("ALL") ? [] : [...selectedProfessionals];
                      if (newSelected.includes(b.id)) {
                        newSelected = newSelected.filter(id => id !== b.id);
                      } else {
                        newSelected.push(b.id);
                      }
                      // Se todos selecionados, marca ALL
                      if (newSelected.length === professionals.length) {
                        setSelectedProfessionals(["ALL", ...professionals.map(b => b.id)]);
                      } else {
                        setSelectedProfessionals(newSelected);
                      }
                    }}
                  >
                    <input type="checkbox" checked={selectedProfessionals.includes(b.id) || selectedProfessionals.includes("ALL") } readOnly />
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
          <Spinner />
        ) : (
          <div style={{ background: '#fff', borderRadius: 12, padding: 16, width: '100%' }}>
              <Bar
                data={chartData}
                options={{
                  plugins: { legend: { display: false } },
                  layout: { padding: 0 },
                  backgroundColor: '#fff',
                  scales: {
                    x: { grid: { color: '#e5e7eb' }, ticks: { color: '#2563eb' } },
                    y: { grid: { color: '#e5e7eb' }, ticks: { color: '#2563eb' } },
                  },
                }}
                height={80}
              />
          </div>
        )}
      </div>
      <div className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
        Valor total do período: <span className="text-blue-700 dark:text-blue-400">R$ {totalGeral.toFixed(2)}</span>
      </div>
      <div className="overflow-x-auto w-full">
        <table className="min-w-full bg-white dark:bg-gray-900 rounded shadow">
          <thead>
            <tr>
              <th className="p-3 text-left text-gray-800 dark:text-gray-100">Data</th>
              <th className="p-3 text-left text-gray-800 dark:text-gray-100">Profissional</th>
              <th className="p-3 text-left text-gray-800 dark:text-gray-100">Valor (R$)</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-300">Nenhum agendamento concluído encontrado.</td>
              </tr>
            ) : appointments.map((a) => {
              const data = new Date(a.startAt).toLocaleDateString("pt-BR");
              const nome = a.professional?.name || "-";
              const valor = (a.items.reduce((acc, i) => acc + (i.priceCentsSnapshot || 0), 0) / 100).toFixed(2);
              return (
                <tr key={a.id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="p-3 text-gray-700 dark:text-gray-100">{data}</td>
                  <td className="p-3 text-gray-700 dark:text-gray-100">{nome}</td>
                  <td className="p-3 text-gray-700 dark:text-gray-100">R$ {valor}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
