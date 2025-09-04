'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { getCustomerRecords } from '@/lib/firebase';
import { format } from 'date-fns';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ClientOnly from '@/components/ClientOnly';
import { useAuth } from '@/context/AuthContext';

// ---------- Bar Chart ----------
function BarChart({ data, height = 200, color = '#8b5cf6' }) {
    if (!data?.length) return <div className="text-xs text-gray-500">No data</div>;

    const rawMax = Math.max(...data.map(d => d.value), 1);
    const max = rawMax * 1.1;
    const paddingBottom = 35;
    const chartHeight = height - paddingBottom;
    const barWidthPct = Math.min(20, 60 / data.length); // adaptive width
    const interval = Math.ceil(data.length / 7); // ~7 labels max
    const singleMonth = new Set(data.map(d => d.label.slice(0, 2))).size === 1;

    return (
        <svg
            viewBox={`0 0 100 ${height}`}
            className="w-full"
            preserveAspectRatio="none"
            role="img"
            aria-label="Bar chart"
        >
            {/* Gridlines */}
            {[0, 25, 50, 75, 100].map(g => (
                <line
                    key={g}
                    x1={0}
                    x2={100}
                    y1={(g / 100) * chartHeight}
                    y2={(g / 100) * chartHeight}
                    stroke="#374151"
                    strokeWidth={0.3}
                />
            ))}

            {/* Bars */}
            {data.map((d, i) => {
                const slot = 100 / data.length;
                const barWidth = slot * (barWidthPct / 100);
                const x = i * slot + (slot - barWidth) / 2;
                const pct = (d.value / max) || 0;
                const h = Math.max(pct * chartHeight, 2);
                const y = chartHeight - h;
                return (
                    <g key={i}>
                        <rect
                            x={x}
                            y={y}
                            width={barWidth}
                            height={h}
                            fill={color}
                            rx={0.8}
                        />
                        <title>{`${d.label}: ₹${d.value}`}</title>
                    </g>
                );
            })}

            {/* Y-axis labels */}
            {[0, 0.5, 1].map((p, idx) => (
                <text
                    key={idx}
                    x={1}
                    y={(1 - p) * chartHeight - 2}
                    fontSize={5}
                    fill="#9ca3af"
                    textAnchor="start"
                >
                    ₹{Math.round(rawMax * p)}
                </text>
            ))}

            {/* X-axis labels */}
            {data.map((d, i) => {
                if (i % interval !== 0) return null;
                const slot = 100 / data.length;
                const x = i * slot + slot / 2;
                const raw = d.label;
                const lbl = singleMonth ? raw.slice(3) : raw;
                return (
                    <g
                        key={`lbl-${i}`}
                        transform={`translate(${x},${chartHeight + 25}) rotate(-40)`}
                    >
                        <text fontSize={5} textAnchor="end" fill="#9ca3af">
                            {lbl}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}

// ---------- Pie Chart ----------
function PieChart({ data, size = 140 }) {
    if (!data?.length) return <div className="text-xs text-gray-500">No data</div>;

    const total = data.reduce((s, d) => s + d.value, 0) || 1;
    let cumulative = 0;
    const colors = ['#ec4899', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#f472b6'];

    return (
        <svg
            role="img"
            aria-label="Pie chart"
            viewBox="0 0 32 32"
            width={size}
            height={size}
            className="mx-auto"
        >
            {data.map((d, i) => {
                const start = (cumulative / total) * 2 * Math.PI;
                const slice = (d.value / total) * 2 * Math.PI;
                cumulative += d.value;
                const end = start + slice;

                const x1 = 16 + 16 * Math.sin(start);
                const y1 = 16 - 16 * Math.cos(start);
                const x2 = 16 + 16 * Math.sin(end);
                const y2 = 16 - 16 * Math.cos(end);

                const large = slice > Math.PI ? 1 : 0;
                const path = `M16 16 L ${x1} ${y1} A 16 16 0 ${large} 1 ${x2} ${y2} Z`;

                return (
                    <g key={i}>
                        <path
                            d={path}
                            fill={colors[i % colors.length]}
                            stroke="#111827"
                            strokeWidth="0.2"
                        />
                        {slice > 0.4 && (
                            <text
                                x={16 + 8 * Math.sin((start + end) / 2)}
                                y={16 - 8 * Math.cos((start + end) / 2)}
                                textAnchor="middle"
                                fill="white"
                                fontSize="2.5"
                            >
                                {((d.value / total) * 100).toFixed(0)}%
                            </text>
                        )}
                    </g>
                );
            })}
        </svg>
    );
}

// ---------- Main Page ----------
export default function AnalyticsPage() {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    const [records, setRecords] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

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

    const stats = useMemo(() => {
        if (!records.length) {
            return {
                total: 0,
                totalVisits: 0,
                uniqueCustomers: 0,
                avgTicket: 0,
                repeat: 0,
                dailySeries: [],
                paymentSeries: [],
                repeatSplit: []
            };
        }

        const dailyMap = new Map();
        const customerVisits = new Map();
        let total = 0;
        let cash = 0;
        let upi = 0;

        records.forEach((r) => {
            const date = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.createdAt);
            const dayKey = format(date, 'yyyy-MM-dd');
            dailyMap.set(dayKey, (dailyMap.get(dayKey) || 0) + (parseFloat(r.amount) || 0));

            const amt = parseFloat(r.amount) || 0;
            total += amt;

            if (r.paymentMode === 'cash') cash += amt;
            else if (r.paymentMode === 'upi') upi += amt;

            const custKey = (r.phone || r.name || '').trim().toLowerCase();
            if (custKey) customerVisits.set(custKey, (customerVisits.get(custKey) || 0) + 1);
        });

        const dailySeries = Array.from(dailyMap.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([label, value]) => ({ label: label.slice(5), value }));

        const paymentSeries = [
            cash ? { label: 'Cash', value: cash } : null,
            upi ? { label: 'UPI', value: upi } : null
        ].filter(Boolean);

        const totalVisits = records.length;
        const uniqueCustomers = customerVisits.size;
        const avgTicket = totalVisits ? total / totalVisits : 0;
        const repeat = Array.from(customerVisits.values()).filter((v) => v > 1).length;

        return {
            total,
            totalVisits,
            uniqueCustomers,
            avgTicket,
            repeat,
            dailySeries,
            paymentSeries,
            repeatSplit: [
                { label: 'Repeat', value: repeat },
                { label: 'New', value: Math.max(uniqueCustomers - repeat, 0) }
            ]
        };
    }, [records]);

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
                    {!stats.totalVisits ? (
                        <div className="text-center py-16 text-gray-400">No data yet</div>
                    ) : (
                        <>
                            <Section title="Daily Revenue (₹)" desc="Daily totals as bars.">
                                <BarChart data={stats.dailySeries} height={220} color="#ec4899" />
                            </Section>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Section
                                    title="Payment Mode Distribution"
                                    desc="Cash vs UPI split."
                                >
                                    <div className="flex items-center justify-around">
                                        <PieChart data={stats.paymentSeries} />
                                        <ul className="text-xs space-y-1">
                                            {stats.paymentSeries.map((p) => (
                                                <li
                                                    key={p.label}
                                                    className="flex items-center gap-2"
                                                >
                                                    <span
                                                        className="inline-block w-2 h-2 rounded-full"
                                                        style={{
                                                            background:
                                                                p.label === 'Cash'
                                                                    ? '#ec4899'
                                                                    : '#8b5cf6'
                                                        }}
                                                    />
                                                    {p.label}: ₹
                                                    {p.value.toLocaleString('en-IN')} (
                                                    {((p.value / stats.total) * 100).toFixed(0)}%)
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </Section>

                                <Section
                                    title="Repeat vs New Customers"
                                    desc="Customer loyalty insights."
                                >
                                    <div className="flex items-center justify-around">
                                        <PieChart data={stats.repeatSplit} />
                                        <ul className="text-xs space-y-1">
                                            {stats.repeatSplit.map((p) => (
                                                <li key={p.label}>
                                                    {p.label}: {p.value} (
                                                    {(
                                                        (p.value /
                                                            (stats.repeatSplit.reduce(
                                                                (s, v) => s + v.value,
                                                                0
                                                            ) || 1)) *
                                                        100
                                                    ).toFixed(0)}
                                                    %)
                                                </li>
                                            ))}
                                        </ul>
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
function Section({ title, desc, children }) {
    return (
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 shadow-lg">
            <h2 className="text-sm font-semibold text-gray-300 mb-1 tracking-wide">
                {title}
            </h2>
            {desc && <p className="text-xs text-gray-500 mb-3">{desc}</p>}
            {children}
        </div>
    );
}
