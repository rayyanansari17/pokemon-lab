import { create } from 'zustand';
import { PokemonRow, CustomColumn, AppStatus } from '@/lib/types';
import { db } from '@/lib/db';

interface PokemonState {
    // State
    rows: PokemonRow[];
    customColumns: CustomColumn[];
    status: AppStatus;
    progress: number; // 0-100
    searchQuery: string;

    // Actions
    setSearchQuery: (query: string) => void;
    setRows: (rows: PokemonRow[]) => Promise<void>;
    updateRow: (id: string, updates: Partial<PokemonRow>) => Promise<void>;
    upsertRows: (rows: PokemonRow[]) => Promise<void>;
    addCustomColumn: (column: CustomColumn) => Promise<void>;
    initialize: () => Promise<void>;
    setStatus: (status: AppStatus) => void;
    setProgress: (progress: number) => void;
}

export const usePokemonStore = create<PokemonState>((set, get) => ({
    rows: [],
    customColumns: [],
    status: 'IDLE',
    progress: 0,
    searchQuery: '',

    setSearchQuery: (query) => set({ searchQuery: query }),

    setRows: async (rows) => {
        set({ rows });
        // Background persist check could happen here if needed, 
        // but for bulk loads we mostly rely on external callers handling logic
    },

    updateRow: async (id, updates) => {
        const { rows } = get();
        const rowIndex = rows.findIndex((r) => r.id === id);
        if (rowIndex === -1) return;

        const updatedRow = { ...rows[rowIndex], ...updates };
        const newRows = [...rows];
        newRows[rowIndex] = updatedRow;

        set({ rows: newRows });
        await db.savePokemon(updatedRow);
    },

    upsertRows: async (newRows) => {
        // This handles bulk additions/updates
        const { rows } = get();
        const rowsMap = new Map(rows.map(r => [r.id, r]));

        newRows.forEach(r => {
            rowsMap.set(r.id, r);
        });

        const mergedRows = Array.from(rowsMap.values());
        set({ rows: mergedRows });
        await db.bulkSavePokemon(newRows);
    },

    addCustomColumn: async (column) => {
        const { customColumns, rows } = get();
        const newColumns = [...customColumns, column];

        // Initialize default value for all rows
        const newRows = rows.map(row => ({
            ...row,
            [column.id]: row[column.id] ?? column.defaultValue
        }));

        set({ customColumns: newColumns, rows: newRows });
        await db.saveCustomColumns(newColumns);
        await db.bulkSavePokemon(newRows);
    },

    setStatus: (status) => set({ status }),
    setProgress: (progress) => set({ progress }),

    initialize: async () => {
        // Load from DB on startup
        set({ status: 'FETCHING', progress: 0 });
        try {
            const [storedRows, storedCols] = await Promise.all([
                db.getAllPokemon(),
                db.getCustomColumns()
            ]);

            if (storedRows.length > 0) {
                set({
                    rows: storedRows,
                    customColumns: storedCols,
                    status: 'READY'
                });
            } else {
                set({ status: 'IDLE' }); // Needs fetching
            }
        } catch (e) {
            console.error("Failed to initialize DB", e);
            set({ status: 'ERROR' });
        }
    },
}));
