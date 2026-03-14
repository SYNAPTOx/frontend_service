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
    <div className="p-10">

      <h1>Dashboard</h1>

      <button
        onClick={logout}
        className="bg-red-500 text-white px-4 py-2 mt-4"
      >
        Logout
      </button>

    </div>
  );
}