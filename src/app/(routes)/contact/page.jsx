import ContactForm from "@/components/ContactForm";

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with TrueHire. Send your enquiry or use our in-platform messaging.",
};

export default function Contact() {
  return (
    <>
      <section className="contact feature-card-container">
        <h2 className="contact-us-title">Contact Us</h2>
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
