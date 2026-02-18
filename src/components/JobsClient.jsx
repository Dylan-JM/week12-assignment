"use client";

import JobsChart from "./JobsChart";
import Link from "next/link";

export default function JobsClient({ id, income, expenses, jobDetails }) {
  console.log(jobDetails);
  return (
    <div className="flex flex-col gap-2 analytics-contents">
      <section className="flex flex-col feature-card-container">
        <h2 className="text-2xl">
          <strong>Job Expenses and Income</strong>
        </h2>
        <h1>
          <strong>{jobDetails[0].title}</strong>
        </h1>
        <p className="feature-card">
          <strong>Description : </strong>
          {jobDetails[0].description}
        </p>
      </section>
      <section className="flex flex-row">
        <section className="flex flex-col">
          <h3 className="text-lg">Expenses</h3>
          <Link href={`/freelancer/jobs/${id}/expense-form`}>Add expense</Link>
          <section className="flex flex-col feature-card-container">
            {expenses.map((expense, index) => {
              return (
                <p key={index} className="feature-card">
                  £{expense}
                </p>
              );
            })}
          </section>
        </section>
        <section className="flex flex-col">
          <h3 className="text-lg">Income</h3>
          <Link href={`/freelancer/jobs/${id}/income-form`}>Add Income</Link>
          <section className="feature-card-container">
            {income.map((amount, index) => {
              return (
                <p key={index} className="feature-card">
                  £{amount}
                </p>
              );
            })}
          </section>
          <JobsChart id={id} income={income} expenses={expenses} />
        </section>
      </section>
    </div>
  );
}
