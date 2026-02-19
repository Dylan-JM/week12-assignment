"use client";

import JobsChart from "./JobsChart";
import Link from "next/link";

export default function JobsClient({ id, income, expenses, jobDetails }) {
  //console.log(expenses);
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
      <section className="flex flex-row income-expense-container">
        <section className="flex flex-col">
          <h3 className="text-lg">Expenses</h3>
          <Link href={`/freelancer/jobs/${id}/expense-form`}>Add expense</Link>
          <section className="add-expense-container">
            {expenses.map((expense, index) => {
              return (
                <p key={index} className="feature-card m-2">
                  User: {expense.name} £{expense.price}
                </p>
              );
            })}
          </section>
        </section>
        <section className="flex flex-col">
          <h3 className="text-lg">Income</h3>
          <Link href={`/freelancer/jobs/${id}/income-form`}>Add Income</Link>
          <section className="add-income-container">
            {income.map((amount, index) => {
              return (
                <p key={index} className="feature-card m-2">
                  £{amount}
                </p>
              );
            })}
          </section>
        </section>
      </section>
      <JobsChart id={id} income={income} expenses={expenses} />
    </div>
  );
}
