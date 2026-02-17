"use client";

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function JobsChart({id, income, expenses}) {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current?.getContext("2d");
    if (!ctx) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: "line",
      data: {
        // labels: [],
        datasets: [
          {
            label: "Example",
            data: [income, expenses],
            backgroundColor: "rgba(75, 192, 192, 0.5)",
          },
        ],
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="feature-card">
      <canvas ref={chartRef}></canvas>
    </div>
  );
}