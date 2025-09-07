"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AgendamentosTable from "@/components/AgendamentosTable";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
}

interface AppointmentItem {
  id: string;
  serviceTypeId: string;
  priceCentsSnapshot: number;
  durationMinutesSnapshot: number;
  serviceType?: { name: string };
}

interface Appointment {
  id: string;
  startAt: string;
  endAt: string;
  status: string;
  items: AppointmentItem[];
  payment?: Payment;
  barber?: { name: string };
}

interface Payment {
  id: string;
  method: string;
  amountCents: number;
  paidAt: string;
}

export default function ClienteDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params?.id as string;
  const [client, setClient] = useState<Client | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", cpf: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!clientId) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/clients/${clientId}`).then((res) => res.json()),
      fetch(`/api/appointments?clientId=${clientId}&page=1&pageSize=50&includeBarber=true&includeServiceType=true`).then((res) => res.json()),
    ])
      .then(([clientData, appointmentsData]) => {
        setClient(clientData.client || null);
        setAppointments(appointmentsData.appointments || []);
        setForm({
          name: clientData.client?.name || "",
          email: clientData.client?.email || "",
          phone: clientData.client?.phone || "",
          cpf: clientData.client?.cpf || "",
        });
      })
      .finally(() => setLoading(false));
  }, [clientId]);

  function handleEdit() {
    setEditMode(true);
    setError("");
    setSuccess("");
  }

  function handleCancel() {
    setEditMode(false);
    if (client) {
      setForm({
        name: client.name,
        email: client.email,
        phone: client.phone,
        cpf: client.cpf,
      });
    }
    setError("");
    setSuccess("");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    const res = await fetch(`/api/clients/${clientId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) {
      setSuccess("Dados atualizados com sucesso!");
      setClient({ ...client!, ...form });
      setEditMode(false);
    } else {
      setError(data.error || "Erro ao atualizar cliente.");
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  let conteudo;
  if (loading) {
    conteudo = <p>Carregando...</p>;
  } else if (client) {
    conteudo = (
      <>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Cliente: {client.name}</h1>
          <div className="flex gap-2">
            {editMode ? (
              <>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded shadow transition"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Salvando..." : "Salvar"}
                </button>
                <button
                  className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 font-semibold px-4 py-2 rounded shadow transition"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow transition"
                  onClick={handleEdit}
                >
                  Editar
                </button>
                <button
                  className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 font-semibold px-4 py-2 rounded shadow transition"
                  onClick={() => router.back()}
                >
                  Voltar
                </button>
              </>
            )}
          </div>
        </div>
        <section className="mb-8">
          {editMode ? (
            <form onSubmit={handleSave} className="flex flex-col gap-3 max-w-md">
              <label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Nome</label>
              <input
                id="name"
                className="p-3 border-2 border-blue-500 focus:ring-2 focus:ring-blue-400 rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 font-bold"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                autoFocus
              />
              <label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Email</label>
              <input
                id="email"
                className="p-3 border border-gray-300 rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500"
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
              />
              <label htmlFor="phone" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Telefone</label>
              <input
                id="phone"
                className="p-3 border border-gray-300 rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
              <label htmlFor="cpf" className="text-sm font-semibold text-gray-700 dark:text-gray-200">CPF</label>
              <input
                id="cpf"
                className="p-3 border border-gray-300 rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500"
                name="cpf"
                value={form.cpf}
                onChange={handleChange}
              />
              <hr className="my-4 border-gray-300 dark:border-gray-700" />
              {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
              {success && <p className="text-green-600 text-sm mt-2">{success}</p>}
            </form>
          ) : (
            <>
              <strong>Email:</strong> {client.email} <br />
              <strong>Telefone:</strong> {client.phone} <br />
              <strong>CPF:</strong> {client.cpf}
              <hr className="my-4 border-gray-300 dark:border-gray-700" />
            </>
          )}
        </section>
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Serviços realizados/cancelados</h2>
            <span className="text-sm text-gray-700 dark:text-gray-300 font-semibold">
              Serviços concluídos: {appointments.filter(a => a.status === 'COMPLETED' || a.status === 'CONCLUÍDO').length}
            </span>
          </div>
          <AgendamentosTable appointments={appointments} />
        </section>
      </>
    );
  } else {
    conteudo = <p>Cliente não encontrado.</p>;
  }

  return (
    <div className="w-full px-2 sm:px-4 md:px-8 lg:px-16 xl:px-32 py-4 mx-auto">
      {conteudo}
    </div>
  );
}
