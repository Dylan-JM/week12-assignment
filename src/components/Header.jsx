import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Header() {
  return (
    <>
      <div className="header">
        <h1 className="website-name">Website Name</h1>
        <div className="navbar-container">
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/freelancer/plans">Plans</Link>
          <SignedOut>
            <SignInButton>
              <button className="btn-signin">Sign In</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/client/dashboard">Portal</Link>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </>
  );
}
