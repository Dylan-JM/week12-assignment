import { db } from "@/lib/dbConnection";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function IncomeForm({ params }) {
  async function handleFormSubmit(rawFormData) {
    "use server";
    const { id } = await params;
    console.log(rawFormData);
    const formValues = {
      name: rawFormData.get("name"),
      amount: rawFormData.get("amount"),
    };
    console.log(formValues);

    db.query(
      `INSERT INTO fm_income (name, amount, job_id) VALUES ($1, $2, $3)`,
      [formValues.name, formValues.amount, id],
    );
    revalidatePath("..");
    redirect("..");
  }

  return (
    <div className="expense-form-wrapper">
      <div className="expense-form-card">
        <h2 className="expense-form-title">Add income</h2>
        <form className="expense-form" action={handleFormSubmit}>
          <div className="client-job-form-group">
            <label className="checkbox-label" htmlFor="income-name">
              Name
            </label>
            <input
              id="income-name"
              type="text"
              name="name"
              placeholder="e.g. Client payment"
            />
          </div>
          <div className="client-job-form-group">
            <label className="checkbox-label" htmlFor="income-amount">
              Amount (£)
            </label>
            <input
              id="income-amount"
              type="number"
              step="0.01"
              min="0"
              name="amount"
              placeholder="0.00"
            />
          </div>
          <button type="submit" className="submit-btn">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
