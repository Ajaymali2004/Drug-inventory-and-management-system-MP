"use client";
import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";

interface Message {
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  type?: 'text' | 'order';
  drugId?: number;
  drugName?: string;
  description?: string;
  quantity?: number;
  status?: 'sent' | 'accepted';
}

interface User {
  _id: string;
  name: string;
  role: string;
  email: string;
}

export default function Chat() {
  const [socket, setSocket] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderForm, setOrderForm] = useState({
    drugName: "",
    description: "",
    quantity: "",
  });
  const [editingOrder, setEditingOrder] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const userId = user?._id || "";
  const userRole = user?.role || "";

  const handleAcceptOrder = (msg: Message) => {
    const updatedMessage: Message = {
      ...msg,
      status: 'accepted',
    };
    socket.emit('message', updatedMessage);
    setMessages((prev) =>
      prev.map((m) =>
        m.timestamp.toString() === msg.timestamp.toString() && m.senderId === msg.senderId
          ? updatedMessage
          : m
      )
    );
  };

  const openOrderModal = (order?: Message) => {
    if (order) {
      setEditingOrder(order);
      setOrderForm({
        drugName: order.drugName || "",
        description: order.description || "",
        quantity: order.quantity?.toString() || "",
      });
    } else {
      setEditingOrder(null);
      setOrderForm({ drugName: "", description: "", quantity: "" });
    }
    setShowOrderModal(true);
  };

  const closeOrderModal = () => {
    setShowOrderModal(false);
    setEditingOrder(null);
    setOrderForm({ drugName: "", description: "", quantity: "" });
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !orderForm.drugName.trim() || !orderForm.quantity.trim()) return;

    const orderMessage: Message = {
      senderId: userId,
      receiverId: selectedUser._id,
      timestamp: editingOrder ? editingOrder.timestamp : new Date(),
      type: 'order',
      drugName: orderForm.drugName,
      description: orderForm.description,
      quantity: Number(orderForm.quantity),
      status: editingOrder ? editingOrder.status : 'sent',
      content: `Ordered ${orderForm.quantity} units of ${orderForm.drugName}`,
    };

    // Emit the message and let the socket event handle state updates
    socket.emit('message', orderMessage);

    closeOrderModal();
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/alogin");
      return;
    }

    fetch("http://localhost:5000/api/user", {
      headers: { Authorization: `Bearer ${token}` },
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

    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [router]);

  useEffect(() => {
    if (!socket) return;

    socket.on("message", (message: Message) => {
      if (
        (message.senderId === userId && message.receiverId === selectedUser?._id) ||
        (message.senderId === selectedUser?._id && message.receiverId === userId)
      ) {
        setMessages((prev) => {
          // Check if message is an update to an existing order
          const existingMessageIndex = prev.findIndex(
            (m) =>
              m.senderId === message.senderId &&
              m.type === 'order' &&
              m.timestamp.toString() === message.timestamp.toString()
          );
          if (existingMessageIndex !== -1) {
            // Update existing message
            return prev.map((m, index) =>
              index === existingMessageIndex ? message : m
            );
          }
          // Prevent duplicates for new messages
          const exists = prev.some(
            (m) =>
              m.senderId === message.senderId &&
              m.receiverId === message.receiverId &&
              m.timestamp.toString() === message.timestamp.toString() &&
              m.content === message.content
          );
          return exists ? prev : [...prev, message];
        });
      }
    });

    return () => {
      socket.off("message");
    };
  }, [socket, selectedUser, userId]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:5000/api/users/${userRole === "hospital" ? "supplier" : "hospital"}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setAvailableUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, [userRole]);

  useEffect(() => {
    if (selectedUser) {
      const fetchMessages = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(`http://localhost:5000/api/messages/${userId}/${selectedUser._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          setMessages(data);
        } catch (err) {
          console.error("Error fetching messages:", err);
        }
      };

      fetchMessages();
    }
  }, [selectedUser, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !selectedUser || !newMessage.trim()) return;

    const messageData = {
      senderId: userId,
      receiverId: selectedUser._id,
      content: newMessage,
      timestamp: new Date(),
    };

    socket.emit("message", messageData);
    setNewMessage("");
  };

  const handleSelectUser = (contact: User) => {
    setSelectedUser(contact);
    if (isMobile) {
      setShowChat(true);
    }
  };

  // Sort messages to pin only one accepted order at the top
  const sortedMessages = [...messages].sort((a, b) => {
    if (a.type === 'order' && a.status === 'accepted') return -1;
    if (b.type === 'order' && b.status === 'accepted') return 1;
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-xl p-6 w-50%">

        <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
          <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Messages
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Contacts List */}
          {(!isMobile || (isMobile && !showChat)) && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="md:col-span-1">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Contacts</h3>
                <div className="space-y-2">
                  {availableUsers.map((contact) => (
                    <motion.button
                      key={contact._id}
                      onClick={() => handleSelectUser(contact)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedUser?._id === contact._id
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                          : "bg-white hover:shadow-md border border-gray-100"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-200 to-purple-200 flex items-center justify-center text-indigo-600 font-semibold mr-3">
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className={`font-medium ${selectedUser?._id === contact._id ? "text-white" : "text-gray-900"}`}>
                            {contact.name}
                          </p>
                          <p className={`text-sm ${selectedUser?._id === contact._id ? "text-indigo-100" : "text-gray-500"}`}>
                            {contact.role}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Chat Section */}
          {(!isMobile || (isMobile && showChat)) && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="md:col-span-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4">
              {isMobile && (
                <button
                  onClick={() => setShowChat(false)}
                  className="mb-4 text-indigo-600 hover:underline font-semibold"
                >
                  ← Back to Contacts
                </button>
              )}
              {selectedUser ? (
                <div className="h-[600px] flex flex-col">
                  {/* Top Bar */}
                  <div className="flex items-center mb-4 p-4 bg-white rounded-xl shadow">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-200 to-purple-200 flex items-center justify-center text-indigo-600 font-semibold mr-3">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{selectedUser.name}</h4>
                      <p className="text-sm text-gray-500">{selectedUser.role}</p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto scrollbar-hide mb-4 space-y-4 p-4">
                    {sortedMessages.map((message, index) => (
                      <motion.div
                        key={`${message.senderId}-${message.timestamp}-${message.content}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${
                          message.senderId === userId ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-xl p-4 shadow-sm ${
                            message.senderId === userId
                              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                              : "bg-white"
                          } ${message.type === 'order' && message.status === 'accepted' ? 'border-2 border-green-500 bg-green' : ''}`}
                        >
                          {message.type === 'order' ? (
                            <div>
                              <p className="font-semibold">💊 Order Request</p>
                              <p>Drug: {message.drugName}</p>
                              <p>Description: {message.description || 'N/A'}</p>
                              <p>Quantity: {message.quantity}</p>
                              <p>Status: {message.status}</p>
                              {user?.role === 'supplier' && message.status === 'sent' && (
                                <button
                                  onClick={() => handleAcceptOrder(message)}
                                  className="mt-2 px-3 py-1 bg-green-600 text-white text-sm rounded"
                                >
                                  Accept
                                </button>
                              )}
                              {user?.role === 'hospital' && message.status === 'sent' && message.senderId === userId && (
                                <button
                                  onClick={() => openOrderModal(message)}
                                  className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded"
                                >
                                  Edit Order
                                </button>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm">{message.content}</p>
                          )}
                          <p className="text-xs mt-1 text-right">
                            {new Date(message.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <form onSubmit={sendMessage} className="flex gap-3 p-4 bg-white rounded-xl shadow">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-lg bg-gray-50 border-2 border-gray-100"
                      placeholder="Type your message..."
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg"
                    >
                      Send
                    </button>

                    {user?.role === 'hospital' && (
                      <button
                        type="button"
                        onClick={() => openOrderModal()}
                        className="px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                      >
                        Order Drug
                      </button>
                    )}
                  </form>
                </div>
              ) : (
                <div className="h-[600px] flex flex-col items-center justify-center text-gray-500">
                  <svg
                    className="w-16 h-16 text-indigo-200 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <p className="text-lg font-medium text-gray-600">Select a contact to start chatting</p>
                  <p className="text-sm text-gray-400 mt-2">Choose from your available contacts on the left</p>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Order Modal */}
        {showOrderModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-semibold mb-4">
                {editingOrder ? "Edit Order" : "Place Order"}
              </h3>
              <form onSubmit={handleOrderSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Drug Name</label>
                  <input
                    type="text"
                    value={orderForm.drugName}
                    onChange={(e) =>
                      setOrderForm({ ...orderForm, drugName: e.target.value })
                    }
                    className="mt-1 px-4 py-2 w-full rounded-lg bg-gray-50 border-2 border-gray-100"
                    placeholder="Enter drug name"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={orderForm.description}
                    onChange={(e) =>
                      setOrderForm({ ...orderForm, description: e.target.value })
                    }
                    className="mt-1 px-4 py-2 w-full rounded-lg bg-gray-50 border-2 border-gray-100"
                    placeholder="Enter description (optional)"
                    rows={4}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input
                    type="number"
                    value={orderForm.quantity}
                    onChange={(e) =>
                      setOrderForm({ ...orderForm, quantity: e.target.value })
                    }
                    className="mt-1 px-4 py-2 w-full rounded-lg bg-gray-50 border-2 border-gray-100"
                    placeholder="Enter quantity"
                    min="1"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeOrderModal}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    {editingOrder ? "Update Order" : "Send Order"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}