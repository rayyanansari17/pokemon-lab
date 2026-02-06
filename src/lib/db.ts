import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { PokemonRow, CustomColumn } from './types';

interface PokemonDB extends DBSchema {
    pokemon: {
        key: string;
        value: PokemonRow;
    };
    meta: {
        key: string;
        value: CustomColumn[];
    };
}

const DB_NAME = 'pokemon-research-lab';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<PokemonDB>> | null = null;

function getDB() {
    if (!dbPromise) {
        dbPromise = openDB<PokemonDB>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('pokemon')) {
                    db.createObjectStore('pokemon', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('meta')) {
                    db.createObjectStore('meta');
                }
            },
        });
    }
    return dbPromise;
}

export const db = {
    async getAllPokemon(): Promise<PokemonRow[]> {
        const db = await getDB();
        return db.getAll('pokemon');
    },

    async savePokemon(pokemon: PokemonRow) {
        const db = await getDB();
        return db.put('pokemon', pokemon);
    },

    async bulkSavePokemon(pokemonList: PokemonRow[]) {
        const db = await getDB();
        const tx = db.transaction('pokemon', 'readwrite');
        const store = tx.objectStore('pokemon');
        await Promise.all(pokemonList.map(p => store.put(p)));
        await tx.done;
    },

    async clearPokemon() {
        const db = await getDB();
        return db.clear('pokemon');
    },

    async getCustomColumns(): Promise<CustomColumn[]> {
        const db = await getDB();
        return (await db.get('meta', 'customColumns')) || [];
    },

    async saveCustomColumns(columns: CustomColumn[]) {
        const db = await getDB();
        return db.put('meta', columns, 'customColumns');
    },
};
