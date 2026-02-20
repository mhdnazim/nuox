import TeacherForm from "@/components/TeacherForm";
import { api, Teacher } from "@/lib/api";
import { notFound } from "next/navigation";

// Define PageProps properly for Next.js 15
interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditTeacherPage({ params }: PageProps) {
    // Await params per Next.js 15 requirements
    const resolvedParams = await params;
    const idStr = resolvedParams.id;
    const idNum = parseInt(idStr, 10);

    if (isNaN(idNum)) {
        return notFound();
    }

    try {
        const res = await api.get(`/teachers/${idNum}`);
        const teacher: Teacher = res.data.data;
        return (
            <div className="p-6">
                <TeacherForm initialData={teacher} isEditing={true} />
            </div>
        );
    } catch (error) {
        console.error(error);
        return notFound();
    }
}
