import JobsClient from "@/components/JobsClient";
import {db} from '@/lib/dbConnection'

export default async function JobsId({ params }) {
  const {id} = await params;
  let {rows: incomeRows} = await db.query(`SELECT * FROM fm_income WHERE job_id = $1`,[
      id
    ]);
    // console.log({id});
    console.log({incomeRows});
    const income = [];
    for (let i=0;i<incomeRows.length;i++){
        income.push(incomeRows[i].amount);
    }
    console.log(income);

    let {rows: expenseRows} = await db.query(`SELECT * FROM fm_expenses WHERE job_id = $1`,[
      id
    ]);
    // console.log({id});
    console.log({expenseRows});
    const expenses = [];
    for (let i=0;i<expenseRows.length;i++){
        expenses.push(expenseRows[i].amount);
    }
    console.log(expenses);

  return (
    <JobsClient id = {id} income={income} expenses={expenses} /> 
  )

}