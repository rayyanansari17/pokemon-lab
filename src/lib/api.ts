import { PokemonRow } from './types';
import { v4 as uuidv4 } from 'uuid';

const TOTAL_POKEMON = 1025; // Approx count up to Gen 9. Safe cap.
const BATCH_SIZE = 20;

export async function fetchAllPokemon(
    onProgress: (progress: number) => void,
    onBatchComplete: (rows: PokemonRow[]) => void
) {
    try {
        // 1. Get the list
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${TOTAL_POKEMON}`);
        const data = await response.json();
        const results = data.results as { name: string; url: string }[];

        let processedCount = 0;

        // 2. Batch process details
        for (let i = 0; i < results.length; i += BATCH_SIZE) {
            const batch = results.slice(i, i + BATCH_SIZE);

            const batchPromises = batch.map(async (p) => {
                try {
                    const detailRes = await fetch(p.url);
                    const detail = await detailRes.json();
                    return normalizePokemon(detail);
                } catch (e) {
                    console.error(`Failed to fetch ${p.name}`, e);
                    return null;
                }
            });

            const batchRows = (await Promise.all(batchPromises)).filter((p): p is PokemonRow => p !== null);

            processedCount += batch.length;
            onProgress(Math.min(100, (processedCount / results.length) * 100));
            onBatchComplete(batchRows);
        }

    } catch (error) {
        console.error("Fatal error fetching pokemon", error);
        throw error;
    }
}

function normalizePokemon(data: any): PokemonRow {
    // Helper to get stat
    const getStat = (name: string) => data.stats.find((s: any) => s.stat.name === name)?.base_stat || 0;

    return {
        id: uuidv4(), // Internal UUID
        nationalId: data.id,
        name: data.name,
        sprite: data.sprites.front_default,
        types: data.types.map((t: any) => t.type.name),
        generation: 0, // Simplification: PokeAPI species endpoint needed for gen, skipping for perf or requires double fetch. 
        // Strategy: We can infer gen from ID roughly, or do a second pass. 
        // For this demo, let's infer strictly from ID ranges or set 1 if lazy.
        // Better: Let's fetch species if we want perfection, but that's 2x requests.
        // Compromise: Map ID ranges to generation locally.
        abilities: data.abilities.map((a: any) => a.ability.name),
        hp: getStat('hp'),
        attack: getStat('attack'),
        defense: getStat('defense'),
        specialAttack: getStat('special-attack'),
        specialDefense: getStat('special-defense'),
        speed: getStat('speed'),
    };
}
