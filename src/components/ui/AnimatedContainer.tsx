"use client";

import React from "react";
import { motion, HTMLMotionProps, AnimatePresence } from "framer-motion";

interface AnimatedContainerProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    show?: boolean;
}

export const AnimatedContainer = ({
    children,
    show = true,
    ...props
}: AnimatedContainerProps) => {
    return (
        <AnimatePresence>
            {show && (
                <motion.div {...props}>
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AnimatedContainer;
