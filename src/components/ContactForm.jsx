//import { db } from "@/lib/dbConnection";
import { redirect } from "next/navigation";
//import './ContactForm.css'

export default function ContactForm() {
  async function handleFormSubmit(rawFormData) {
    "use server";
    // console.log(rawFormData);
    const formValues = {
      email: rawFormData.get("email"),
      content: rawFormData.get("content"),
    };
    console.log(formValues);

    // db.query(`INSERT INTO postboard (email, content) VALUES ($1, $2)`,
    //     [
    //         formValues.email,
    //         formValues.content
    //     ],
    // );
    redirect("/contact/success");
  }

  return (
    <div>
      <form className="form feature-card" action={handleFormSubmit}>
        <label className="form-email" htmlFor="email">
          Email:{" "}
        </label>
        <input
          className="contact-us-input"
          id="form-email"
          type="text"
          name="email"
        />

        <label className="form-content" htmlFor="content">
          Content:{" "}
        </label>
        <textarea
          className="contact-us-textarea"
          id="form-content"
          type="text"
          name="content"
          rows="4"
          cols="30"
        />

        <button className="submit-btn">Submit</button>
      </form>
    </div>
  );
}
