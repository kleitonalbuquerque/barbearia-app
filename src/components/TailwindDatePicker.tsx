import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "@/styles/datepicker-overrides.css";
import { registerLocale } from "react-datepicker";
import { ptBR } from "date-fns/locale/pt-BR";
registerLocale("pt-BR", ptBR);

interface TailwindDatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  id?: string;
  inputClassName?: string;
}

export default function TailwindDatePicker({ value, onChange, placeholder, id, inputClassName }: TailwindDatePickerProps) {
  return (
    <div className="relative">
      <DatePicker
        id={id}
        selected={value}
        onChange={onChange}
        className={inputClassName || "p-2 border rounded w-full text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-400"}
        placeholderText={placeholder}
        showTimeSelect
        timeFormat="HH:mm"
        timeIntervals={15}
        dateFormat="dd/MM/yyyy HH:mm"
        locale="pt-BR"
        calendarClassName="!bg-white dark:!bg-gray-900 !border-gray-300 dark:!border-gray-700"
        popperClassName="z-50"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5v-1.125A2.625 2.625 0 019.375 3.75h5.25a2.625 2.625 0 012.625 2.625V7.5m-12 0h13.5m-13.5 0A2.25 2.25 0 003 9.75v8.625A2.625 2.625 0 005.625 21h12.75A2.625 2.625 0 0021 18.375V9.75a2.25 2.25 0 00-2.25-2.25m-13.5 0V5.625m13.5 1.875V5.625" />
        </svg>
      </span>
    </div>
  );
}
