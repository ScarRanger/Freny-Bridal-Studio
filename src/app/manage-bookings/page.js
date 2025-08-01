"use client";

import React, { useState, useEffect } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, parseISO } from "date-fns";
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
    const [calendarMonth, setCalendarMonth] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);
    const [dayBookings, setDayBookings] = useState([]);
    const router = useRouter();

    // Group bookings by date (YYYY-MM-DD)
    const bookingsByDate = {};
    bookings.forEach(b => {
        const dateKey = b.date || (b.createdAt ? format(new Date(b.createdAt), 'yyyy-MM-dd') : '');
        if (!bookingsByDate[dateKey]) bookingsByDate[dateKey] = [];
        bookingsByDate[dateKey].push(b);
    });

    // Calendar helpers
    const renderCalendar = () => {
        const monthStart = startOfMonth(calendarMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
        const dateFormat = "d";
        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";
        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, dateFormat);
                const fullDate = format(day, 'yyyy-MM-dd');
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isToday = isSameDay(day, new Date());
                const hasBookings = bookingsByDate[fullDate] && bookingsByDate[fullDate].length > 0;
                days.push(
                    <div
                        key={day}
                        className={`flex flex-col items-center justify-center h-16 w-12 rounded-lg cursor-pointer transition-all
                            ${isCurrentMonth ? 'bg-gray-900' : 'bg-gray-800 opacity-60'}
                            ${isToday ? 'border-2 border-blue-500' : ''}
                            ${hasBookings ? 'ring-2 ring-green-400' : ''}
                            hover:bg-gray-700`}
                        onClick={() => {
                            setSelectedDay(fullDate);
                            setDayBookings(bookingsByDate[fullDate] || []);
                        }}
                    >
                        <span className={`text-lg font-semibold ${isCurrentMonth ? 'text-white' : 'text-gray-500'}`}>{formattedDate}</span>
                        {/* Dot indicator for days with bookings */}
                        {hasBookings && (
                            <span className="mt-1 w-2 h-2 rounded-full bg-green-400 block"></span>
                        )}
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="flex justify-between" key={day}>
                    {days}
                </div>
            );
            days = [];
        }
        return rows;
    };
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
        // Fetch bookings on initial load and when showModify is toggled
        fetchBookings();
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
            {/* Calendar Controls */}
            <div className="w-full max-w-2xl bg-gray-950 rounded-2xl shadow-xl p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))} className="text-gray-400 hover:text-white text-2xl font-bold">&#8592;</button>
                    <span className="text-lg font-bold text-white">{format(calendarMonth, 'MMMM yyyy')}</span>
                    <button onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))} className="text-gray-400 hover:text-white text-2xl font-bold">&#8594;</button>
                </div>
                {/* Weekdays */}
                <div className="flex justify-between mb-2">
                    {["S","M","T","W","T","F","S"].map((d, i) => (
                        <div key={d + i} className="w-12 text-center text-gray-400 font-semibold">{d}</div>
                    ))}
                </div>
                {/* Calendar Grid */}
                <div className="flex flex-col gap-1">{renderCalendar()}</div>
            </div>
            <div className="flex gap-4 mb-8">
                <button
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold shadow hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                    onClick={() => setShowModify((v) => !v)}
                >
                    Modify Bookings
                </button>
            </div>
            {/* Day Bookings Modal */}
            {selectedDay && (
                <DayBookingsModal
                    selectedDay={selectedDay}
                    setSelectedDay={setSelectedDay}
                    bookings={dayBookings}
                    allBookings={bookings}
                    setBookings={setBookings}
                    setDayBookings={setDayBookings}
                    format={format}
                    parseISO={parseISO}
                />
            )}
            {/* ...rest of the code... */}
        </main>
    </div>
    );
}

// Modal component for day bookings, add, edit, delete
function DayBookingsModal({ selectedDay, setSelectedDay, bookings, allBookings, setBookings, setDayBookings, format, parseISO }) {
    const [showAdd, setShowAdd] = React.useState(false);
    const [addForm, setAddForm] = React.useState({ name: "", number: "", service: "", time: "", notes: "" });
    const [submitting, setSubmitting] = React.useState(false);
    const [editIdx, setEditIdx] = React.useState(null);
    const [editForm, setEditForm] = React.useState({});

    // Add booking
    const handleAdd = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const formData = { ...addForm, date: selectedDay };
            const res = await fetch("/api/add-booking", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            setAddForm({ name: "", number: "", service: "", time: "", notes: "" });
            setShowAdd(false);
            // Refresh bookings for this day
            const res2 = await fetch("/api/bookings");
            const data2 = await res2.json();
            if (data2.success) {
                setBookings(data2.bookings);
                setDayBookings((data2.bookings || []).filter(b => (b.date || (b.createdAt ? format(new Date(b.createdAt), 'yyyy-MM-dd') : '')) === selectedDay));
            }
        } catch (e) {
            alert("Failed to add booking");
        } finally {
            setSubmitting(false);
        }
    };

    // Edit booking
    const handleEdit = (idx, booking) => {
        setEditIdx(idx);
        setEditForm({ ...booking });
    };
    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };
    const handleEditSave = async (id) => {
        setSubmitting(true);
        try {
            const res = await fetch("/api/bookings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, data: editForm })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            setEditIdx(null);
            setEditForm({});
            // Refresh bookings for this day
            const res2 = await fetch("/api/bookings");
            const data2 = await res2.json();
            if (data2.success) {
                setBookings(data2.bookings);
                setDayBookings((data2.bookings || []).filter(b => (b.date || (b.createdAt ? format(new Date(b.createdAt), 'yyyy-MM-dd') : '')) === selectedDay));
            }
        } catch (e) {
            alert("Failed to update booking");
        } finally {
            setSubmitting(false);
        }
    };

    // Delete booking
    const handleDelete = async (id) => {
        if (!window.confirm("Delete this booking?")) return;
        setSubmitting(true);
        try {
            const res = await fetch("/api/bookings", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            // Refresh bookings for this day
            const res2 = await fetch("/api/bookings");
            const data2 = await res2.json();
            if (data2.success) {
                setBookings(data2.bookings);
                setDayBookings((data2.bookings || []).filter(b => (b.date || (b.createdAt ? format(new Date(b.createdAt), 'yyyy-MM-dd') : '')) === selectedDay));
            }
        } catch (e) {
            alert("Failed to delete booking");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="relative w-full max-w-lg mx-auto bg-gray-950 rounded-2xl shadow-2xl p-8 animate-fade-in">
                <button className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl" onClick={() => setSelectedDay(null)}>&times;</button>
                <h2 className="text-2xl font-bold text-white mb-4">Bookings for {format(parseISO(selectedDay), 'dd MMM yyyy')}</h2>
                {bookings.length === 0 ? (
                    <div className="text-gray-400 mb-4">No bookings for this day.</div>
                ) : (
                    <ul className="divide-y divide-gray-800 mb-4">
                        {bookings.map((b, idx) => (
                            <li key={b.id || idx} className="py-3">
                                {editIdx === idx ? (
                                    <form className="flex flex-col gap-2" onSubmit={e => { e.preventDefault(); handleEditSave(b.id); }}>
                                        <input name="name" value={editForm.name || ""} onChange={handleEditChange} className="bg-gray-900 text-white px-2 py-1 rounded" required />
                                        <input name="number" value={editForm.number || ""} onChange={handleEditChange} className="bg-gray-900 text-white px-2 py-1 rounded" />
                                        <input name="service" value={editForm.service || ""} onChange={handleEditChange} className="bg-gray-900 text-white px-2 py-1 rounded" required />
                                        <input name="time" value={editForm.time || ""} onChange={handleEditChange} className="bg-gray-900 text-white px-2 py-1 rounded" required type="time" />
                                        <textarea name="notes" value={editForm.notes || ""} onChange={handleEditChange} className="bg-gray-900 text-white px-2 py-1 rounded" rows={2} />
                                        <div className="flex gap-2 mt-1">
                                            <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-3 py-1 rounded font-semibold">Save</button>
                                            <button type="button" onClick={() => setEditIdx(null)} className="bg-gray-700 text-gray-300 px-3 py-1 rounded font-semibold">Cancel</button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="flex flex-col gap-1">
                                        <span className="text-white font-semibold">{b.name}</span>
                                        <span className="text-gray-400 text-sm">{b.service}</span>
                                        <span className="text-gray-400 text-xs">{b.time || ''}</span>
                                        {b.number && <span className="text-gray-500 text-xs">{b.number}</span>}
                                        {b.notes && <span className="text-gray-500 text-xs italic">{b.notes}</span>}
                                        <div className="flex gap-2 mt-1">
                                            <button type="button" onClick={() => handleEdit(idx, b)} className="bg-blue-600 text-white px-3 py-1 rounded font-semibold text-xs">Edit</button>
                                            <button type="button" onClick={() => handleDelete(b.id)} className="bg-red-600 text-white px-3 py-1 rounded font-semibold text-xs">Delete</button>
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
                {showAdd ? (
                    <form onSubmit={handleAdd} className="w-full flex flex-col gap-2 mt-2">
                        <input name="name" value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} className="bg-gray-900 text-white px-2 py-1 rounded" required placeholder="Customer Name" />
                        <input name="number" value={addForm.number} onChange={e => setAddForm(f => ({ ...f, number: e.target.value }))} className="bg-gray-900 text-white px-2 py-1 rounded" placeholder="Phone Number (optional)" />
                        <input name="service" value={addForm.service} onChange={e => setAddForm(f => ({ ...f, service: e.target.value }))} className="bg-gray-900 text-white px-2 py-1 rounded" required placeholder="Service" />
                        <input name="time" value={addForm.time} onChange={e => setAddForm(f => ({ ...f, time: e.target.value }))} className="bg-gray-900 text-white px-2 py-1 rounded" required type="time" />
                        <textarea name="notes" value={addForm.notes} onChange={e => setAddForm(f => ({ ...f, notes: e.target.value }))} className="bg-gray-900 text-white px-2 py-1 rounded" rows={2} placeholder="Notes (optional)" />
                        <div className="flex gap-2 mt-1">
                            <button type="submit" disabled={submitting} className="bg-green-600 text-white px-3 py-1 rounded font-semibold">Add</button>
                            <button type="button" onClick={() => setShowAdd(false)} className="bg-gray-700 text-gray-300 px-3 py-1 rounded font-semibold">Cancel</button>
                        </div>
                    </form>
                ) : (
                    <button onClick={() => setShowAdd(true)} className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white py-2 rounded-lg font-semibold mt-2">Add Booking</button>
                )}
                <button type="button" onClick={() => setSelectedDay(null)} className="w-full bg-gray-800 text-gray-300 py-2 rounded-lg font-semibold shadow hover:bg-gray-700 transition-all duration-200 mt-4">Close</button>
            </div>
        </div>
    );
}
// ...existing code...

