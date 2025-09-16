export default function SobrePage() {
  return (
    <div
      className="max-w-2xl mx-auto py-12 px-4 rounded shadow"
      style={{ background: "#fff", color: "var(--text)" }}
    >
      <h1
        className="text-3xl font-bold mb-6"
        style={{ color: "var(--accent)" }}
      >
        Bem-vindo ao sistema de gestão da barbearia!
      </h1>
      <ul className="list-disc pl-6 space-y-2 text-lg" style={{ color: "var(--text)" }}>
        <li>Gerencie <b>agendamentos</b> de clientes e profissionais de forma simples e rápida.</li>
        <li>Visualize e filtre <b>serviços</b>, <b>clientes</b> e <b>profissionais</b> cadastrados.</li>
        <li>Controle o <b>status</b> dos agendamentos: agendado, concluído ou cancelado.</li>
        <li>Utilize o menu <b>Financeiro</b> (Admin) para acompanhar o faturamento, exportar relatórios e visualizar gráficos de receita por profissional.</li>
        <li>Faça buscas rápidas e utilize filtros por período em todas as telas principais.</li>
        <li>O sistema é seguro, responsivo e fácil de usar!</li>
      </ul>
      <div className="mt-8">
        <p style={{ color: "var(--text)" }}>Para dúvidas ou sugestões, entre em contato com o administrador do sistema.</p>
      </div>
    </div>
  );
}
