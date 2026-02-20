"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api, Teacher } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

const teacherSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().nullable().optional(),
    roomNumber: z.string().nullable().optional(),
    profilePicture: z.string().url("Must be a valid URL").nullable().optional().or(z.literal("")),
    subjects: z.array(z.string()).max(5, "A teacher can teach no more than 5 subjects"),
});

type TeacherFormData = z.infer<typeof teacherSchema>;

interface TeacherFormProps {
    initialData?: Teacher;
    isEditing?: boolean;
}

export default function TeacherForm({ initialData, isEditing = false }: TeacherFormProps) {
    const router = useRouter();

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<TeacherFormData>({
        resolver: zodResolver(teacherSchema),
        defaultValues: {
            firstName: initialData?.firstName || "",
            lastName: initialData?.lastName || "",
            email: initialData?.email || "",
            phone: initialData?.phone || "",
            roomNumber: initialData?.roomNumber || "",
            profilePicture: initialData?.profilePicture || "",
            subjects: initialData?.subjects || [],
        },
    });

    const [subjectInput, setSubjectInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState("");

    const currentSubjects = (watch("subjects") || []) as string[];

    const handleAddSubject = () => {
        if (!subjectInput.trim()) return;

        if (currentSubjects.length >= 5) {
            return;
        }

        if (!currentSubjects.includes(subjectInput.trim())) {
            setValue("subjects", [...currentSubjects, subjectInput.trim()], { shouldValidate: true });
        }
        setSubjectInput("");
    };

    const handleRemoveSubject = (subjectToRemove: string) => {
        setValue(
            "subjects",
            currentSubjects.filter((s) => s !== subjectToRemove),
            { shouldValidate: true }
        );
    };

    const onSubmit = async (data: any) => {
        setLoading(true);
        setApiError("");

        try {
            if (isEditing && initialData) {
                await api.put(`/teachers/${initialData.id}`, data);
            } else {
                await api.post("/teachers", data);
            }
            router.push("/teachers");
            router.refresh();
        } catch (err: any) {
            console.error(err);
            setApiError(err.response?.data?.message || "An error occurred while saving.");
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg mt-8 text-black border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">{isEditing ? "Edit Teacher" : "Add New Teacher"}</h1>
                <Link href="/teachers" className="text-gray-500 hover:text-gray-900 font-medium">
                    Cancel
                </Link>
            </div>

            {apiError && (
                <div className="bg-red-50 text-red-600 p-3 rounded mb-4 border border-red-200">
                    {apiError}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                        <Controller
                            name="firstName"
                            control={control}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    type="text"
                                    className={`w-full border bg-white text-black border-gray-300 rounded p-2 focus:outline-none focus:ring-2 ${errors.firstName ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                />
                            )}
                        />
                        {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                        <Controller
                            name="lastName"
                            control={control}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    type="text"
                                    className={`w-full border bg-white text-black rounded p-2 focus:outline-none focus:ring-2 ${errors.lastName ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                />
                            )}
                        />
                        {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                            <input
                                {...field}
                                type="email"
                                className={`w-full border bg-white text-black rounded p-2 focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'
                                    }`}
                            />
                        )}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <Controller
                            name="phone"
                            control={control}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    value={field.value || ""}
                                    type="tel"
                                    className="w-full border border-gray-300 bg-white text-black rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            )}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                        <Controller
                            name="roomNumber"
                            control={control}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    value={field.value || ""}
                                    type="text"
                                    className="w-full border border-gray-300 bg-white text-black rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            )}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture URL</label>
                    <Controller
                        name="profilePicture"
                        control={control}
                        render={({ field }) => (
                            <input
                                {...field}
                                value={field.value || ""}
                                type="url"
                                className={`w-full border bg-white text-black rounded p-2 focus:outline-none focus:ring-2 ${errors.profilePicture ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'
                                    }`}
                                placeholder="https://..."
                            />
                        )}
                    />
                    {errors.profilePicture && <p className="text-red-500 text-xs mt-1">{errors.profilePicture.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subjects (Max 5) - Current: {currentSubjects.length}
                    </label>
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={subjectInput}
                            onChange={(e) => setSubjectInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddSubject();
                                }
                            }}
                            className="flex-1 border border-gray-300 bg-white text-black rounded p-2 focus:border-blue-500 focus:outline-none"
                            placeholder="e.g. Mathematics"
                            disabled={currentSubjects.length >= 5}
                        />
                        <button
                            type="button"
                            onClick={handleAddSubject}
                            disabled={currentSubjects.length >= 5 || !subjectInput.trim()}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 disabled:opacity-50"
                        >
                            Add
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                        {currentSubjects.map((subject, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                {subject}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveSubject(subject)}
                                    className="text-blue-500 hover:text-blue-700 ml-1 font-bold focus:outline-none"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                        {currentSubjects.length === 0 && (
                            <p className="text-gray-500 text-sm">No subjects added yet.</p>
                        )}
                    </div>
                    {errors.subjects && <p className="text-red-500 text-xs mt-1">{errors.subjects.message}</p>}
                </div>

                <div className="pt-4 border-t">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {loading ? "Saving..." : isEditing ? "Update Teacher" : "Create Teacher"}
                    </button>
                </div>
            </form>
        </div>
    );
}
