"use client";

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function JobsId() {
  const chartRef = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current?.getContext("2d");
    if (!ctx) return;

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["A", "B", "C"],
        datasets: [
          {
            label: "Example",
            data: [10, 20, 30],
            backgroundColor: "rgba(75, 192, 192, 0.5)",
          },
        ],
      },
    });
  }, []);


    return(
        <div className='flex flex-col gap-2'>
            <uppersection className='feature-card-container'>
                <h2 className='text-2xl'>Job Expenses and Income</h2>
                <p className='feature-card'>Job details...</p>
            </uppersection>
            <lowersection className='flex flex-row'>
                <leftsection className='flex flex-col'>
                    <h3 className='text-lg'>Expenses</h3>
                    <subsection className='flex flex-col feature-card-container'>
                        <p className='feature-card'>Expense 1</p>
                        <p className='feature-card'>Expense 2</p>
                        <p className='feature-card'>Expense 3</p>
                    </subsection>
                </leftsection>
                <rightsection className='flex flex-col'>
                    <h3 className='text-lg'>Income</h3>
                    <subsection className='feature-card-container'>
                        <p className='feature-card'>Income 1</p>
                    </subsection>
                        <div className='feature-card'>
                            <canvas ref={chartRef}></canvas>
                        </div>
                </rightsection>
            </lowersection>
        </div>
    )
}