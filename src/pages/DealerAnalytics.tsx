import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import BlurText from '../components/BlurText';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

interface Stat {
  title: string;
  value: number | string;
}

// Each slice of the pie
interface PieSlice {
  name: string;
  value: number;
}

export default function DealerAnalytics() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [pieData, setPieData] = useState<PieSlice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // ─────────────────────────────────────────────
      // 1) Total Listings and Total Favorites
      // ─────────────────────────────────────────────
      const [listingsRes, favoritesRes] = await Promise.all([
        supabase.from('cars').select('*', { count: 'exact' }),
        supabase.from('favorites').select('*', { count: 'exact' })
      ]);

      if (listingsRes.error) {
        throw new Error(`Listings error: ${listingsRes.error.message}`);
      }
      if (favoritesRes.error) {
        throw new Error(`Favorites error: ${favoritesRes.error.message}`);
      }

      const totalListings = listingsRes.count ?? 0;
      const totalFavorites = favoritesRes.count ?? 0;

      setStats([
        { title: 'Total Listings', value: totalListings },
        { title: 'Total Favorites', value: totalFavorites }
      ]);

      // ─────────────────────────────────────────────
      // 2) Vehicle Type Distribution (Pie chart)
      // ─────────────────────────────────────────────
      const carTypesRes = await supabase.from('cars').select('car_type');
      if (carTypesRes.error) {
        throw new Error(`Car types error: ${carTypesRes.error.message}`);
      }

      if (carTypesRes.data) {
        // Count how many cars of each type
        const typeCounts: Record<string, number> = {};
        carTypesRes.data.forEach((row) => {
          const type = row.car_type ?? 'Unknown';
          typeCounts[type] = (typeCounts[type] || 0) + 1;
        });

        // Convert to array suitable for Pie
        const pieArray: PieSlice[] = Object.entries(typeCounts).map(
          ([name, value]) => ({ name, value })
        );
        setPieData(pieArray);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error loading stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();

    // Realtime subscription for new favorites
    const favChannel = supabase
      .channel('favorites-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'favorites' },
        () => {
          loadStats();
        }
      )
      .subscribe();

    // Realtime subscription for new cars (affects both total listings and pie)
    const carsChannel = supabase
      .channel('cars-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cars' },
        () => {
          loadStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(favChannel);
      supabase.removeChannel(carsChannel);
    };
  }, []);

  // A list of colors for Pie slices. They’ll cycle if there are more types than colors.
  const PIE_COLORS = ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE'];

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <BlurText
          text="Dealer Analytics"
          delay={150}
          animateBy="words"
          direction="top"
          className="text-3xl font-bold text-gray-900 dark:text-white"
        />
      </div>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
          role="alert"
        >
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
        </div>
      ) : (
        <>
          {/* ─────────────────────────────────────────────
              1) Stats Cards: Total Listings / Favorites
            ───────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            {stats.map((s) => (
              <div
                key={s.title}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transform hover:scale-105 transition-transform duration-300"
              >
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {s.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400">{s.title}</div>
              </div>
            ))}
          </div>

          {/* ─────────────────────────────────────────────
              2) Vehicle Type Distribution (Pie Chart)
            ───────────────────────────────────────────── */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Vehicle Type Distribution
            </h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-48 text-gray-500 dark:text-gray-400">
                No vehicle type data available
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

