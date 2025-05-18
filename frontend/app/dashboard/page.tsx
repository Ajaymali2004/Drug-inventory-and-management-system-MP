"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "../../components/LoadingSpinner";
import AdminDashboard from "../../components/AdminDashboard";
import DrugManagement from "../../components/DrugManagement";
import { motion } from "framer-motion";
import Layout from "../../components/Layout";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

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

const staticDrugHistory = [
  { month: "January", drugName: "Paracetamol", quantityAdded: 150, quantityUsed: 100 },
  { month: "February", drugName: "Paracetamol", quantityAdded: 180, quantityUsed: 120 },
  { month: "March", drugName: "Paracetamol", quantityAdded: 130, quantityUsed: 90 },
  { month: "April", drugName: "Paracetamol", quantityAdded: 160, quantityUsed: 110 },
  { month: "May", drugName: "Paracetamol", quantityAdded: 200, quantityUsed: 150 },
  { month: "January", drugName: "Ibuprofen", quantityAdded: 100, quantityUsed: 70 },
  { month: "February", drugName: "Ibuprofen", quantityAdded: 120, quantityUsed: 85 },
  { month: "March", drugName: "Ibuprofen", quantityAdded: 90, quantityUsed: 60 },
  { month: "April", drugName: "Ibuprofen", quantityAdded: 110, quantityUsed: 75 },
  { month: "May", drugName: "Ibuprofen", quantityAdded: 140, quantityUsed: 95 },
  { month: "January", drugName: "Amoxicillin", quantityAdded: 80, quantityUsed: 50 },
  { month: "February", drugName: "Amoxicillin", quantityAdded: 90, quantityUsed: 60 },
  { month: "March", drugName: "Amoxicillin", quantityAdded: 85, quantityUsed: 55 },
  { month: "April", drugName: "Amoxicillin", quantityAdded: 100, quantityUsed: 70 },
  { month: "May", drugName: "Amoxicillin", quantityAdded: 110, quantityUsed: 80 },
];

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
        console.error("Error fetching user:", error);
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
        .then((res) => res.json())
        .then((data) => {
          console.log("API Response:", data);
          if (data.history && Array.isArray(data.history)) {
            let historyData = data.history.flatMap((drug: DrugData) =>
              drug.history.map((entry) => ({
                month: entry.month,
                quantity: entry.quantityAdded,
                drugName: `Drug ${drug.drugId}`,
              }))
            );
            console.log("Processed History Data:", historyData);
            if (historyData.length === 0) {
              const allMonths = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
              ];
              const currentMonthIndex = new Date().getMonth();
              const dummyMonths = [];
              for (let i = 4; i >= 0; i--) {
                dummyMonths.push(allMonths[(currentMonthIndex - i + 12) % 12]);
              }
              historyData = dummyMonths.map((month) => ({
                month,
                quantity: Math.floor(Math.random() * 100),
                drugName: "Dummy Drug",
              }));
              console.log("Dummy Data Generated:", historyData);
            }
            setDrugHistory(historyData);
          } else {
            console.error("Error: history data is not in the expected format");
          }
        })
        .catch((error) => {
          console.error("Error fetching drug history:", error);
        });
    }
  }, [user]);

  // Use staticDrugHistory as the primary data source, fall back to drugHistory if needed
  const chartDataSource = staticDrugHistory.length > 0 ? staticDrugHistory : drugHistory;
  console.log("Chart Data Source:", chartDataSource);

  // Prepare Chart.js data
  const months = ["January", "February", "March", "April", "May"];
  const uniqueDrugs = Array.from(new Set(chartDataSource.map((d) => d.drugName)));

  const chartData = {
    labels: months,
    datasets: uniqueDrugs.flatMap((drugName, index) => [
      {
        label: `${drugName} - Added`,
        data: months.map((month) => {
          const entry = chartDataSource.find(
            (d) => d.drugName === drugName && d.month === month
          );
          return entry ? entry.quantityAdded : 0;
        }),
        borderColor: pieColors[index % pieColors.length],
        backgroundColor: pieColors[index % pieColors.length],
        fill: false,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
      {
        label: `${drugName} - Used`,
        data: months.map((month) => {
          const entry = chartDataSource.find(
            (d) => d.drugName === drugName && d.month === month
          );
          return entry ? entry.quantityUsed : 0;
        }),
        borderColor: pieColors[(index + 2) % pieColors.length],
        backgroundColor: pieColors[(index + 2) % pieColors.length],
        fill: false,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        borderDash: [4, 4], // Dashed line for "Used"
      },
    ]),
  };

  console.log("Chart Data:", chartData);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: "#1f2937",
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "#1f2937",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        cornerRadius: 4,
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: "#e5e7eb",
          lineWidth: 1,
          drawBorder: false,
        },
        ticks: {
          color: "#1f2937",
          font: {
            size: 12,
          },
        },
      },
      y: {
        grid: {
          display: true,
          color: "#e5e7eb",
          lineWidth: 1,
          drawBorder: false,
        },
        ticks: {
          color: "#1f2937",
          font: {
            size: 12,
          },
          beginAtZero: true,
        },
        title: {
          display: true,
          text: "Quantity",
          color: "#1f2937",
          font: {
            size: 14,
          },
        },
      },
    },
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  return (
    <Layout userName={user.name} userRole={user.role}>
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
                  transition={{ duration: 0.7 }}
                  className="relative bg-white/90 rounded-3xl shadow-2xl overflow-hidden p-6"
                >
                  <div className="h-96 md:h-80 flex items-start justify-center overflow-hidden mb-8">
                    <img
                      src="/main.png"
                      alt="Medical Glass with Snake"
                      className="object-cover h-full w-full"
                    />
                  </div>
                  <div className="flex flex-col justify-center space-y-8">
                    <div>
                      <h2 className="text-3xl font-semibold text-gray-800 mb-6">
                        Quick Stats
                      </h2>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="border rounded-xl p-6 text-center shadow-md">
                          <p className="text-gray-600 text-sm">Total Drugs</p>
                          <p className="text-3xl font-bold text-indigo-600">5</p>
                        </div>
                        <div className="border rounded-xl p-6 text-center shadow-md">
                          <p className="text-gray-600 text-sm">Active Chats</p>
                          <p className="text-3xl font-bold text-purple-600">-</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h1 className="text-2xl font-semibold text-gray-800 mb-2">
                        Welcome, {user.name}
                      </h1>
                      <p className="text-gray-600">
                        You are logged in as{" "}
                        <span className="text-indigo-600 font-semibold">{user.role}</span>.
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
                    Drug Trends (Added & Used)
                  </h2>
                  <div className="w-full h-96">
                    {chartData.datasets.length > 0 ? (
                      <Line data={chartData} options={chartOptions} />
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
                    {user.role === "hospital" ? "Connect with Supplier" : "Connect with Hospital"}
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
                    {user.role === "hospital" ? "Contact Supplier" : "Contact Hospital"}
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
    </Layout>
  );
}