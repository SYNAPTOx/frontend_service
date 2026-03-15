"use client";

import { useState } from "react";
import { loginUser, googleLogin } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleLogin = async () => {

    try {

      const data = await loginUser(email, password);

      if (data.token) {

        localStorage.setItem("token", data.token);

        router.push("/dashboard");

      } else {

        setMsg(data.message);

      }

    } catch {

      setMsg("Login failed");

    }

  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">

      {/* glow */}
      <div className="absolute w-[500px] h-[500px] bg-purple-600 blur-[120px] opacity-30 rounded-full top-[-100px] left-[-100px]" />
      <div className="absolute w-[500px] h-[500px] bg-indigo-600 blur-[120px] opacity-30 rounded-full bottom-[-100px] right-[-100px]" />

      {/* card */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl w-[380px] text-white space-y-4">

        <h1 className="text-3xl font-semibold text-center">
          Welcome Back
        </h1>

        {/* inputs */}

        <input
          placeholder="Email"
          className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* button */}

        <button
          onClick={handleLogin}
          className="w-full py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-[1.02] transition"
        >
          Login
        </button>

        {/* error */}

        {msg && (
          <p className="text-red-400 text-sm text-center">
            {msg}
          </p>
        )}

        {/* links */}

        <div className="flex justify-between text-sm text-gray-300">

          <Link href="/forgot-password">
            Forgot password
          </Link>

          <Link href="/signup">
            Signup
          </Link>

        </div>

        {/* divider */}

        <div className="flex items-center gap-2">

          <div className="flex-1 h-[1px] bg-white/20" />
          <span className="text-xs text-gray-300">
            OR
          </span>
          <div className="flex-1 h-[1px] bg-white/20" />

        </div>

        {/* google */}

        <div className="flex justify-center">

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