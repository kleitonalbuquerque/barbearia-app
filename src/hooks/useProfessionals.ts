import { useEffect, useState } from "react";

export interface Professional {
  id: string;
  name: string;
}

export function useProfessionals() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/professionals")
      .then((res) => res.json())
      .then((data) => setProfessionals(data.professionals || data.data || []))
      .finally(() => setLoading(false));
  }, []);

  return { professionals, loading };
}
