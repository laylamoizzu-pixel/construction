"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function SpotlightCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = ({ currentTarget, clientX, clientY }: React.MouseEvent) => {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    };

    return (
        <div
            onMouseMove={handleMouseMove}
            className={`group relative overflow-hidden bg-brand-charcoal ${className}`}
        >
            <motion.div
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-500 group-hover:opacity-100"
                style={{
                    background: `radial-gradient(1000px circle at ${mouseX}px ${mouseY}px, rgba(197, 160, 89, 0.08), transparent 40%)`,
                }}
            />
            {children}
        </div>
    );
}
