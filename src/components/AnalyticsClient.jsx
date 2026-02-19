"use client";

import AnalyticsChart from "./AnalyticsChart";
import Link from "next/link";

export default function AnalyticsClient({ id, income, expenses }) {
  return (
    <>
      <section className="chart-page-container">
        <h2 className="text-2xl">Analytics</h2>
        <p className="feature-card">
          The data in the chart below contains all of your income and expenses.
        </p>
      </section>
      <AnalyticsChart id={id} income={income} expenses={expenses} />
    </>
  );
}
