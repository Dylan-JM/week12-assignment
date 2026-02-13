import ContactForm from "@/components/ContactForm";
import "./contact.css";

export default function Contact() {
  return (
    <>
      <section className="contact feature-card-container">
        <h2 className="text-xl">Contact Us</h2>
        <p className="feature-card">
          Contact us here. Please give us your purpose and details and we will
          get back to you soon. Alternatvely please use our chat messenging
          service.
        </p>
        <ContactForm />
      </section>
    </>
  );
}
