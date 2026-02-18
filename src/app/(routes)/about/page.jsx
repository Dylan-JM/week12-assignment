export const metadata = {
  title: "About Us",
  description:
    "Learn about TrueHire — a modern freelance marketplace connecting clients with skilled professionals. Our mission is where opportunity meets talent.",
};

export default function About() {
  return (
    <main className="about-container">
      <img
        src="https://cdn-dynmedia-1.microsoft.com/is/image/microsoftcorp/O2019-Hero-image-x2:VP1-539x440?resMode=sharp2&op_usm=1.5,0.65,15,0&wid=1920&hei=720&qlt=75&fit=constrain"
        className="about-us-image"
        id="officeimg"
      />
      <section className="about-hero">
        <h1>About Us</h1>
        <p className="about-p-tag">
          We are a modern freelance marketplace connecting clients with skilled
          professionals. Businesses can post jobs, set their requirements, and
          receive applications from freelancers ready to deliver high-quality
          work on time and within budget.
        </p>
      </section>

      <img
        src="https://www.mckinsey.com/~/media/mckinsey/featured%20insights/mckinsey%20explainers/what%20is%20talent%20management/what-is-talent-management-802557394-thumb-1536x1536.jpg?mw=677&car=42:25"
        className="about-us-image"
        id="teamworkimg"
      />
      <section className="about-content">
        <h2>Our Mission</h2>
        <p className="about-p-tag">
          Our mission is to create a streamlined platform where opportunity
          meets talent. We empower clients to find the right expertise quickly,
          while giving freelancers access to meaningful projects and secure
          payments for the work they complete.
        </p>
      </section>

      <img
        src="https://pix4free.org/assets/library/2021-06-16/originals/reliable.jpg"
        className="about-us-image"
        id="trackingimg"
      />
      <section className="about-content">
        <h2>Why We Exist</h2>
        <p className="about-p-tag">
          Finding reliable freelancers and trustworthy clients shouldn't be
          complicated. We exist to simplify the hiring process, provide a safe
          and transparent workflow, and ensure freelancers get paid for the
          value they deliver.
        </p>
      </section>
    </main>
  );
}
