"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    glass?: boolean;
}

export const Card = ({
    children,
    className,
    hover = true,
    glass = true,
}: CardProps) => {
    return (
        <motion.div
            whileHover={hover ? { y: -10, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } : {}}
            className={cn(
                "rounded-2xl overflow-hidden transition-all duration-500 border border-brand-silver/50",
                glass ? "glass-panel" : "bg-white",
                hover && "hover:shadow-premium hover:border-brand-gold/30",
                className
            )}
        >
            {children}
        </motion.div>
    );
};

export const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={cn("p-6", className)}>{children}</div>
);

export const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={cn("p-6 pt-0", className)}>{children}</div>
);

export const CardFooter = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={cn("p-6 pt-0 mt-auto", className)}>{children}</div>
);
