"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    const eventSource = new EventSource("/api/code");

    eventSource.onmessage = (event) => {
      try {
        const { id } = JSON.parse(event.data);
        setIds((prev) => [id, ...prev]);
      } catch {
        // ignore malformed events
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <h1 className="text-3xl font-bold">IDs recibidos</h1>

      {ids.length === 0 ? (
        <p className="text-default-400 text-sm">
          Esperando IDs… Prueba con{" "}
          <code className="text-primary">/api/code?id=123</code>
        </p>
      ) : (
        <ul className="flex flex-col gap-2 w-full max-w-md">
          {ids.map((id, i) => (
            <li
              key={`${id}-${i}`}
              className="bg-content1 border border-divider rounded-xl px-4 py-3 font-mono text-sm"
            >
              {id}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
