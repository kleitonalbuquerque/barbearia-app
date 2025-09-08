import { useEffect, useState } from "react";

export interface ServiceType {
  id: string;
  name: string;
  priceCents: number;
  durationMinutes: number;
}

export function useServiceTypes() {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => setServiceTypes(data.services || data.serviceTypes || []))
      .finally(() => setLoading(false));
  }, []);

  return { serviceTypes, loading };
}
