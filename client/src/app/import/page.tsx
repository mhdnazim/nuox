"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BulkImportForm from "@/components/BulkImportForm";

export default function ImportPage() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
        } else {
            setIsAuthorized(true);
        }
    }, [router]);

    if (!isAuthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <BulkImportForm />
        </div>
    );
}
