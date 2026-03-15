"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthMe, getUserMe } from "@/lib/api";

export default function DashboardPage() {

  const router = useRouter();

  useEffect(() => {

    const checkUser = async () => {

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {

        const auth = await getAuthMe();

        if (!auth || auth.message) {
          router.push("/login");
          return;
        }

        const profile = await getUserMe();

        if (!profile) {
          router.push("/profile");
          return;
        }

      } catch {

        router.push("/login");

      }

    };

    checkUser();

  }, []);



  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };



  return (

    <div className="min-h-screen bg-black text-white flex">

      {/* SIDEBAR */}

      <div className="w-64 bg-white/10 backdrop-blur-xl border-r border-white/20 p-5">

        <h1 className="text-2xl font-bold mb-6">
          Synapto
        </h1>

        <div className="flex flex-col gap-3">

          <button className="p-2 rounded-lg hover:bg-white/10">
            Dashboard
          </button>

          <button
            onClick={() => router.push("/profile")}
            className="p-2 rounded-lg hover:bg-white/10"
          >
            Profile
          </button>

          <button className="p-2 rounded-lg hover:bg-white/10">
            Section
          </button>

          <button className="p-2 rounded-lg hover:bg-white/10">
            Chat
          </button>

          <button className="p-2 rounded-lg hover:bg-white/10">
            Attendance
          </button>

        </div>

      </div>



      {/* MAIN */}

      <div className="flex-1 flex flex-col">

        <div className="h-16 border-b border-white/10 flex items-center justify-between px-6">

          <h2 className="text-xl font-semibold">
            Dashboard
          </h2>

          <button
            onClick={logout}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 hover:scale-105 transition"
          >
            Logout
          </button>

        </div>



        <div className="p-6">

          Dashboard working with microservices

        </div>

      </div>

    </div>

  );

}