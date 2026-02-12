import FAQ from "@/components/FAQ";

export default function Home() {
  return (
    <div className="home-page-container">
      <h1 className="homepage-title">Welcome To WebsiteName</h1>
      <h3 className="homepage-message">
        WebsiteName connects skilled freelancers with clients who are ready to
        hire. Whether you're a professional looking to showcase your expertise
        or a business searching for the right talent, our platform makes it
        simple to connect, communicate, and get work done. Create your profile,
        explore opportunities, and start building valuable partnerships today.
      </h3>
      <h3 className="homepage-features">Features</h3>
      <div className="feature-card-container">
        <div className="feature-card">
          <img
            src="https://storage.googleapis.com/gweb-uniblog-publish-prod/images/Google-Analytics-4-Blog-Post-Hea.width-1000.format-webp.webp"
            alt=""
            className="feature-card-img"
          />
          <h2>Verified Profiles</h2>
          <p>
            Showcase skills, experience, and past work in a professional profile
            that builds trust and credibility with potential clients.
          </p>
        </div>
        <div className="feature-card">
          <img
            src="https://storage.googleapis.com/gweb-uniblog-publish-prod/images/Google-Analytics-4-Blog-Post-Hea.width-1000.format-webp.webp"
            alt=""
            className="feature-card-img"
          />
          <h2>Smart Job Matching</h2>
          <p>
            Clients can post jobs and receive interest from relevant
            freelancers, or directly invite the right professional to their
            project.
          </p>
        </div>
        <div className="feature-card">
          <img
            src="https://storage.googleapis.com/gweb-uniblog-publish-prod/images/Google-Analytics-4-Blog-Post-Hea.width-1000.format-webp.webp"
            alt=""
            className="feature-card-img"
          />
          <h2>Secure In-Platform Messaging</h2>
          <p>
            Communicate safely within WebsiteName to discuss details, share
            files, and finalize agreements before starting work.
          </p>
        </div>
      </div>
      <FAQ />
    </div>
  );
}
