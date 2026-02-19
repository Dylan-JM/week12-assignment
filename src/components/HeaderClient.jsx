"use client";
import { useState } from "react";
import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function HeaderClient({ role }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="header">
      <h1 className="website-name">TrueHire</h1>

      <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </button>

      <div className={`navbar-container ${menuOpen ? "open" : ""}`}>
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
          <div className="navbar-auth">
            {role === "client" ? (
              <Link href="/client/dashboard">Client Portal</Link>
            ) : role === "freelancer" ? (
              <Link href="/freelancer/dashboard">Freelancer Portal</Link>
            ) : (
              <Link href="/setup">Portal</Link>
            )}
            <UserButton />
          </div>
        </SignedIn>
      </div>
    </div>
  );
}
