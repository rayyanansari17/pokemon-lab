export type PokemonRow = {
    id: string; // Internal UUID
    nationalId: number; // Pokédex number

    // Read-only specs
    name: string;
    sprite: string | null;
    types: string[]; // e.g. ["Grass", "Poison"]
    generation: number;
    abilities: string[];

    // Editable stats
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;

    // Dynamic user-defined columns
    [key: string]: string | number | boolean | string[] | null | undefined;
};

export type ColumnType = "text" | "number" | "boolean" | "select";

export type CustomColumn = {
    id: string;
    label: string;
    type: ColumnType;
    defaultValue: any;
};

export type AppStatus = "IDLE" | "FETCHING" | "MIGRATING" | "READY" | "ERROR";
