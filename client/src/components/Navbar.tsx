"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            setIsLoggedIn(!!localStorage.getItem("token"));
        };

        checkAuth();
        window.addEventListener("storage", checkAuth);

        return () => window.removeEventListener("storage", checkAuth);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        window.dispatchEvent(new Event("storage"));
    };

    return (
        <nav className="bg-white shadow-md text-black relative z-50">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between items-center h-14">

                    {/* Logo */}
                    <div className="font-bold text-xl">Logo</div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex gap-6">
                        <Link href="/" className="hover:text-gray-600">Home</Link>
                        <Link href="/about" className="hover:text-gray-600">About</Link>
                        <Link href="/teachers" className="hover:text-gray-600">Teachers</Link>
                        {isLoggedIn ? (
                            <button onClick={handleLogout} className="hover:text-red-600 font-medium">Logout</button>
                        ) : (
                            <Link href="/login" className="hover:text-blue-600 font-medium">Admin Login</Link>
                        )}
                    </div>

                    {/* Mobile Button */}
                    <button
                        className="md:hidden text-2xl z-50 relative"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? "✕" : "☰"}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-700 ${open ? "opacity-100 visible" : "opacity-0 invisible"
                    }`}
                onClick={() => setOpen(false)}
            ></div>

            <div
                className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-700 ease-in-out ${open ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <button
                    className="absolute top-4 right-4 text-2xl"
                    onClick={() => setOpen(false)}
                >
                    ✕
                </button>
                <div className="flex flex-col gap-6 p-8 mt-12 bg-white h-full">
                    <Link href="/" className="text-xl font-medium hover:text-gray-600" onClick={() => setOpen(false)}>Home</Link>
                    <Link href="/about" className="text-xl font-medium hover:text-gray-600" onClick={() => setOpen(false)}>About</Link>
                    <Link href="/teachers" className="text-xl font-medium hover:text-gray-600" onClick={() => setOpen(false)}>Teachers</Link>
                    {isLoggedIn ? (
                        <button onClick={() => { handleLogout(); setOpen(false); }} className="text-xl font-medium text-left hover:text-red-600">Logout</button>
                    ) : (
                        <Link href="/login" className="text-xl font-medium hover:text-blue-600" onClick={() => setOpen(false)}>Admin Login</Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
