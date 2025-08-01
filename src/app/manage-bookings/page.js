"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ManageBookingsPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    number: "",
    service: "",
    date: "",
    time: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Save to Firestore and Google Sheets via API route
      const res = await fetch("/api/add-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error || "Unknown error");
      setSuccess(true);
      setForm({ name: "", number: "", service: "", date: "", time: "", notes: "" });
      setShowForm(false);
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      alert("Error saving booking: " + (error.message || error));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-start py-12 px-4">
      <h1 className="text-3xl font-bold text-white mb-8">Manage Bookings</h1>
      <button
        className="mb-8 bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-3 rounded-lg font-semibold shadow hover:from-blue-600 hover:to-green-600 transition-all duration-200"
        onClick={() => setShowForm(true)}
      >
        Add Booking
      </button>
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-gray-950 rounded-2xl shadow-xl p-8 flex flex-col gap-4 mb-8"
        >
          <label className="text-gray-300 font-medium">Name<span className="text-pink-500">*</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Customer Name"
              className="mt-1 w-full px-4 py-2 rounded-lg bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="text-gray-300 font-medium">Number
            <input
              type="tel"
              name="number"
              value={form.number}
              onChange={handleChange}
              placeholder="Phone Number (optional)"
              className="mt-1 w-full px-4 py-2 rounded-lg bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="text-gray-300 font-medium">Service<span className="text-pink-500">*</span>
            <input
              type="text"
              name="service"
              value={form.service}
              onChange={handleChange}
              required
              placeholder="Service"
              className="mt-1 w-full px-4 py-2 rounded-lg bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <div className="flex gap-4">
            <label className="flex-1 text-gray-300 font-medium">Date<span className="text-pink-500">*</span>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
                className="mt-1 w-full px-4 py-2 rounded-lg bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <label className="flex-1 text-gray-300 font-medium">Time<span className="text-pink-500">*</span>
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
                required
                className="mt-1 w-full px-4 py-2 rounded-lg bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>
          <label className="text-gray-300 font-medium">Notes
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Additional notes (optional)"
              className="mt-1 w-full px-4 py-2 rounded-lg bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </label>
          <div className="flex gap-4 mt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 text-white py-2 rounded-lg font-semibold shadow hover:from-blue-600 hover:to-green-600 transition-all duration-200 disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Save Booking"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 bg-gray-800 text-gray-300 py-2 rounded-lg font-semibold shadow hover:bg-gray-700 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      {success && (
        <div className="text-green-400 font-semibold mb-4">Booking added!</div>
      )}
      {/* Bookings list can be added here in the future */}
    </div>
  );
}
