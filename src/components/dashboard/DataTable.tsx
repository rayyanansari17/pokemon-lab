"use client";

import React, { useRef, useMemo, useState } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    ColumnDef,
    flexRender,
    SortingState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { usePokemonStore } from '@/store/usePokemonStore';
import { PokemonRow } from '@/lib/types';
import { Cell } from './Cell';
import { cn } from '@/lib/utils';
import { ArrowUpDown } from 'lucide-react';

export function DataTable() {
    const rows = usePokemonStore((state) => state.rows);
    const updateRow = usePokemonStore((state) => state.updateRow);
    const customColumns = usePokemonStore((state) => state.customColumns);
    const searchQuery = usePokemonStore((state) => state.searchQuery);

    const [sorting, setSorting] = useState<SortingState>([]);

    // Filter rows based on search query
    const filteredRows = useMemo(() => {
        if (!searchQuery) return rows;
        const lowerQuery = searchQuery.toLowerCase();
        return rows.filter((row) =>
            row.name.toLowerCase().includes(lowerQuery) ||
            row.types.some(t => t.toLowerCase().includes(lowerQuery)) ||
            row.nationalId.toString().includes(lowerQuery)
        );
    }, [rows, searchQuery]);

    // Define Columns
    const columns = useMemo<ColumnDef<PokemonRow>[]>(() => {
        const baseCols: ColumnDef<PokemonRow>[] = [
            {
                accessorKey: 'nationalId',
                header: 'ID',
                size: 60,
                enableSorting: true,
            },
            {
                accessorKey: 'sprite',
                header: '',
                size: 50,
                enableSorting: false,
            },
            {
                accessorKey: 'name',
                header: 'Name',
                size: 150,
                enableSorting: true,
            },
            {
                accessorKey: 'types',
                header: 'Types',
                size: 140,
                enableSorting: false, // Custom sort needed for arrays, skipping for now
            },
            {
                accessorKey: 'hp',
                header: 'HP',
                size: 80,
            },
            {
                accessorKey: 'attack',
                header: 'Atk',
                size: 80,
            },
            {
                accessorKey: 'defense',
                header: 'Def',
                size: 80,
            },
            {
                accessorKey: 'specialAttack',
                header: 'SpA',
                size: 80,
            },
            {
                accessorKey: 'specialDefense',
                header: 'SpD',
                size: 80,
            },
            {
                accessorKey: 'speed',
                header: 'Spd',
                size: 80,
            },
        ];

        // Add custom columns
        const dynamicCols: ColumnDef<PokemonRow>[] = customColumns.map(col => ({
            accessorKey: col.id,
            header: col.label,
            size: 120,
        }));

        return [...baseCols, ...dynamicCols];
    }, [customColumns]);

    const table = useReactTable({
        data: filteredRows,
        columns,
        state: {
            sorting,
            columnPinning: {
                left: ['nationalId', 'sprite', 'name'],
                right: [], // Add 'actions' later if needed
            },
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        defaultColumn: {
            size: 100, // starting column size
        },
    });

    const { rows: tableRows } = table.getRowModel();

    // Virtualization
    const parentRef = useRef<HTMLDivElement>(null);

    const rowVirtualizer = useVirtualizer({
        count: tableRows.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 40, // Row height
        overscan: 10,
    });

    return (
        <div ref={parentRef} className="h-full w-full overflow-auto bg-background">
            <div
                style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                }}
                className="min-w-fit"
            >
                {/* Sticky Header */}
                <div className="sticky top-0 z-10 grid w-full bg-muted/90 backdrop-blur border-b border-border dark:border-white/10 text-sm font-medium text-muted-foreground shadow-sm"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: columns.map(c => `${c.size}px`).join(' '),
                    }}
                >
                    {table.getHeaderGroups().map(headerGroup => (
                        <React.Fragment key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <div
                                    key={header.id}
                                    className="flex items-center px-2 py-2 cursor-pointer hover:bg-muted-foreground/10 bg-muted/90 backdrop-blur"
                                    onClick={header.column.getToggleSortingHandler()}
                                    style={{
                                        width: header.column.getSize(),
                                        position: header.column.getIsPinned() ? 'sticky' : 'relative',
                                        left: header.column.getIsPinned() === 'left' ? `${header.column.getStart('left')}px` : undefined,
                                        right: header.column.getIsPinned() === 'right' ? `${header.column.getAfter('right')}px` : undefined,
                                        zIndex: header.column.getIsPinned() ? 10 : 0,
                                    }}
                                >
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                    {{
                                        asc: <ArrowUpDown className="ml-2 h-3 w-3 rotate-180" />,
                                        desc: <ArrowUpDown className="ml-2 h-3 w-3" />,
                                    }[header.column.getIsSorted() as string] ?? (
                                            header.column.getCanSort() ? <ArrowUpDown className="ml-1 h-3 w-3 opacity-30" /> : null
                                        )}
                                </div>
                            ))}
                        </React.Fragment>
                    ))}
                </div>

                {/* Rows */}
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const row = tableRows[virtualRow.index];
                    return (
                        <div
                            key={row.id}
                            data-index={virtualRow.index}
                            ref={rowVirtualizer.measureElement}
                            className={cn(
                                "absolute left-0 top-0 flex w-full border-b border-border dark:border-white/5 transition-colors hover:bg-muted/50",
                                // Alternate Row Colors for easier reading? Maybe too noisy for dark mode. Sticking to simple hover.
                            )}
                            style={{
                                top: 0,
                                transform: `translateY(${virtualRow.start}px)`,
                                height: `${virtualRow.size}px`,
                                // Grid layout for cells
                                display: 'grid',
                                gridTemplateColumns: columns.map(c => `${c.size}px`).join(' '),
                            }}
                        >
                            {row.getVisibleCells().map((cell) => {
                                const isEditable = !['id', 'nationalId', 'name', 'sprite', 'types', 'generation', 'abilities'].includes(cell.column.id);
                                const isPinned = cell.column.getIsPinned();
                                return (
                                    <div
                                        key={cell.id}
                                        className={cn(
                                            "relative h-full border-r last:border-r-0 border-border dark:border-white/5",
                                            isPinned && "bg-background border-r border-border dark:border-white/10" // ensure background covers scrolling content
                                        )}
                                        style={{
                                            position: isPinned ? 'sticky' : 'relative',
                                            left: isPinned === 'left' ? `${cell.column.getStart('left')}px` : undefined,
                                            right: isPinned === 'right' ? `${cell.column.getAfter('right')}px` : undefined,
                                            zIndex: isPinned ? 1 : 0,
                                            width: cell.column.getSize(),
                                        }}
                                    >
                                        <Cell
                                            value={cell.getValue()}
                                            rowId={row.original.id}
                                            columnId={cell.column.id}
                                            type={typeof cell.getValue() === 'number' ? 'number' : 'text'}
                                            isEditable={isEditable}
                                            onUpdate={(val) => updateRow(row.original.id, { [cell.column.id]: val })}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}

                {tableRows.length === 0 && (
                    <div className="absolute top-12 left-0 w-full flex justify-center py-12 text-muted-foreground">
                        No Pokémon found.
                    </div>
                )}
            </div>
        </div>
    );
}
