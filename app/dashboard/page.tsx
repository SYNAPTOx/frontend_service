"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/api";

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

        const user = await getMe();

        if (!user || user.message) {
          router.push("/login");
        }

      } catch (err) {
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

        {/* TOPBAR */}

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


        {/* CONTENT */}

        <div className="p-6">

          <div className="grid grid-cols-3 gap-6">

            <div className="bg-white/10 border border-white/20 p-6 rounded-xl shadow-xl">
              <h3 className="text-lg font-bold">
                Section
              </h3>
              <p className="text-gray-400">
                Manage your class section
              </p>
            </div>


            <div className="bg-white/10 border border-white/20 p-6 rounded-xl shadow-xl">
              <h3 className="text-lg font-bold">
                Chat
              </h3>
              <p className="text-gray-400">
                Talk with classmates
              </p>
            </div>


            <div className="bg-white/10 border border-white/20 p-6 rounded-xl shadow-xl">
              <h3 className="text-lg font-bold">
                Attendance
              </h3>
              <p className="text-gray-400">
                Track attendance
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>

  );

}