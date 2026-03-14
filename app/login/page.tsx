"use client";

import { useState } from "react";
import { loginUser } from "@/lib/api";

export default function LoginPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const data = await loginUser(email, password);

      if (data.token) {
        localStorage.setItem("token", data.token);
        alert("Login success");
      }

      console.log(data);

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-10">

      <input
        className="border p-2"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="border p-2"
        placeholder="Password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        className="bg-black text-white px-4 py-2"
        onClick={handleLogin}
      >
        Login
      </button>

    </div>
  );
}