"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface TextProps {
    children: React.ReactNode;
    className?: string;
}

export const Heading = ({ children, className }: TextProps) => (
    <h2 className={cn("text-3xl md:text-5xl font-bold tracking-tight text-brand-charcoal", className)}>
        {children}
    </h2>
);

export const Subheading = ({ children, className }: TextProps) => (
    <p className={cn("text-lg md:text-xl text-brand-charcoal/60 font-medium tracking-tight", className)}>
        {children}
    </p>
);

export const SectionTitle = ({ children, className, subtitle }: TextProps & { subtitle?: string }) => (
    <div className={cn("mb-12 space-y-4", className)}>
        {subtitle && (
            <span className="text-brand-gold font-bold tracking-[0.2em] uppercase text-xs">
                {subtitle}
            </span>
        )}
        <Heading>{children}</Heading>
    </div>
);
