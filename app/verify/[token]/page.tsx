"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { verifyEmail } from "@/lib/api";

export default function Page() {

  const { token } = useParams();
  const router = useRouter();

  const [msg, setMsg] =
    useState("Verifying...");

  useEffect(() => {

    const run = async () => {

      const data =
        await verifyEmail(token);

      setMsg(data.message);

      if (
        data.message ===
        "Email verified"
      ) {

        setTimeout(() => {
          router.push("/login");
        }, 1500);

      }

    };

    run();

  }, []);

  return (

    <div className="min-h-screen flex items-center justify-center bg-black text-white">

      <div className="bg-white/10 backdrop-blur-xl p-8 rounded-xl">

        {msg}

      </div>

    </div>

  );
}