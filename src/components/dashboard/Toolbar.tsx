"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download, Upload, Plus, Trash2 } from "lucide-react";
import { usePokemonStore } from "@/store/usePokemonStore";
import { ProgressBar } from "./ProgressBar";
import { AddColumnDialog } from "./AddColumnDialog";
import { CsvUploadDialog } from "./CsvUploadDialog";
import Papa from "papaparse";

export function Toolbar() {
    const searchQuery = usePokemonStore((state) => state.searchQuery);
    const setSearchQuery = usePokemonStore((state) => state.setSearchQuery);
    const progress = usePokemonStore((state) => state.progress);
    const status = usePokemonStore((state) => state.status);

    const [isAddColumnOpen, setIsAddColumnOpen] = React.useState(false);
    const [isUploadOpen, setIsUploadOpen] = React.useState(false);

    const isFetching = status === 'FETCHING';

    const handleExport = () => {
        const rows = usePokemonStore.getState().rows;
        const csv = Papa.unparse(rows);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'pokemon_data.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col border-b bg-background/50 backdrop-blur-xl sticky top-0 z-10 transition-all">
            <div className="flex h-14 items-center gap-4 px-6">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, type, ability..."
                        className="pl-9 bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-ring transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex-1" />

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsUploadOpen(true)}>
                        <Upload className="h-4 w-4" />
                        Import CSV
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                    <div className="h-4 w-px bg-border mx-2" />
                    <Button size="sm" className="gap-2" onClick={() => setIsAddColumnOpen(true)}>
                        <Plus className="h-4 w-4" />
                        Add Column
                    </Button>
                </div>
            </div>

            {isFetching && (
                <div className="px-0">
                    <ProgressBar progress={progress} className="h-0.5 rounded-none" />
                </div>
            )}

            <AddColumnDialog isOpen={isAddColumnOpen} onClose={() => setIsAddColumnOpen(false)} />
            <CsvUploadDialog isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
        </div>
    );
}
