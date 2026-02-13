import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/dbConnection";

export default async function Header() {
  const { userId } = await auth();
  let role = null;
  if (userId) {
    const { rows } = await db.query(
      "SELECT role FROM fm_users WHERE clerk_id = $1",
      [userId],
    );
    role = rows[0]?.role ?? null;
  }

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
            {role === "client" ? (
              <Link href="/client/dashboard">Client Portal</Link>
            ) : role === "freelancer" ? (
              <Link href="/freelancer/dashboard">Freelancer Portal</Link>
            ) : null}
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </>
  );
}
