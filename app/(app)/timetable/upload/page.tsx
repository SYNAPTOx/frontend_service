"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function UploadPage() {
  const [file, setFile] = useState<any>();
  const [isCR, setIsCR] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:4000/api/user/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setIsCR(res.data.isCR);
      } catch (err) {
        console.log(err);
      }

      setLoading(false);
    };

    checkUser();
  }, []);

  const upload = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!file) {
        alert("Select file first");
        return;
      }

      setUploading(true);

      const form = new FormData();

      form.append("file", file);
      form.append("section", "A");
      form.append("semester", "4");

      await axios.post(
        "http://localhost:4000/api/timetable/upload",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Uploaded");
    } catch (err) {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#020617] text-white">
        Loading...
      </div>
    );

  if (!isCR)
    return (
      <div className="h-screen flex items-center justify-center bg-[#020617] text-red-400 text-xl">
        Only CR can upload timetable
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#020617] to-[#0f172a] flex items-center justify-center text-white">

      <div className="w-[420px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">

        <h1 className="text-3xl font-bold text-center mb-2">
          Upload Timetable
        </h1>

        <p className="text-center text-gray-400 mb-6">
          Only CR can upload timetable
        </p>

        {/* file input */}

        <input
          type="file"
          onChange={(e) =>
            setFile(e.target.files?.[0])
          }
          className="w-full mb-6
          file:bg-blue-600
          file:text-white
          file:border-none
          file:px-4
          file:py-2
          file:rounded-lg
          file:cursor-pointer
          text-gray-300"
        />

        {/* loader */}

        {uploading && (
          <div className="flex flex-col items-center mb-4">

            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>

            <p className="text-sm text-blue-400 mt-2">
              Reading PDF • OCR • AI parsing...
            </p>

          </div>
        )}

        {/* button */}

        <button
          onClick={upload}
          disabled={uploading}
          className="
          w-full
          bg-blue-600
          hover:bg-blue-700
          disabled:bg-gray-600
          transition
          py-3
          rounded-xl
          text-lg
          font-semibold
          shadow-lg
          "
        >
          {uploading ? "Uploading..." : "Upload Timetable"}
        </button>

      </div>

    </div>
  );
}