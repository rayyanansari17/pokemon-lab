"use client";

import { useEffect, useRef } from "react";
import { Header } from "@/components/dashboard/Header";
import { Toolbar } from "@/components/dashboard/Toolbar";
import { DataTable } from "@/components/dashboard/DataTable";
import { usePokemonStore } from "@/store/usePokemonStore";
import { fetchAllPokemon } from "@/lib/api";

export default function Home() {
  const initialize = usePokemonStore((state) => state.initialize);
  const setStatus = usePokemonStore((state) => state.setStatus);
  const setProgress = usePokemonStore((state) => state.setProgress);
  const upsertRows = usePokemonStore((state) => state.upsertRows);
  const status = usePokemonStore((state) => state.status);

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    initialize().then(() => {
      // Double check status after IDB load
      const currentStatus = usePokemonStore.getState().status;
      if (currentStatus === 'IDLE' || usePokemonStore.getState().rows.length === 0) {
        // Start fetch
        setStatus('FETCHING');
        fetchAllPokemon(
          (progress) => setProgress(progress),
          (batch) => {
            upsertRows(batch);
          }
        ).then(() => {
          setStatus('READY');
        }).catch((err) => {
          console.error("Initialization fetch failed:", err);
          setStatus('ERROR');
        });
      }
    });
  }, [initialize, setStatus, setProgress, upsertRows]);

  if (status === 'ERROR') {
    return (
      <main className="flex h-screen flex-col items-center justify-center bg-background text-foreground space-y-4">
        <div className="text-destructive text-4xl font-bold">Connection Error</div>
        <p className="text-muted-foreground">Failed to download Pokémon data from PokeAPI.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
        >
          Retry
        </button>
      </main>
    );
  }

  return (
    <main className="flex h-screen flex-col bg-background text-foreground">
      <Header />
      <Toolbar />
      <div className="flex-1 overflow-hidden relative">
        <DataTable />
      </div>
    </main>
  );
}
