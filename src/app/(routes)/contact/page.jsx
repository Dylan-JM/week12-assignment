import ContactForm from "@/components/ContactForm";

export const metadata = {
  title: "Contact Us",
  description:
    "Get in touch with TrueHire. Send your enquiry or use our in-platform messaging.",
};

export default function Contact() {
  return (
    <>
      <section className="contact feature-card-container">
        <img
          src="https://media.istockphoto.com/id/1412531992/vector/contact-us-banner-speech-bubble-label-sticker-ribbon-template-vector-stock-illustration.jpg?s=612x612&w=0&k=20&c=YYZr8DA0KbCiTTGr43HDWNqVGnhTuLAr8J3MFDncsRE="
          className="contact-us-img"
          alt="contact-us-image"
        />
        <div className="contact-cards-wrapper">
          <p className="feature-card">
            Contact us here. Please give us your purpose and details and we will
            get back to you soon. Alternatvely please use our chat messenging
            service.
          </p>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
