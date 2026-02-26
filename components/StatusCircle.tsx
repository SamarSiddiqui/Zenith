"use client";

import React from 'react';
import { motion } from 'framer-motion';

export type StatusType = 'completed' | 'missed' | 'unlogged';

interface StatusCircleProps {
    status: StatusType;
    onClick?: () => void;
    size?: number;
    interactive?: boolean;
}

export function StatusCircle({ status, onClick, size = 32, interactive = true }: StatusCircleProps) {
    const getStyles = () => {
        switch (status) {
            case 'completed':
                return 'bg-zen-primary border-zen-primary';
            case 'missed':
                return 'bg-zen-missed border-zen-missed';
            case 'unlogged':
            default:
                return 'bg-transparent border-zen-text-muted';
        }
    };

    return (
        <motion.button
            whileHover={interactive ? { scale: 1.1 } : {}}
            whileTap={interactive ? { scale: 0.9 } : {}}
            onClick={interactive ? onClick : undefined}
            className={`rounded-full border-2 flex items-center justify-center transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-zen-primary focus:ring-offset-2 ${getStyles()} ${!interactive ? 'cursor-default' : 'cursor-pointer'
                }`}
            style={{ width: size, height: size }}
            aria-label={`Mark habit as ${status}`}>
            {/* Inner animation for state change */}
            <motion.div
                initial={false}
                animate={{
                    scale: status === 'unlogged' ? 0 : 1,
                    opacity: status === 'unlogged' ? 0 : 1,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="w-full h-full rounded-full"
            />
        </motion.button>
    );
}
