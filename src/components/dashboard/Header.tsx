"use client";

import Image from "next/image";
import { usePokemonStore } from "@/store/usePokemonStore";
import { cn } from "@/lib/utils";

export function Header() {
    const status = usePokemonStore((state) => state.status);
    const rows = usePokemonStore((state) => state.rows);

    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-6 bg-background">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    <Image
                        src="/pokemon.png"
                        alt="Pokemon Lab Logo"
                        width={28}
                        height={28}
                        className="object-contain shrink-0"
                    />
                    <h1 className="text-lg font-semibold tracking-tight truncate">Pokémon Research Lab</h1>
                </div>
                <div className="hidden sm:block h-4 w-px bg-border" />
                <span className="hidden sm:inline text-sm text-muted-foreground whitespace-nowrap">
                    v1.0.0
                </span>
            </div>

            <div className="flex items-center gap-4 text-sm font-medium">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <span>Status:</span>
                    <span className={cn(
                        "uppercase",
                        status === "READY" && "text-emerald-500",
                        status === "FETCHING" && "text-amber-500",
                        status === "ERROR" && "text-destructive"
                    )}>
                        {status}
                    </span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Total Records:</span>
                    <span>{rows.length.toLocaleString()}</span>
                </div>
            </div>
        </header>
    );
}
