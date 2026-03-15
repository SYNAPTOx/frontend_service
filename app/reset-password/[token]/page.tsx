"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { resetPassword } from "@/lib/api";

export default function ResetPage() {

  const params = useParams();
  const router = useRouter();

  const token = params.token as string;

  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleReset = async () => {

    if (!password) {
      setMsg("Enter password");
      return;
    }

    try {

      const data = await resetPassword(
        token,
        password
      );

      setMsg(data.message);

      if (data.message === "Password reset success") {

        setTimeout(() => {
          router.push("/login");
        }, 1500);

      }

    } catch (err) {

      console.log(err);
      setMsg("Error");

    }

  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-black relative">

      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl text-white w-[360px]">

        <h1 className="text-2xl mb-4 text-center">
          Reset Password
        </h1>

        <input
          type="password"
          placeholder="New password"
          className="w-full p-2 mb-3 rounded bg-black/40 border border-white/20"
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button
          onClick={handleReset}
          className="w-full py-2 bg-indigo-500 rounded"
        >
          Reset
        </button>

        {msg && (
          <p className="mt-2 text-sm text-green-400">
            {msg}
          </p>
        )}

      </div>

    </div>

  );
}