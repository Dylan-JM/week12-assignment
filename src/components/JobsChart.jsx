"use client";

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function JobsChart({id, income, expenses}) {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);  

  useEffect(() => {
  const ctx = chartRef.current?.getContext("2d");
  if (!ctx) return;

  const incomeNums = income.map(Number);
  incomeNums.reverse();
  const incomeData = incomeNums.map((value, index) => ({
    x: index + 1,
    y: value
  }));
  const expenseNums = expenses.map(Number);
  expenseNums.reverse();
  const expenseData = expenseNums.map((value, index) => ({
    x: index + 1,
    y: value
  }));

//   console.log("income:", incomeNums);
//   console.log("expenses:", expenseNums);

  if (chartInstanceRef.current) {
    chartInstanceRef.current.destroy();
  }

  chartInstanceRef.current = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Income",
          data: incomeData,
          borderColor: "rgb(34, 197, 94)",
          backgroundColor: "rgba(34, 197, 94, 0.2)",
          pointRadius: 4
        },
        {
          label: "Expenses",
          data: expenseData,
          borderColor: "rgb(239, 68, 68)",
          backgroundColor: "rgba(239, 68, 68, 0.2)",
          pointRadius: 4
        }
      ]
    },
    options: {
      scales: {
        x: {
          type: "linear"
        }
      }
    }
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