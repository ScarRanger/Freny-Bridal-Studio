"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft } from "lucide-react";

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
    const [showModify, setShowModify] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [showEditModal, setShowEditModal] = useState(false);
    const router = useRouter();
    // Server-side fetch bookings
    const fetchBookings = async () => {
        setLoadingBookings(true);
        try {
            const res = await fetch("/api/bookings");
            const data = await res.json();
            if (data.success) setBookings(data.bookings);
            else throw new Error(data.error);
        } catch (e) {
            alert("Failed to fetch bookings");
        } finally {
            setLoadingBookings(false);
        }
    };

    useEffect(() => {
        if (showModify) fetchBookings();
    }, [showModify]);

    const handleEditClick = (booking) => {
        setEditingId(booking.id);
        setEditForm({ ...booking });
        setShowEditModal(true);
    };

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleEditSave = async () => {
        try {
            const res = await fetch("/api/bookings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: editingId, data: editForm })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            setEditingId(null);
            setShowEditModal(false);
            fetchBookings();
        } catch (e) {
            alert("Failed to update booking");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this booking?")) return;
        try {
            const res = await fetch("/api/bookings", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            fetchBookings();
        } catch (e) {
            alert("Failed to delete booking");
        }
    };

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
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            setSuccess(true);
            setForm({ name: "", number: "", service: "", date: "", time: "", notes: "" });
            setShowForm(false);
            if (showModify) fetchBookings();
        } catch (e) {
            alert("Failed to add booking");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center py-12 px-4">
                <p className="mt-4 text-gray-300">Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-start">
            {/* Header */}
            <header className="w-full bg-gray-950 shadow-sm border-b border-gray-800">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center py-4">
                        <button
                            onClick={() => router.push("/")}
                            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors mr-4"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            <span className="hidden sm:inline">Back</span>
                        </button>
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-lg">B</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Manage Bookings</h1>
                                <p className="text-sm text-gray-400">Add, edit, or delete bookings</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            <main className="w-full flex flex-col items-center justify-start py-12 px-4">
            <div className="flex gap-4 mb-8">
                <button
                    className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-3 rounded-lg font-semibold shadow hover:from-blue-600 hover:to-green-600 transition-all duration-200"
                    onClick={() => setShowForm(true)}
                >
                    Add Booking
                </button>
                <button
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold shadow hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                    onClick={() => setShowModify((v) => !v)}
                >
                    Modify Bookings
                </button>
            </div>
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
            {showModify && (
                <div className="w-full max-w-2xl bg-gray-950 rounded-2xl shadow-xl p-8 mt-8">
                    <h2 className="text-xl font-bold text-white mb-4">All Bookings</h2>
                    {loadingBookings ? (
                        <div className="text-gray-300">Loading...</div>
                    ) : bookings.length === 0 ? (
                        <div className="text-gray-400">No bookings found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                        <table className="w-full text-left text-gray-200 border border-gray-800 rounded-lg">
                            <thead>
                                <tr className="bg-gray-900">
                                    <th className="py-2 px-3 border-b border-gray-800">Name</th>
                                    <th className="py-2 px-3 border-b border-gray-800">Number</th>
                                    <th className="py-2 px-3 border-b border-gray-800">Service</th>
                                    <th className="py-2 px-3 border-b border-gray-800">Date</th>
                                    <th className="py-2 px-3 border-b border-gray-800">Time</th>
                                    <th className="py-2 px-3 border-b border-gray-800">Notes</th>
                                    <th className="py-2 px-3 border-b border-gray-800">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((b) => (
                                    <tr key={b.id} className={`border-b border-gray-800 hover:bg-gray-900/60 transition-colors`}>
                                        <td className="py-1 px-3 align-middle">{b.name}</td>
                                        <td className="py-1 px-3 align-middle">{b.number}</td>
                                        <td className="py-1 px-3 align-middle">{b.service}</td>
                                        <td className="py-1 px-3 align-middle">{b.date}</td>
                                        <td className="py-1 px-3 align-middle">{b.time}</td>
                                        <td className="py-1 px-3 align-middle">{b.notes}</td>
                                        <td className="py-1 px-3 align-middle flex gap-2 items-center">
                                            <button type="button" onClick={() => handleEditClick(b)} className="bg-blue-600 px-3 py-1 rounded text-white font-semibold hover:bg-blue-700 transition text-sm">Edit</button>
                                            <button type="button" onClick={() => handleDelete(b.id)} className="bg-red-600 px-3 py-1 rounded text-white font-semibold hover:bg-red-700 transition text-sm">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    )}
                    {/* Modal for editing */}
                    {showEditModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                            <div className="relative w-full max-w-md mx-auto bg-gray-950 rounded-2xl shadow-2xl p-8 flex flex-col gap-6 animate-fade-in">
                                <button className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl" onClick={() => { setShowEditModal(false); setEditingId(null); }}>&times;</button>
                                <h2 className="text-2xl font-bold text-white mb-2">Edit Record</h2>
                                <div className="flex flex-col gap-4">
                                    <div>
                                        <label className="block text-gray-300 text-base mb-1">Customer Name<span className="text-pink-500">*</span></label>
                                        <input name="name" value={editForm.name || ""} onChange={handleEditChange} className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 text-base mb-1">Phone Number</label>
                                        <input name="number" value={editForm.number || ""} onChange={handleEditChange} className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 text-base mb-1">Service<span className="text-pink-500">*</span></label>
                                        <input name="service" value={editForm.service || ""} onChange={handleEditChange} className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg" />
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-gray-300 text-base mb-1">Date<span className="text-pink-500">*</span></label>
                                            <input name="date" value={editForm.date || ""} onChange={handleEditChange} className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg" type="date" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-gray-300 text-base mb-1">Time<span className="text-pink-500">*</span></label>
                                            <input name="time" value={editForm.time || ""} onChange={handleEditChange} className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg" type="time" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 text-base mb-1">Notes</label>
                                        <textarea name="notes" value={editForm.notes || ""} onChange={handleEditChange} className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg resize-none" rows={2} />
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-2">
                                    <button type="button" onClick={handleEditSave} className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg font-semibold shadow hover:from-pink-600 hover:to-purple-600 transition-all duration-200 text-lg">Save Changes</button>
                                    <button type="button" onClick={() => { setShowEditModal(false); setEditingId(null); }} className="flex-1 bg-gray-800 text-gray-300 py-3 rounded-lg font-semibold shadow hover:bg-gray-700 transition-all duration-200 text-lg">Cancel</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
            </main>
        </div>
    );
}
