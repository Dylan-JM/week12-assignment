import ContactForm from "@/components/ContactForm";
import "./contact.css";

export default function Contact() {
  return (
    <>
      <section className="">
        <h1 className="">Contact Us</h1>
        <p className="">
          Contact us here. Please give us your purpose and details and we will
          get back to you soon. Alternatvely please use our chat messenging
          service.
        </p>
        <ContactForm />
      </section>
    </>
  );
}
