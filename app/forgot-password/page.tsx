"use client";

import { useState } from "react";
import { forgotPassword } from "@/lib/api";
import Link from "next/link";

export default function Page() {

  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const handle = async () => {

    const data =
      await forgotPassword(email);

    setMsg(
      data.message ||
      "Check email"
    );

  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
  
      <div className="absolute w-[500px] h-[500px] bg-pink-600 blur-[120px] opacity-30 rounded-full top-[-100px] right-[-100px]" />
      <div className="absolute w-[500px] h-[500px] bg-indigo-600 blur-[120px] opacity-30 rounded-full bottom-[-100px] left-[-100px]" />
  
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl w-[360px] text-white">
  
        <h1 className="text-2xl mb-4 text-center">
          Forgot Password
        </h1>
  
        <input
          placeholder="Email"
          className="input"
          onChange={(e) => setEmail(e.target.value)}
        />
  
        <button
          onClick={handle}
          className="w-full py-2 bg-pink-500 rounded mt-3"
        >
          Send link
        </button>
  
        {msg && (
          <p className="mt-2 text-green-400 text-center">
            {msg}
          </p>
        )}
  
        <p className="text-sm text-center mt-3">
          <Link href="/login" className="text-indigo-400">
            Back to login
          </Link>
        </p>
  
      </div>
  
    </div>
  
  );
}