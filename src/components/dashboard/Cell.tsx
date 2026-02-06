"use client";

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface CellProps {
    value: any;
    rowId: string;
    columnId: string;
    type: 'text' | 'number' | 'boolean' | 'select'; // basic mapping
    onUpdate: (value: any) => void;
    isEditable?: boolean;
}

export function Cell({ value, rowId, columnId, type, onUpdate, isEditable = true }: CellProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [localValue, setLocalValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleCommit = () => {
        if (localValue !== value) {
            if (type === 'number') {
                onUpdate(Number(localValue));
            } else {
                onUpdate(localValue);
            }
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleCommit();
        } else if (e.key === 'Escape') {
            setLocalValue(value);
            setIsEditing(false);
        }
    };

    if (!isEditable) {
        // Specialized rendering for non-editable columns
        if (columnId === 'sprite' && typeof value === 'string') {
            return <img src={value} alt="sprite" className="h-8 w-8 object-contain" loading="lazy" />;
        }
        if (columnId === 'types' && Array.isArray(value)) {
            return (
                <div className="flex gap-1">
                    {value.map((t: string) => (
                        <span key={t} className="px-1.5 py-0.5 bg-muted rounded text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{t}</span>
                    ))}
                </div>
            );
        }
        return <div className="truncate px-2 py-1 text-sm">{value}</div>;
    }

    if (isEditing) {
        return (
            <Input
                ref={inputRef}
                value={localValue ?? ''}
                onChange={(e) => setLocalValue(e.target.value)}
                onBlur={handleCommit}
                onKeyDown={handleKeyDown}
                className="h-8 rounded-none border-0 px-2 py-1 focus-visible:ring-1 focus-visible:ring-inset text-sm"
            />
        );
    }

    return (
        <div
            onClick={() => setIsEditing(true)}
            className={cn(
                "cursor-text h-full w-full flex items-center px-2 py-1 text-sm truncate min-h-[32px]",
                value === null || value === '' ? 'text-muted-foreground italic' : ''
            )}
        >
            {value ?? '—'}
        </div>
    );
}
