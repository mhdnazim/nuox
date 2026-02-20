import { api, Teacher } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function TeacherProfilePage({ params }: PageProps) {
    const resolvedParams = await params;
    const idStr = resolvedParams.id;
    const idNum = parseInt(idStr, 10);

    if (isNaN(idNum)) {
        return notFound();
    }

    let teacher: Teacher | null = null;

    try {
        const res = await api.get(`/teachers/${idNum}`);
        teacher = res.data.data;
    } catch (error) {
        console.error(error);
        return notFound();
    }

    if (!teacher) {
        return notFound();
    }

    return (
        <div className="p-6 max-w-4xl mx-auto mt-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Teacher Profile</h1>
                <div className="space-x-4">
                    <Link href="/teachers" className="text-gray-600 hover:text-gray-900">
                        Back to Directory
                    </Link>
                    <Link href={`/teachers/${idNum}/edit`}>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors">
                            Edit Teacher
                        </button>
                    </Link>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
                <div className="p-8 pb-0">
                    <div className="flex items-center gap-6 mb-8">
                        {teacher.profilePicture ? (
                            <img
                                src={teacher.profilePicture}
                                alt={`${teacher.firstName} ${teacher.lastName}`}
                                className="w-24 h-24 rounded-full object-cover border-2 border-gray-100 shadow-sm"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-500 shadow-sm">
                                {teacher.firstName.charAt(0)}{teacher.lastName.charAt(0)}
                            </div>
                        )}
                        <div>
                            <h2 className="text-2xl font-semibold">{teacher.firstName} {teacher.lastName}</h2>
                            <p className="text-gray-600">ID: {teacher.id}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-200">
                    <div className="bg-white p-6">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Contact Details</h3>
                        <div className="space-y-3">
                            <div>
                                <span className="block text-sm text-gray-500">Email Address</span>
                                <span className="text-gray-900 font-medium break-all">{teacher.email}</span>
                            </div>
                            {teacher.phone && (
                                <div>
                                    <span className="block text-sm text-gray-500">Phone Number</span>
                                    <span className="text-gray-900">{teacher.phone}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="bg-white p-6">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Academic Information</h3>
                        <div className="space-y-3">
                            {teacher.roomNumber && (
                                <div>
                                    <span className="block text-sm text-gray-500">Room Number</span>
                                    <span className="text-gray-900">{teacher.roomNumber}</span>
                                </div>
                            )}
                            <div>
                                <span className="block text-sm text-gray-500 mb-1">Subjects Taught</span>
                                {teacher.subjects && teacher.subjects.length > 0 ? (
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {teacher.subjects.map((subject, index) => (
                                            <span key={index} className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-md text-sm whitespace-nowrap border border-blue-100">
                                                {subject}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-gray-400 italic">No subjects assigned</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 text-xs text-gray-400 flex justify-between border-t border-gray-200">
                    <span>Added: {new Date(teacher.createdAt).toLocaleDateString()}</span>
                    <span>Last Updated: {new Date(teacher.updatedAt).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
}
