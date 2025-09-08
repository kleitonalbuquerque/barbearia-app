"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons';

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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();

  return (
    <nav className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between w-full">
          {/* Mobile menu button */}
          <button
            className="lg:hidden flex items-center justify-center p-2 rounded text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
            onClick={() => setDrawerOpen(!drawerOpen)}
            aria-label="Abrir menu"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-6">
            <span className="text-xl font-bold text-blue-700 dark:text-blue-400 tracking-tight">BarbeariaApp</span>
            <div className="hidden lg:flex items-center gap-6">
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
          </div>
          <div className="flex items-center gap-4">
            {/* Menu condicional: Admin ou Entrar */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                  <span className="hidden sm:inline">Admin</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-50">
                  <Link href="/admin/usuarios" className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">Gerenciar Usuários</Link>
                  <Link href="/admin/configuracoes" className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">Configurações</Link>
                  <button className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => { logout(); router.push("/login"); }}>Sair</button>
                </div>
              </div>
            ) : (
              <button
                className="flex items-center gap-2 px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
                onClick={() => router.push("/login")}
              >
                <FontAwesomeIcon icon={faSignInAlt} />
                <span className="hidden sm:inline">Entrar</span>
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Drawer menu para mobile/tablet */}
      <div
        className={`fixed inset-0 z-50 bg-black bg-opacity-40 transition-opacity ${drawerOpen ? "block" : "hidden"} lg:hidden`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 shadow-lg z-50 transform transition-transform duration-200 ease-in-out ${drawerOpen ? "translate-x-0" : "-translate-x-full"} lg:hidden`}
        aria-label="Menu lateral"
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
          <span className="text-xl font-bold text-blue-700 dark:text-blue-400 tracking-tight">BarbeariaApp</span>
          <button
            className="p-2 rounded text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setDrawerOpen(false)}
            aria-label="Fechar menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex flex-col gap-2 p-4">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-base font-medium px-3 py-2 rounded transition-colors ${
                pathname === item.href
                  ? "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-gray-800"
                  : "text-gray-700 dark:text-gray-200 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800"
              }`}
              onClick={() => setDrawerOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
              <span className="block text-xs text-gray-500 dark:text-gray-400 mb-2">Admin</span>
              <Link href="/admin/usuarios" className="block px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">Gerenciar Usuários</Link>
              <Link href="/admin/configuracoes" className="block px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">Configurações</Link>
              <button className="w-full text-left px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded" onClick={() => { logout(); setDrawerOpen(false); router.push("/login"); }}>Sair</button>
            </div>
          ) : (
            <button
              className="flex items-center gap-2 px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold transition w-full mt-4"
              onClick={() => {
                setDrawerOpen(false);
                router.push("/login");
              }}
            >
              <FontAwesomeIcon icon={faSignInAlt} />
              <span className="hidden sm:inline">Entrar</span>
            </button>
          )}
        </nav>
      </aside>
    </nav>
  );
}
