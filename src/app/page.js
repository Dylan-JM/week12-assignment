import Image from "next/image";
import FAQ from "@/components/FAQ";

export const metadata = {
  title: "TrueHire",
  description:
    "TrueHire connects skilled freelancers with clients ready to hire. Create your profile, explore opportunities, and start building valuable partnerships.",
};

export default function Home() {
  return (
    <div className="home-page-container">
      <h1 className="homepage-title">Welcome To TrueHire</h1>
      <h3 className="homepage-message">
        TrueHire connects skilled freelancers with clients who are ready to
        hire. Whether you&apos;re a professional looking to showcase your
        expertise or a business searching for the right talent, our platform
        makes it simple to connect, communicate, and get work done. Create your
        profile, explore opportunities, and start building valuable partnerships
        today.
      </h3>
      <h3 className="homepage-features">Features</h3>
      <div className="feature-card-container">
        <div className="feature-card">
          <Image
            src="https://img.freepik.com/premium-vector/checkmark-sign-verified-symbol-approval-done-element-collection_809852-1013.jpg"
            alt="Verified checkmark symbol"
            className="feature-card-img"
            width={400}
            height={300}
          />
          <h2>Verified Profiles</h2>
          <p>
            Showcase skills, experience, and past work in a professional profile
            that builds trust and credibility with potential clients.
          </p>
        </div>
        <div className="feature-card">
          <Image
            src="https://www.talentprise.com/wp-content/uploads/2024/08/job-matching.png"
            alt="Job matching illustration"
            className="feature-card-img"
            width={400}
            height={300}
          />
          <h2>Smart Job Matching</h2>
          <p>
            Clients can post jobs and receive interest from relevant
            freelancers, or directly invite the right professional to their
            project.
          </p>
        </div>
        <div className="feature-card">
          <Image
            src="https://www.vonage.com/content/dam/vonage/us-en/resources/imagery/article-thumbnails/API-SEO_SECURE-MESSAGING-Blog-Thumbnail.png"
            alt="Secure messaging illustration"
            className="feature-card-img"
            width={400}
            height={300}
          />
          <h2>Secure In-Platform Messaging</h2>
          <p>
            Communicate safely within TrueHire to discuss details, share files,
            and finalize agreements before starting work.
          </p>
        </div>
      </div>
      <FAQ />
    </div>
  );
}
