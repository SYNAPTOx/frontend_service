"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserMe } from "@/lib/api";

const BASE = process.env.NEXT_PUBLIC_GATEWAY_URL;

export default function ProfilePage() {

  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    college: "",
    branch: "",
    year: "",
    section: "",
  });

  const [loading, setLoading] = useState(true);



  // ================= LOAD PROFILE =================

  useEffect(() => {

    const load = async () => {

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const user = await getUserMe();

      if (user && user._id) {

        setForm({
          name: user.name || "",
          email: user.email || "",
          college: user.college || "",
          branch: user.branch || "",
          year: user.year || "",
          section: user.section || "",
        });

      }

      setLoading(false);

    };

    load();

  }, []);




  // ================= CHANGE =================

  const handleChange = (e: any) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  };




  // ================= SAVE =================

  const handleSave = async () => {

    const token = localStorage.getItem("token");

    await fetch(`${BASE}/user/profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...form,
        year: Number(form.year),
      }),
    });

    router.push("/dashboard");

  };



  if (loading) {

    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );

  }



  return (

    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">

      {/* glow */}

      <div className="absolute w-[500px] h-[500px] bg-indigo-600 blur-[120px] opacity-30 rounded-full top-[-100px] left-[-100px]" />
      <div className="absolute w-[500px] h-[500px] bg-purple-600 blur-[120px] opacity-30 rounded-full bottom-[-100px] right-[-100px]" />



      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl w-[420px] text-white space-y-3">

        <h1 className="text-2xl text-center mb-3">
          Profile
        </h1>



        <input
          name="name"
          placeholder="Name"
          className="input"
          value={form.name}
          onChange={handleChange}
        />

        <input
          name="email"
          placeholder="Email"
          className="input"
          value={form.email}
          onChange={handleChange}
        />

        <input
          name="college"
          placeholder="College"
          className="input"
          value={form.college}
          onChange={handleChange}
        />

        <input
          name="branch"
          placeholder="Branch"
          className="input"
          value={form.branch}
          onChange={handleChange}
        />

        <input
          name="year"
          placeholder="Year"
          className="input"
          value={form.year}
          onChange={handleChange}
        />

        <input
          name="section"
          placeholder="Section"
          className="input"
          value={form.section}
          onChange={handleChange}
        />



        <button
          onClick={handleSave}
          className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg mt-2"
        >
          Save Profile
        </button>

      </div>

    </div>

  );

}