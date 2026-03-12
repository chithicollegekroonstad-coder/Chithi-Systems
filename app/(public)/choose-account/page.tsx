"use client";

import { Button } from "@/components/ui/button";

import Link from "next/link";




export default function ChooseAccount() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 py-24 bg-gradient-to-b from-white via-red-50/50 to-white">
            <div className="max-w-2xl mx-auto space-y-8 text-center">
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                    Choose Account Type
                </h1>
                <p className="text-lg text-gray-600">
                    Select whether you are a student or staff member
                </p>

                <div className="grid md:grid-cols-2 gap-6 mt-12">
                    {/* Student Button */}
                    <Button
                        asChild
                        size="sm"
                        className="h-7 flex  items-center justify-center p-6 bg-red-600 hover:bg-red-700 hover:shadow-lg transition-shadow"
                    >
                        <Link href="/login/student" className="flex items-center justify-center">
                           
                            <span className=" font-semibold">Student</span>
                        </Link>
                    </Button>

                    {/* Staff Button */}
                    <Button
                        asChild
                        size="sm"
                        className="h-7 flex   items-center justify-center p-6 bg-red-600 hover:bg-red-700 hover:shadow-lg transition-shadow hover: text-amber-50"
                    >
                        <Link href="/login/staff">
                            
                            <span className=" font-semibold">Staff Member</span>
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}