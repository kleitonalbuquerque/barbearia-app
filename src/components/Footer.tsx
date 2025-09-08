"use client";
export default function Footer() {
  const year = typeof window !== "undefined" ? new Date().getFullYear() : 2025;
  return (
    <footer className="w-full text-center py-4 text-gray-500 dark:text-gray-400 text-sm border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      &copy; {year} Kleiton Bezerra de Albuquerque. Todos os direitos reservados.
    </footer>
  );
}
