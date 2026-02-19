import JobsClient from "@/components/JobsClient";
import UpgradePlanCard from "@/components/UpgradePlanCard";
import { db } from "@/lib/dbConnection";
import { auth } from "@clerk/nextjs/server";

export default async function JobsId({ params }) {
  const { has } = await auth();
  const hasAccess =
    has({ feature: "basic_analytics" }) ||
    has({ feature: "full_analytics_suite" });

  if (!hasAccess) {
    return (
      <UpgradePlanCard
        title="Upgrade to view job details"
        description="This page is available on the Advanced or Pro plan. Upgrade to track income and expenses for your jobs."
      />
    );
  }

  const { id } = await params;
  let { rows: incomeRows } = await db.query(
    `SELECT * FROM fm_income WHERE job_id = $1`,
    [id],
  );
  // console.log({id});
  // console.log({incomeRows});
  const income = [];
  for (let i = 0; i < incomeRows.length; i++) {
    income.push(incomeRows[i].amount);
  }
  // console.log(income);

  let { rows: expenseRows } = await db.query(
    `SELECT * FROM fm_expenses WHERE job_id = $1`,
    [id],
  );
  // console.log({id});
  // console.log({expenseRows});
  const expenses = [];
  for (let i = 0; i < expenseRows.length; i++) {
    expenses.push(expenseRows[i].price);
  }
  // console.log(expenses);

  let { rows: jobDetails } = await db.query(
    `SELECT * FROM fm_jobs WHERE id = $1`,
    [id],
  );

  return (
    <JobsClient
      id={id}
      income={income}
      expenses={expenses}
      jobDetails={jobDetails}
    />
  );
}
