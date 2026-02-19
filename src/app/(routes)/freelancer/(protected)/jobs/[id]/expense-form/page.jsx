import { db } from "@/lib/dbConnection";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function ExpenseForm({ params }) {
  async function handleFormSubmit(rawFormData) {
    "use server";
    const { id } = await params;
    console.log(rawFormData);
    const formValues = {
      name: rawFormData.get("name"),
      price: rawFormData.get("price"),
    };

    console.log(formValues);

    try {
      await db.query(
        `INSERT INTO fm_expenses (name, price, job_id) VALUES ($1, $2, $3)`,
        [formValues.name, formValues.price, id],
      );
    } catch (e) {
      console.log(e);
    }
    revalidatePath("..");
    redirect("..");
  }

  return (
    <div className="expense-form-wrapper">
      <div className="expense-form-card">
        <h2 className="expense-form-title">Add expense</h2>
        <form className="expense-form" action={handleFormSubmit}>
          <div className="client-job-form-group">
            <label className="checkbox-label" htmlFor="expense-name">
              Name
            </label>
            <input
              id="expense-name"
              type="text"
              name="name"
              placeholder="e.g. Software licence"
            />
          </div>
          <div className="client-job-form-group">
            <label className="checkbox-label" htmlFor="expense-price">
              Price (£)
            </label>
            <input
              id="expense-price"
              type="number"
              step="0.01"
              min="0"
              name="price"
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
