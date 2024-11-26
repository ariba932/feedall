'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
      },
    },
  },
};

export default function UserActivityChart() {
  const [chartData, setChartData] = useState<ChartData<'line'>>({
    labels: [],
    datasets: [],
  });
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchUserActivity() {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('created_at')
        .order('created_at', { ascending: true });

      if (profiles) {
        // Group by date
        const usersByDate = profiles.reduce((acc, profile) => {
          const date = new Date(profile.created_at).toLocaleDateString();
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // Convert to arrays for chart
        const dates = Object.keys(usersByDate);
        const counts = Object.values(usersByDate);

        // Calculate cumulative sum
        const cumulativeCounts = counts.reduce(
          (acc: number[], count: number) => {
            const lastCount = acc[acc.length - 1] || 0;
            acc.push(lastCount + count);
            return acc;
          },
          []
        );

        setChartData({
          labels: dates,
          datasets: [
            {
              label: 'New Users',
              data: counts,
              borderColor: 'rgb(53, 162, 235)',
              backgroundColor: 'rgba(53, 162, 235, 0.5)',
              tension: 0.3,
            },
            {
              label: 'Total Users',
              data: cumulativeCounts,
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              tension: 0.3,
            },
          ],
        });
      }
    }

    fetchUserActivity();
  }, [supabase]);

  return (
    <div className="h-[300px]">
      <Line options={options} data={chartData} />
    </div>
  );
}
