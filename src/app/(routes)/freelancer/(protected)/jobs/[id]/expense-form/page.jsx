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
    <div>
      <h2>Expenses form</h2>
      <form className="form" action={handleFormSubmit}>
        <label className="form-name" htmlFor="name">
          Name:{" "}
        </label>
        <input id="form-name" type="text" name="name" placeholder="Name" />

        <label className="form-price" htmlFor="price">
          Blog post:{" "}
        </label>
        <input
          id="form-price"
          type="number"
          step="0.01"
          name="price"
          placeholder="Price"
        />

        <button>Submit</button>
      </form>
    </div>
  );
}
