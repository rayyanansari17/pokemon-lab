"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePokemonStore } from "@/store/usePokemonStore";
import { ColumnType } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

interface AddColumnDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AddColumnDialog({ isOpen, onClose }: AddColumnDialogProps) {
    const addCustomColumn = usePokemonStore((state) => state.addCustomColumn);
    const [label, setLabel] = useState("");
    const [type, setType] = useState<ColumnType>("text");
    const [defaultValue, setDefaultValue] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!label) return;

        await addCustomColumn({
            id: uuidv4(),
            label,
            type,
            defaultValue: type === 'number' ? Number(defaultValue) : defaultValue,
        });

        setLabel("");
        setDefaultValue("");
        onClose();
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Add New Column">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Column Name</label>
                    <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Nickname" />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Data Type</label>
                    <div className="flex gap-2">
                        {(['text', 'number', 'boolean'] as const).map(t => (
                            <Button
                                key={t}
                                type="button"
                                variant={type === t ? 'default' : 'outline'}
                                onClick={() => setType(t)}
                                className="capitalize flex-1"
                            >
                                {t}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Default Value</label>
                    <Input
                        value={defaultValue}
                        onChange={(e) => setDefaultValue(e.target.value)}
                        placeholder={type === 'number' ? '0' : 'Default text...'}
                        type={type === 'number' ? 'number' : 'text'}
                    />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Create Column</Button>
                </div>
            </form>
        </Dialog>
    );
}
