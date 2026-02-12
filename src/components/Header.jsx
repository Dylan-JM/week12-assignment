import Link from "next/link";

export default function Header() {
  return (
    <>
      <div className="header">
        <h1 className="website-name">Website Name</h1>
        <div className="navbar-container">
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </div>
    </>
  );
}
