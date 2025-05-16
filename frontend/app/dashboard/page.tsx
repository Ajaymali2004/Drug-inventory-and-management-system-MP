"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "../../components/LoadingSpinner";
import AdminDashboard from "../../components/AdminDashboard";
import DrugManagement from "../../components/DrugManagement";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface User {
  _id: string;
  name: string;
  role: string;
  email: string;
}

interface DrugHistoryEntry {
  month: string;
  quantityAdded: number;
}

interface DrugData {
  drugId: string;
  history: DrugHistoryEntry[];
}

const pieColors = ["#6366f1", "#8b5cf6", "#06b6d4", "#f59e0b", "#ef4444"];

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [drugHistory, setDrugHistory] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/alogin");
      return;
    }

    fetch("http://localhost:5000/api/user", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        localStorage.removeItem("token");
        router.push("/auth/login");
      });
  }, [router]);

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem("token");
      fetch(`http://localhost:5000/api/users/history/${user._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {res.json();
          console.log("Response:", res.json());
        })
        .then((data) => {
          let historyData = data.history.flatMap((drug: DrugData) =>
            drug.history.map((entry) => ({
              month: entry.month,
              quantity: entry.quantityAdded,
              drugName: `Drug ${drug.drugId}`,
            }))
          );
          console.log("History Data:", historyData);
          // If no real data, inject dummy data
          if (historyData.length === 0) {
            const allMonths = [
              "January", "February", "March", "April", "May", "June",
              "July", "August", "September", "October", "November", "December"
            ];
            const currentMonthIndex = new Date().getMonth(); // 0-11
            const dummyMonths = [];

            // Collect last 5 months (handling year wrap-around)
            for (let i = 4; i >= 0; i--) {
              dummyMonths.push(allMonths[(currentMonthIndex - i + 12) % 12]);
            }

            historyData = dummyMonths.map((month) => ({
              month,
              quantity: Math.floor(Math.random() * 100), // Random quantity 0-99
              drugName: "Dummy Drug",
            }));
          }

          setDrugHistory(historyData);
        })
        .catch((error) => {
          console.error("Error fetching drug history:", error);
        });
    }
  }, [user]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef2f7] to-[#f7f8fa]">
      <div className="container mx-auto px-4 py-10">
        {user.role === "admin" ? (
          <AdminDashboard />
        ) : (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Welcome Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative bg-white/90 rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2"
              >
                <div className="h-64 md:h-auto flex items-center justify-center overflow-hidden">
                  <img
                    src="/main.png"
                    alt="Medical Glass with Snake"
                    className="object-cover h-full w-full"
                  />
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">
                      Quick Stats
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border rounded-xl p-4 text-center">
                        <p className="text-gray-600 text-sm">Total Drugs</p>
                        <p className="text-3xl font-bold text-indigo-600">5</p>
                      </div>
                      <div className="border rounded-xl p-4 text-center">
                        <p className="text-gray-600 text-sm">Active Chats</p>
                        <p className="text-3xl font-bold text-purple-600">-</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      Welcome, {user.name}
                    </h1>
                    <p className="text-gray-600">
                      You are logged in as{" "}
                      <span className="text-indigo-600 font-semibold">
                        {user.role}
                      </span>
                      .
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Line Chart Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-300 flex flex-col"
              >
                <h2 className="text-3xl font-bold text-gray-800 mb-8">
                  Drug Trends
                </h2>
                <div className="w-full h-96">
                  {drugHistory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={drugHistory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {[...new Set(drugHistory.map(d => d.drugName))].map((drugName, index) => (
                          <Line
                            key={drugName}
                            type="monotone"
                            dataKey={(data) => data.drugName === drugName ? data.quantity : null}
                            name={drugName}
                            stroke={pieColors[index % pieColors.length]}
                            dot={{ r: 3 }}
                            activeDot={{ r: 6 }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-gray-500">
                      No data available for drug trends.
                    </p>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Drug Management Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-300"
            >
              <DrugManagement userRole={user.role} userId={user._id} />
            </motion.div>

            {/* Contact Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-300 flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {user.role === "hospital"
                    ? "Connect with Supplier"
                    : "Connect with Hospital"}
                </h2>
                <p className="text-gray-600">
                  {user.role === "hospital"
                    ? "Need supplies? Contact suppliers and place your order now!"
                    : "Connect with hospitals to supply required drugs."}
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => router.push("/dashboard/chats")}
                  className="bg-indigo-600 text-white font-semibold py-3 px-6 rounded-2xl hover:bg-indigo-700 transition-all"
                >
                  {user.role === "hospital"
                    ? "Contact Supplier"
                    : "Contact Hospital"}
                </button>

                {user.role === "hospital" && (
                  <button
                    onClick={() => router.push("/dashboard/chats")}
                    className="bg-purple-600 text-white font-semibold py-3 px-6 rounded-2xl hover:bg-purple-700 transition-all"
                  >
                    Order Now
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
