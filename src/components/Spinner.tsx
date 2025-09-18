import React from "react";

export default function Spinner() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <span className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-blue-600"></span>
    </div>
  );
}
