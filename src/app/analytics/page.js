'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { getCustomerRecords } from '@/lib/firebase';
import { format } from 'date-fns';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ClientOnly from '@/components/ClientOnly';
import { useAuth } from '@/context/AuthContext';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart,
    LineController,
    LineElement,
    PointElement,
    BarController,
    BarElement,
    ArcElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
Chart.register(
    LineController,
    LineElement,
    PointElement,
    BarController,
    BarElement,
    ArcElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend
);

// ---------- Main Page ----------
export default function AnalyticsPage() {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    const [records, setRecords] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [monthFilter, setMonthFilter] = useState('all');

    useEffect(() => {
        if (!loading && !isAuthenticated) router.push('/login');
    }, [loading, isAuthenticated, router]);

    const load = useCallback(async () => {
        try {
            setLoadingData(true);
            const data = await getCustomerRecords();
            setRecords(data || []);
        } finally {
            setLoadingData(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) load();
    }, [isAuthenticated, load]);

    // Get available months from records
    const months = useMemo(() => {
        const set = new Set();
        records.forEach(r => {
            const date = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.createdAt);
            const key = format(date, 'yyyy-MM');
            set.add(key);
        });
        return Array.from(set).sort().reverse();
    }, [records]);

    // Filter records by month
    const filteredRecords = useMemo(() => {
        if (monthFilter === 'all') return records;
        return records.filter(r => {
            const date = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.createdAt);
            return format(date, 'yyyy-MM') === monthFilter;
        });
    }, [records, monthFilter]);

    const stats = useMemo(() => {
        if (!filteredRecords.length) {
            return {
                total: 0,
                totalVisits: 0,
                uniqueCustomers: 0,
                avgTicket: 0,
                dailySeries: [],
                serviceSeries: [],
                paymentSeries: []
            };
        }

        const dailyMap = new Map();
        const serviceCount = new Map();
        let total = 0;
        let cash = 0;
        let upi = 0;

        filteredRecords.forEach((r) => {
            const date = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.createdAt);
            const dayKey = format(date, 'yyyy-MM-dd');
            dailyMap.set(dayKey, (dailyMap.get(dayKey) || 0) + (parseFloat(r.amount) || 0));

            const amt = parseFloat(r.amount) || 0;
            total += amt;

            if (r.paymentMode === 'cash') cash += amt;
            else if (r.paymentMode === 'upi') upi += amt;

            // Count services
            const services = Array.isArray(r.services) ? r.services : [r.services || r.service].filter(Boolean);
            services.forEach(s => {
                if (s) serviceCount.set(s, (serviceCount.get(s) || 0) + 1);
            });
        });

        const dailySeries = Array.from(dailyMap.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([label, value]) => ({ label: label.slice(5), value }));

        const serviceSeries = Array.from(serviceCount.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([label, value]) => ({ label, value }));

        const paymentSeries = [
            cash ? { label: 'Cash', value: cash } : null,
            upi ? { label: 'UPI', value: upi } : null
        ].filter(Boolean);

        const totalVisits = filteredRecords.length;
        const avgTicket = totalVisits ? total / totalVisits : 0;

        return {
            total,
            totalVisits,
            avgTicket,
            dailySeries,
            serviceSeries,
            paymentSeries
        };
    }, [filteredRecords]);

    if (loading || !isAuthenticated) return null;

    return (
        <ClientOnly>
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
                {/* Header */}
                <header className="bg-gray-950 border-b border-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/')}
                                className="text-gray-400 hover:text-white flex items-center gap-2"
                            >
                                <ArrowLeft className="h-5 w-5" />
                                <span className="hidden sm:inline">Back</span>
                            </button>
                            <h1 className="text-xl font-bold">Analytics</h1>
                        </div>
                        <button
                            onClick={load}
                            className="px-3 py-2 text-sm rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center gap-2"
                        >
                            <RefreshCw
                                className={loadingData ? 'animate-spin h-4 w-4' : 'h-4 w-4'}
                            />
                            Refresh
                        </button>
                    </div>
                </header>

                {/* Main */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
                    {/* Month Filter */}
                    <div className="mb-6 flex items-center gap-3">
                        <label htmlFor="monthFilter" className="text-sm text-gray-400">Month:</label>
                        <select
                            id="monthFilter"
                            value={monthFilter}
                            onChange={e => setMonthFilter(e.target.value)}
                            className="bg-gray-900 border border-gray-700 text-gray-200 px-2 py-1 rounded"
                        >
                            <option value="all">All</option>
                            {months.map(m => (
                                <option key={m} value={m}>{format(new Date(m + '-01'), 'MMMM yyyy')}</option>
                            ))}
                        </select>
                    </div>
                    {!stats.totalVisits ? (
                        <div className="text-center py-16 text-gray-400">No data yet</div>
                    ) : (
                        <>
                            <Section title="Daily Revenue (₹)" desc="Daily totals as bars and trend line.">
                                <div style={{ position: 'relative', width: '100%', height: '300px' }}>
                                    <Bar
                                        data={{
                                            labels: stats.dailySeries.map(d => d.label),
                                            datasets: [
                                                {
                                                    type: 'bar',
                                                    label: 'Revenue',
                                                    data: stats.dailySeries.map(d => d.value),
                                                    backgroundColor: '#ec4899',
                                                },
                                                {
                                                    type: 'line',
                                                    label: 'Trend',
                                                    data: stats.dailySeries.map(d => d.value),
                                                    borderColor: '#06b6d4',
                                                    backgroundColor: 'rgba(6,182,212,0.2)',
                                                    fill: false,
                                                    tension: 0.3,
                                                },
                                            ],
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: { display: true, labels: { color: '#fff', font: { size: 14, weight: 'bold' } } },
                                                title: { display: false },
                                                tooltip: { enabled: true },
                                            },
                                            scales: {
                                                x: {
                                                    title: { display: true, text: 'Date', color: '#fff', font: { size: 16, weight: 'bold' } },
                                                    ticks: { color: '#fff', font: { size: 13 } }
                                                },
                                                y: {
                                                    title: { display: true, text: '₹', color: '#fff', font: { size: 16, weight: 'bold' } },
                                                    ticks: { color: '#fff', font: { size: 13 } },
                                                    beginAtZero: true
                                                },
                                            },
                                        }}
                                    />
                                </div>
                            </Section>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Section
                                    title="Payment Mode Distribution"
                                    desc="Cash vs UPI split."
                                    statLabel="Total Revenue"
                                    statValue={stats.total}
                                    statPrefix="₹"
                                >
                                    <div style={{ position: 'relative', width: '100%', height: '300px' }}>
                                        <Pie
                                            data={{
                                                labels: stats.paymentSeries.map(p => p.label),
                                                datasets: [
                                                    {
                                                        data: stats.paymentSeries.map(p => p.value),
                                                        backgroundColor: ['#ec4899', '#8b5cf6'],
                                                    },
                                                ],
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: { position: 'bottom', labels: { color: '#fff', font: { size: 14, weight: 'bold' } } },
                                                    tooltip: { enabled: true },
                                                },
                                            }}
                                        />
                                    </div>
                                </Section>
                                <Section
                                    title="Top Services"
                                    desc="Most frequent services this period."
                                    statLabel="Total Customers Served"
                                    statValue={stats.totalVisits}
                                >
                                    <div style={{ position: 'relative', width: '100%', height: '300px' }}>
                                        <Bar
                                            data={{
                                                labels: stats.serviceSeries.map(s => s.label),
                                                datasets: [
                                                    {
                                                        label: 'Count',
                                                        data: stats.serviceSeries.map(s => s.value),
                                                        backgroundColor: '#8b5cf6',
                                                    },
                                                ],
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: { display: false },
                                                    tooltip: { enabled: true },
                                                },
                                                scales: {
                                                    x: {
                                                        title: { display: true, text: 'Service', color: '#fff', font: { size: 16, weight: 'bold' } },
                                                        ticks: { color: '#fff', font: { size: 13 } }
                                                    },
                                                    y: {
                                                        title: { display: true, text: 'Count', color: '#fff', font: { size: 16, weight: 'bold' } },
                                                        ticks: { color: '#fff', font: { size: 13 } },
                                                        beginAtZero: true
                                                    },
                                                },
                                            }}
                                        />
                                    </div>
                                </Section>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </ClientOnly>
    );
}

// ---------- Section Wrapper ----------
function Section({ title, desc, children, statLabel, statValue, statPrefix }) {
    return (
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                <div>
                    <h2 className="text-sm font-semibold text-gray-300 tracking-wide">
                        {title}
                    </h2>
                    {desc && <p className="text-xs text-gray-500 mt-1">{desc}</p>}
                </div>
                {(statLabel && statValue !== undefined) && (
                    <div className="text-xs font-bold text-pink-400 text-right whitespace-nowrap">
                        {statLabel}: <span className="text-white">{statPrefix}{statValue.toLocaleString()}</span>
                    </div>
                )}
            </div>
            <div className="pt-2">{children}</div>
        </div>
    );
}
