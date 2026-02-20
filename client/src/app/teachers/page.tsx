"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { api, Teacher } from "@/lib/api";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

function TeachersDirectoryContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        console.log("BACKEND_URL", teachers);
    }, [teachers]);

    useEffect(() => {
        setIsAdmin(!!localStorage.getItem("token"));

        const handleStorageChange = () => {
            setIsAdmin(!!localStorage.getItem("token"));
        };
        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    const currentLetter = searchParams.get("lastNameStartsWith") || "";
    const currentSubject = searchParams.get("subject") || "";

    const [subjectInput, setSubjectInput] = useState(currentSubject);

    const loadTeachers = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const params = new URLSearchParams();
            if (currentLetter) params.append("lastNameStartsWith", currentLetter);
            if (currentSubject) params.append("subject", currentSubject);

            const res = await api.get(`/teachers?${params.toString()}`);
            setTeachers(res.data.data || []);
        } catch (err) {
            console.error(err);
            setError("Failed to load teachers.");
        } finally {
            setLoading(false);
        }
    }, [currentLetter, currentSubject]);

    useEffect(() => {
        loadTeachers();
    }, [loadTeachers]);

    const updateFilters = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 mt-4 gap-4">
                <h1 className="text-3xl font-bold">Teachers Directory</h1>
                <div className="flex gap-3">
                    {isAdmin && (
                        <Link href="/import">
                            <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg transition-colors font-medium shadow-sm">
                                Bulk Import
                            </button>
                        </Link>
                    )}
                    <Link href="/teachers/new">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-colors font-medium shadow-sm">
                            + Add New Teacher
                        </button>
                    </Link>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6 space-y-4">
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Filter by Last Name</h3>
                    <div className="flex flex-wrap gap-1">
                        <button
                            onClick={() => updateFilters("lastNameStartsWith", "")}
                            className={`px-3 py-1 text-sm rounded transition-colors ${!currentLetter ? "bg-blue-600 text-white shadow-sm" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                        >
                            All
                        </button>
                        {letters.map((letter) => (
                            <button
                                key={letter}
                                onClick={() => updateFilters("lastNameStartsWith", letter)}
                                className={`w-8 h-8 flex items-center justify-center text-sm rounded transition-colors ${currentLetter === letter ? "bg-blue-600 text-white shadow-sm" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                            >
                                {letter}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Filter by Subject</h3>
                    <div className="flex max-w-md gap-2">
                        <input
                            type="text"
                            placeholder="e.g. Mathematics"
                            className="flex-1 border border-gray-300 bg-white text-black rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={subjectInput}
                            onChange={(e) => setSubjectInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    updateFilters("subject", subjectInput.trim());
                                }
                            }}
                        />
                        <button
                            onClick={() => updateFilters("subject", subjectInput.trim())}
                            className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-md text-sm transition-colors"
                        >
                            Search
                        </button>
                        {currentSubject && (
                            <button
                                onClick={() => {
                                    setSubjectInput("");
                                    updateFilters("subject", "");
                                }}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm transition-colors"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded border border-red-200">{error}</div>
            ) : loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="border border-gray-100 rounded-xl p-5 bg-white shadow-sm h-32 animate-pulse">
                            <div className="flex gap-4 h-full">
                                <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0"></div>
                                <div className="flex-1 space-y-3 py-1">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : teachers.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-lg">No teachers found matching your criteria.</p>
                    {(currentLetter || currentSubject) && (
                        <button
                            onClick={() => {
                                setSubjectInput("");
                                router.push(pathname);
                            }}
                            className="mt-4 text-blue-600 hover:text-blue-800 underline"
                        >
                            Clear all filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teachers.map((t) => (
                        <Link key={t.id} href={`/teachers/${t.id}`} className="group">
                            <div className="border border-gray-100 bg-white p-5 rounded-xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer h-full flex flex-col">
                                <div className="flex items-start gap-4 mb-3">
                                    {t.profilePicture ? (
                                        <img
                                            src={t.profilePicture}
                                            alt={`${t.firstName} ${t.lastName}`}
                                            className="w-16 h-16 rounded-full object-cover border border-gray-200 flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl border border-blue-100 flex-shrink-0">
                                            {t.firstName.charAt(0)}{t.lastName.charAt(0)}
                                        </div>
                                    )}
                                    <div className="overflow-hidden">
                                        <h2 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                            {t.firstName} {t.lastName}
                                        </h2>
                                        <p className="text-sm text-gray-500 truncate">{t.email}</p>
                                        {t.roomNumber && <p className="text-xs text-gray-400 mt-0.5">Room {t.roomNumber}</p>}
                                    </div>
                                </div>

                                <div className="mt-auto pt-3 border-t border-gray-50">
                                    {t.subjects && t.subjects.length > 0 ? (
                                        <div className="flex flex-wrap gap-1.5">
                                            {t.subjects.slice(0, 3).map((sub, i) => (
                                                <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded inline-block truncate max-w-full">
                                                    {sub}
                                                </span>
                                            ))}
                                            {t.subjects.length > 3 && (
                                                <span className="text-xs text-gray-500 font-medium px-1 py-1">
                                                    +{t.subjects.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">No subjects listed</span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function TeachersPage() {
    return (
        <Suspense fallback={<div className="p-6">Loading directory...</div>}>
            <TeachersDirectoryContent />
        </Suspense>
    );
}
