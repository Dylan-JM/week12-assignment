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
    <div>
      <h2>Income Form</h2>
      <form className="form" action={handleFormSubmit}>
        <label className="form-name" htmlFor="name">
          Name:{" "}
        </label>
        <input id="form-name" type="text" name="name" placeholder="Name" />

        <label className="form-amount" htmlFor="amount">
          Blog post:{" "}
        </label>
        <input
          id="form-amount"
          type="number"
          step="0.01"
          name="amount"
          placeholder="Amount"
        />

        <button>Submit</button>
      </form>
    </div>
  );
}
