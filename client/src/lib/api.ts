import axios from "axios";

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4200/api",
});

export interface Teacher {
    id: number;
    firstName: string;
    lastName: string;
    profilePicture: string | null;
    email: string;
    phone: string | null;
    roomNumber: string | null;
    subjects: string[];
    createdAt: string;
    updatedAt: string;
}
