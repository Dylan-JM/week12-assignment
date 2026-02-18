import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/dbConnection";
import AnalyticsClient from "@/components/AnalyticsClient";
import FreelancerSideBar from "@/components/FreelancerSideBar";

export const metadata = {
  title: "Analytics",
  description:
    "View reports and insights about your jobs, income, and expenses on TrueHire.",
};

export default async function FreelancerAnalyticsPage() {
  const { userId } = await auth();

  // Get id from fm_freelancers
  const { rows: id } = await db.query(
    "SELECT id from fm_freelancers WHERE clerk_id = $1",
    [userId],
  );
  const freelancer_id = id[0].id;
  // Get job_id's from fm_contracts using id as freelancer_id
  const { rows: job_idsArr } = await db.query(
    "SELECT job_id FROM fm_contracts WHERE freelancer_id = $1",
    [freelancer_id],
  );

  const job_ids = [];
  job_idsArr.forEach((job_id) => {
    job_ids.push(job_id.job_id);
  });
  // console.log(job_ids);
  // for each job_id, get price from fm_expenses
  let { rows: expensesArr } = await db.query(
    "SELECT price FROM fm_expenses WHERE job_id = ANY($1)",
    [job_ids],
  );
  // console.log(pricesArr);
  const expenses = [];
  expensesArr.forEach((price) => {
    expenses.push(price.price);
  });
  console.log(expenses);
  // for each job_id, get amount from fm_income
  let { rows: incomeArr } = await db.query(
    "SELECT amount FROM fm_income WHERE job_id = ANY($1)",
    [job_ids],
  );
  // console.log(incomeArr);
  const income = [];
  incomeArr.forEach((amount) => {
    income.push(amount.amount);
  });
  console.log(income);
  // let {rows: job_ids} = await db.query('SELECT job_id from fm_contracts WHERE freelancer_id = $1', [
  //   userId
  // ]);

  // console.log(job_ids);

  return (
    <div className="sidebar-main-container">
      <FreelancerSideBar />
      <div>
        <AnalyticsClient id={id} income={income} expenses={expenses} />
      </div>
    </div>
  );
}
