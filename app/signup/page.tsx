"use client";

import { useState } from "react";
import { signupUser, googleLogin } from "@/lib/api";
import Link from "next/link";
import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";

export default function SignupPage() {

  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    college: "",
    branch: "",
    year: "",
    section: "",
  });

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);


  const handleChange = (e: any) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  };


  const handleSignup = async () => {

    try {

      setLoading(true);
      setMsg("");

      const data = await signupUser({
        ...form,
        year: Number(form.year),
      });

      setMsg(
        data.message || "Check email to verify"
      );

    } catch {

      setMsg("Signup failed");

    }

    setLoading(false);

  };


  return (

    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
  
      {/* glow */}
      <div className="absolute w-[500px] h-[500px] bg-pink-600 blur-[120px] opacity-30 rounded-full top-[-100px] right-[-100px]" />
      <div className="absolute w-[500px] h-[500px] bg-indigo-600 blur-[120px] opacity-30 rounded-full bottom-[-100px] left-[-100px]" />
  
      {/* card */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl w-[420px] text-white">
  
        <h1 className="text-3xl font-semibold text-center mb-5">
          Create Account
        </h1>
  
  
        {/* inputs */}
  
        <div className="space-y-3">
  
          <input name="name" placeholder="Full Name" className="input" onChange={handleChange} />
          <input name="email" placeholder="Email" className="input" onChange={handleChange} />
          <input name="password" type="password" placeholder="Password" className="input" onChange={handleChange} />
          <input name="college" placeholder="College" className="input" onChange={handleChange} />
          <input name="branch" placeholder="Branch" className="input" onChange={handleChange} />
          <input name="year" placeholder="Year" className="input" onChange={handleChange} />
          <input name="section" placeholder="Section" className="input" onChange={handleChange} />
  
        </div>
  
  
        {/* signup button */}
  
        <button
          onClick={handleSignup}
          className="w-full py-2 mt-4 rounded-lg bg-gradient-to-r from-pink-500 to-indigo-500 hover:scale-[1.02] transition"
        >
          {loading ? "Loading..." : "Signup"}
        </button>
  
  
        {/* message */}
  
        {msg && (
          <p className="text-green-400 text-sm text-center mt-2">
            {msg}
          </p>
        )}
  
  
        {/* link */}
  
        <p className="text-sm text-center text-gray-300 mt-3">
          Already have account?{" "}
          <Link href="/login" className="text-indigo-400">
            Login
          </Link>
        </p>
  
  
        {/* divider */}
  
        <div className="flex items-center gap-2 mt-5">
  
          <div className="flex-1 h-[1px] bg-white/20" />
          <span className="text-xs text-gray-300">OR</span>
          <div className="flex-1 h-[1px] bg-white/20" />
  
        </div>
  
  
        {/* google bottom */}
  
        <div className="flex justify-center mt-4">
  
          <GoogleLogin
            onSuccess={async (res) => {
  
              const idToken = res.credential;
  
              const data = await googleLogin(idToken!);
  
              if (data.token) {
  
                localStorage.setItem("token", data.token);
  
                router.push("/dashboard");
  
              }
  
            }}
            onError={() => console.log("Google error")}
          />
  
        </div>
  
      </div>
  
    </div>
  
  );
}