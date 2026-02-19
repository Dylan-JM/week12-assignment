"use client";

import AnalyticsChart from "./AnalyticsChart";
import Link from "next/link";

export default function AnalyticsClient({ id, income, expenses }) {
  return (
    <div className="flex flex-col gap-2 active-jobs-container">
      <section className="flex flex-col feature-card-container ">
        <h2 className="text-2xl">Analytics</h2>
        <p className="feature-card">The data in the chart below contains all of your income and expenses.</p>
      </section>
        <AnalyticsChart id={id} income={income} expenses={expenses} />
    </div>
  );
}
