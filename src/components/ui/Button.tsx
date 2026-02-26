"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "glass" | "ghost";
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
    children: React.ReactNode;
}

export const Button = ({
    variant = "primary",
    size = "md",
    className,
    children,
    ...props
}: ButtonProps) => {
    // Filter out motion-specific props that conflict with HTML button props
    const {
        onDrag, onDragStart, onDragEnd, onPointerDown,
        whileHover, whileTap,
        ...buttonProps
    } = props as any;

    const variants = {
        primary: "bg-brand-charcoal text-brand-white hover:bg-opacity-90",
        secondary: "bg-brand-gold text-brand-white hover:bg-opacity-90",
        outline: "bg-transparent border border-brand-charcoal text-brand-charcoal hover:bg-brand-charcoal hover:text-brand-white",
        glass: "glass-panel bg-white/10 text-brand-charcoal hover:bg-white/20",
        ghost: "bg-transparent text-brand-charcoal hover:bg-brand-charcoal/5",
    };

    const sizes = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg font-semibold",
        xl: "px-10 py-5 text-xl font-bold",
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
                "group relative inline-flex items-center justify-center rounded-full transition-all duration-500 font-bold overflow-hidden isolation-auto",
                variants[variant],
                sizes[size],
                className
            )}
            {...buttonProps}
        >
            <span className="relative z-10">{children}</span>
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"
                initial={false}
            />
        </motion.button>
    );
};
