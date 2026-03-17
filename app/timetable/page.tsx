"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function TimetablePage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchTimetable = async () => {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:4000/api/timetable/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setData(res.data);
    };

    fetchTimetable();
  }, []);

  if (!data)
    return (
      <div className="text-white p-6">
        Loading timetable...
      </div>
    );

    if (!data.days)
      return <div className="text-white p-6">
        No timetable uploaded
      </div>;

  const { days, timeSlots, grid } = data;

  const getColor = (text: string) => {
    if (!text) return "";

    if (text.includes("(P)"))
      return "bg-purple-600/30";

    if (text.includes("HSN"))
      return "bg-green-600/30";

    if (text.includes("ECN"))
      return "bg-blue-600/30";

    if (text.includes("EEN"))
      return "bg-orange-600/30";

    return "bg-gray-700/40";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#020617] text-white p-6">

      {/* Header */}
      <h1 className="text-3xl font-bold mb-6 tracking-wide">
        📅 My Timetable
      </h1>

      {/* Card */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 p-4 shadow-xl overflow-x-auto">

        <table className="min-w-full border-collapse">

          {/* Header */}
          <thead className="sticky top-0 bg-[#020617]">

            <tr>

              <th className="p-3 border border-gray-700">
                Day / Time
              </th>

              {timeSlots.map((t: string) => (
                <th
                  key={t}
                  className="p-3 border border-gray-700 text-sm font-semibold text-blue-300"
                >
                  {t}
                </th>
              ))}

            </tr>

          </thead>

          {/* Body */}
          <tbody>

            {days.map((day: string) => (
              <tr key={day}>

                {/* Day */}
                <td className="p-3 border border-gray-700 font-bold text-cyan-400">
                  {day}
                </td>

                {/* Slots */}
                {timeSlots.map((t: string) => {
                  const text =
                    grid?.[day]?.[t] || "";

                  return (
                    <td
                      key={t}
                      className={`p-3 border border-gray-700 text-sm transition hover:scale-[1.03] hover:shadow-lg ${getColor(
                        text
                      )}`}
                    >
                      {text || "-"}
                    </td>
                  );
                })}

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}