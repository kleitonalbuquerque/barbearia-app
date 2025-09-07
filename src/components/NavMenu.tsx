"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { label: "Dashboard", href: "/" },
  { label: "Clientes", href: "/clientes" },
  { label: "Barbeiros", href: "/barbeiros" },
  { label: "Serviços", href: "/servicos" },
  { label: "Agendamentos", href: "/agendamentos" },
  { label: "Formas de Pagamento", href: "/pagamentos" },
];

export default function NavMenu() {
  const pathname = usePathname();
  return (
    <nav className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-xl font-bold text-blue-700 dark:text-blue-400 tracking-tight">BarbeariaApp</span>
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-base font-medium px-2 py-1 rounded transition-colors ${
                  pathname === item.href
                    ? "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-gray-800"
                    : "text-gray-700 dark:text-gray-200 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            {/* Admin dropdown/avatar */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                <span className="hidden sm:inline">Admin</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-50">
                <Link href="/admin/usuarios" className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">Gerenciar Usuários</Link>
                <Link href="/admin/configuracoes" className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">Configurações</Link>
                <button className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">Sair</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
