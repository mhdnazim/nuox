"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function BulkImportForm() {
    const router = useRouter();
    const [zipFile, setZipFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [apiMessage, setApiMessage] = useState({ type: "", text: "" });

    const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setZipFile(e.target.files[0]);
        }
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!zipFile) {
            setApiMessage({ type: "error", text: "Please provide a valid ZIP archive containing your CSV file and images." });
            return;
        }

        setLoading(true);
        setApiMessage({ type: "", text: "" });

        const formData = new FormData();
        formData.append("imagesZip", zipFile);

        try {
            const token = localStorage.getItem("token");
            const res = await api.post("/teachers/import", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`
                },
            });

            if (res.data.success) {
                setApiMessage({
                    type: "success",
                    text: res.data.message || "Teachers imported successfully!"
                });

                // Clear selected files
                setZipFile(null);

                // Keep the input values cleared by resetting the form
                const form = e.target as HTMLFormElement;
                form.reset();

                setTimeout(() => {
                    router.push("/teachers");
                    router.refresh();
                }, 2000);
            }
        } catch (err: any) {
            console.error(err);
            setApiMessage({
                type: "error",
                text: err.response?.data?.message || err.message || "An error occurred during import."
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg mt-8 text-black border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Bulk Import Teachers</h1>
                    <p className="text-sm text-gray-500 mt-1">Upload a single ZIP archive containing your teacher CSV data and profile images.</p>
                </div>
                <Link href="/teachers" className="text-gray-500 hover:text-gray-900 font-medium">
                    Cancel
                </Link>
            </div>

            {apiMessage.text && (
                <div className={`p-4 rounded mb-6 border ${apiMessage.type === "error" ? "bg-red-50 text-red-600 border-red-200" : "bg-green-50 text-green-600 border-green-200"}`}>
                    {apiMessage.text}
                </div>
            )}

            <form onSubmit={onSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload ZIP Archive (CSV + Images) <span className="text-red-500">*</span>
                    </label>
                    <div className="border border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 flex justify-center items-center">
                        <input
                            type="file"
                            accept=".zip"
                            onChange={handleZipChange}
                            required
                            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>
                    <ul className="text-xs text-gray-500 mt-2 list-disc list-inside space-y-1">
                        <li>The ZIP must contain a <strong>.csv</strong> file with teacher records.</li>
                        <li>The CSV should include <strong>firstName, lastName, email</strong>, etc.</li>
                        <li>Profile image filenames in the CSV must match files in the ZIP.</li>
                    </ul>
                </div>

                <div className="pt-4 border-t">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                        {loading ? "Processing Import..." : "Import File"}
                    </button>
                </div>
            </form>
        </div>
    );
}
