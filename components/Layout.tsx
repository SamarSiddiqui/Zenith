"use client";

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu, X } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
    userName: string;
}

export function Layout({ children, userName }: LayoutProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-zen-bg flex overflow-hidden">
            {/* Mobile Menu Button */}
            <button
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-zen-surface rounded-lg shadow-sm border border-zen-border text-zen-text-primary"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? (
                    <X className="w-6 h-6 stroke-[1.5]" />
                ) : (
                    <Menu className="w-6 h-6 stroke-[1.5]" />
                )}
            </button>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <Sidebar
                onCloseMobile={() => setIsMobileMenuOpen(false)}
                userName={userName}
                isOpen={isMobileMenuOpen}
            />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto h-screen w-full relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 md:py-12 mt-12 md:mt-0">
                    {children}
                </div>
            </main>
        </div>
    );
}
