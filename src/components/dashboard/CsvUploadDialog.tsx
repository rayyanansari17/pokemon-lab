"use client";

import { useState, useRef } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Papa from "papaparse";
import { usePokemonStore } from "@/store/usePokemonStore";
import { PokemonRow } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { Upload } from "lucide-react";

interface CsvUploadDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CsvUploadDialog({ isOpen, onClose }: CsvUploadDialogProps) {
    const upsertRows = usePokemonStore((state) => state.upsertRows);
    const addCustomColumn = usePokemonStore((state) => state.addCustomColumn);

    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string[]>([]); // Headers only
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            // Preview headers
            Papa.parse(e.target.files[0], {
                preview: 1,
                header: true,
                complete: (results) => {
                    if (results.meta.fields) {
                        setPreview(results.meta.fields);
                    }
                }
            });
        }
    };

    const handleImport = () => {
        if (!file) return;
        setIsProcessing(true);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true, // Auto-convert numbers/booleans
            complete: async (results) => {
                const { data, meta } = results;

                // 1. Identify new columns NOT in base schema
                // Simplification: We assume CSV headers match our schema or are new custom columns.
                // In a real app, we'd have a mapping step. Here we auto-map.

                const baseKeys = ['id', 'nationalId', 'name', 'sprite', 'types', 'generation', 'abilities', 'hp', 'attack', 'defense', 'specialAttack', 'specialDefense', 'speed'];
                const newCols = (meta.fields || []).filter(f => !baseKeys.includes(f));

                // Create new columns on the fly
                for (const col of newCols) {
                    // Infer type from first row if possible, else string
                    const sample = (data[0] as any)?.[col];
                    const type = typeof sample === 'number' ? 'number' : typeof sample === 'boolean' ? 'boolean' : 'text';

                    await addCustomColumn({
                        id: col,
                        label: col, // Use header as label
                        type: type as any,
                        defaultValue: null,
                    });
                }

                // 2. Normalize and Upsert
                const newRows = (data as any[]).map((row: any) => {
                    return {
                        ...row,
                        id: row.id || uuidv4(), // Generate ID if missing
                        nationalId: Number(row.nationalId) || 0,
                        types: Array.isArray(row.types) ? row.types : (typeof row.types === 'string' ? row.types.split(',') : []),
                        // Spread rest
                    } as PokemonRow;
                });

                await upsertRows(newRows);
                setIsProcessing(false);
                setFile(null);
                setPreview([]);
                onClose();
            },
            error: (err) => {
                console.error(err);
                setIsProcessing(false);
            }
        });
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Import CSV Dataset">
            <div className="space-y-4">
                <div
                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Click to select CSV file</p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </div>

                {file && (
                    <div className="text-sm">
                        <p className="font-medium">Selected: {file.name}</p>
                        <div className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-24">
                            <p className="font-semibold mb-1">Detected Columns:</p>
                            <div className="flex flex-wrap gap-1">
                                {preview.map(h => (
                                    <span key={h} className="px-1 py-0.5 bg-background border rounded">{h}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="ghost" onClick={onClose} disabled={isProcessing}>Cancel</Button>
                    <Button onClick={handleImport} disabled={!file || isProcessing}>
                        {isProcessing ? 'Importing...' : 'Import Dataset'}
                    </Button>
                </div>
            </div>
        </Dialog>
    );
}
