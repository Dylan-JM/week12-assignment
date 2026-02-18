"use client";

import { useState } from "react";

const faqData = [
  {
    question: "What is TrueHire?",
    answer:
      "TrueHire is a freelancer marketplace where professionals can subscribe to create a profile, showcase their services, and connect directly with clients looking to hire.",
  },
  {
    question: "How does the subscription work?",
    answer:
      "Freelancers pay a monthly subscription to advertise their services, appear in search results, and message clients. Clients can browse freelancers and post jobs for free.",
  },
  {
    question: "How do clients hire freelancers?",
    answer:
      "Clients can either post a job and receive messages from interested freelancers, or directly request a specific freelancer to take on their project.",
  },
  {
    question: "Can freelancers apply to posted jobs?",
    answer:
      "Yes. Freelancers can browse available job posts and message clients to express interest, discuss details, and submit proposals.",
  },
  {
    question: "Is communication handled through TrueHire?",
    answer:
      "Yes. TrueHire includes built-in messaging so clients and freelancers can communicate securely before agreeing to work together.",
  },
  {
    question: "Is my information secure?",
    answer:
      "We use secure authentication and encrypted data storage to protect user accounts and communications.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-container">
      <h2 className="faq-title">Frequently Asked Questions</h2>
      <div className="faq-list">
        {faqData.map((item, index) => (
          <div key={index} className="faq-item">
            <button
              onClick={() => toggle(index)}
              className="faq-question"
              aria-expanded={openIndex === index}
            >
              {item.question}{" "}
              <span className="faq-icon">
                {openIndex === index ? "−" : "+"}
              </span>
            </button>
            {openIndex === index && (
              <div className="faq-answer">
                <p>{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
