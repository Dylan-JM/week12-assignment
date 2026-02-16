"use client"

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function JobsChart(){
    
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
    <div className='feature-card'>
        <canvas ref={chartRef}></canvas>
    </div>
    )
}