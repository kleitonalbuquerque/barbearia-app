import { useEffect, useState } from "react";

export interface Barber {
  id: string;
  name: string;
}

export function useBarbers() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/barbers")
      .then((res) => res.json())
      .then((data) => setBarbers(data.barbers || data.data || []))
      .finally(() => setLoading(false));
  }, []);

  return { barbers, loading };
}
