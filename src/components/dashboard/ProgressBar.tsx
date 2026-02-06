"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
    progress: number; // 0 to 100
    className?: string;
}

export function ProgressBar({ progress, className }: ProgressBarProps) {
    return (
        <div className={cn("h-2 w-full overflow-hidden rounded-full bg-secondary", className)}>
            <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.2 }}
            />
        </div>
    );
}
