"use client";

import { useState } from "react";
import { signupUser } from "@/lib/api";

export default function SignupPage() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [college, setCollege] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState(1);
  const [section, setSection] = useState("");

  const handleSignup = async () => {
    try {
      const data = await signupUser(
        name,
        email,
        password,
        college,
        branch,
        year,
        section
      );

      console.log(data);
      alert(JSON.stringify(data));

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-10">

      <input placeholder="Name"
        className="border p-2"
        onChange={(e) => setName(e.target.value)}
      />

      <input placeholder="Email"
        className="border p-2"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input placeholder="Password"
        type="password"
        className="border p-2"
        onChange={(e) => setPassword(e.target.value)}
      />

      <input placeholder="College"
        className="border p-2"
        onChange={(e) => setCollege(e.target.value)}
      />

      <input placeholder="Branch"
        className="border p-2"
        onChange={(e) => setBranch(e.target.value)}
      />

      <input placeholder="Year"
        type="number"
        className="border p-2"
        onChange={(e) => setYear(Number(e.target.value))}
      />

      <input placeholder="Section"
        className="border p-2"
        onChange={(e) => setSection(e.target.value)}
      />

      <button
        className="bg-black text-white px-4 py-2"
        onClick={handleSignup}
      >
        Signup
      </button>

    </div>
  );
}