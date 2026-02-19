<a id="readme-top"></a>

<br />
<div align="center">
  <h1>🔵 TrueHire</h1>
  <h3>Connecting Clients & Freelancers</h3>
  <p>
    A Full-Stack Marketplace Platform built with Next.js, Stripe, AI & Real-Time Messaging
  </p>
</div>

---

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about-the-project">About The Project</a></li>
    <li><a href="#core-features">Core Features</a></li>
    <li><a href="#user-roles">User Roles</a></li>
    <li><a href="#user-stories">User Stories</a></li>
    <li><a href="#wireframes--planning">Wireframes & Planning</a></li>
    <li><a href="#communication">Communication</a></li>
    <li><a href="#built-with">Built With</a></li>
    <li><a href="#getting-started">Getting Started</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
  </ol>
</details>

---

# About The Project

**TrueHire** is a full-stack freelancer marketplace platform that connects clients with skilled freelancers.

The platform enables:

- Clients to post, edit, and manage jobs
- Freelancers to submit proposals and secure paid work
- Subscription-based freelancer accounts
- AI-powered financial assistance
- Real-time messaging between users
- Reviews and rating systems
- Advanced job and freelancer search functionality

TrueHire is designed as a scalable SaaS marketplace model combining payments, subscriptions, messaging, and AI integration into one unified system.

---

# Core Features

## Client Features

- Create, edit, and delete job postings
- View:
  - Open jobs (no freelancer assigned)
  - In-progress jobs
- Accept freelancer proposals
- Pay freelancers securely
- Send Invoices
- Leave reviews on freelancer profiles
- Search freelancers by:
  - Skills
  - Rating
  - Name
- Message freelancers directly
- Browse other job listings to understand market pricing

---

## Freelancer Features

- Create and manage profile
- Showcase:
  - Skills
  - Experience
  - Portfolio
- Submit proposals to jobs
- Track accepted and active jobs
- Receive secure payments
- Receive reviews from clients
- Subscribe for:
  - Increased monthly proposal limit
  - AI financial assistant access
- Search jobs by:
  - Skill keyword
  - Budget range
  - Client name
- Analytics:
  - Monthly Expenses/Income
  - Specific Job Expenses/Income

---

# User Roles

| Role       | Capabilities                                                 |
| ---------- | ------------------------------------------------------------ |
| Client     | Post/manage jobs, hire freelancers, pay, review              |
| Freelancer | Submit proposals, manage profile, subscribe, receive payment |

---

# User Stories

## Client User Stories

- As a client, I want to post a job so freelancers can apply.
- As a client, I want to edit or delete a job if requirements change.
- As a client, I want to review freelancers after a project is completed.
- As a client, I want to message freelancers before hiring them.
- As a client, I want to manage in-progress projects.
- As a client, I want to search freelancers by skill and rating.

## Freelancer User Stories

- As a freelancer, I want to create a professional profile.
- As a freelancer, I want to submit proposals to jobs.
- As a freelancer, I want to upgrade to a subscription for more proposal submissions.
- As a freelancer, I want an AI assistant to help track finances.
- As a freelancer, I want to search for jobs by budget or skill.
- As a freelancer, I want to receive payments securely.

---

# Wireframes & Planning

## Wireframes

Wireframes were created to define:

- Home Page
- Client Dashboard
- Freelancer Dashboard
- Job Post Page
- AI Assistant
- Messaging Interface
- Subscription Upgrade Page
- Profile Page (Freelancer)
- Charts/Analytics

## Database Planning

Include:

- Users
- Clients
- Freelancers
- Conversations
- Expenses
- Income
- Jobs
- Messages
- Reviews

# Communication

- Trello Task Allocation
- Daily progress reviews
- Git version control
- Git Branches
- Live collaboration sessions(Live Share)
- Bug Fixing

Communication Tools:

- GitHub
- VS Code Live Share
- Discord

---

# Built With

- [![Next][Next.js]][Next-url]
- [![React][React]][React-url]
- [![Clerk][Clerk]][Clerk-url]
- [![Chart.js][ChartJS]][ChartJS-url]
- [![Ably][Ably]][Ably-url]
- [![OpenAI][OpenAI]][OpenAI-url]
- [![Tailwind][Tailwind]][Tailwind-url]
- [![Supabase][Supabase]][Supabase-url]

---

# Getting Started

## Prerequisites

- Node.js
- npm
- Clerk Account
- Supabase Account
- Ably Account

---

## Installation

```bash
git clone(repo SSH)
```

Install dependencies:

```bash
npm install
```

## Environment Variables

Create a `.env.local` file in the root directory:

```
# Supabase
NEXT_PUBLIC_DATABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_CHAT_BUCKET=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
# Clerk - Custom Auth
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/setup

# Ably
NEXT_PUBLIC_ABLY_API_KEY=

# AI Helper
OPENAI_API_KEY=
```

---

## Run Locally

```bash
npm run dev
```

Visit:

```
http://localhost:3000
```

---

# Subscription System

Freelancers can upgrade to a premium subscription which includes:

- Increased proposal submission limit
- Access to AI financial assistant
- Priority profile visibility (future feature)

Clerk handles:

- Subscription payments
- Secure checkout
- Billing management

---

# Roadmap

- [x] Authentication system
- [x] Job posting & proposal system
- [x] Messaging integration
- [x] Clerk payment integration
- [x] Subscription logic
- [x] ChartJs/Analytics
- [x] AI finance dashboard analytics
- [x] Advanced filtering algorithm
- [x] Invoices
- [ ] Escrow-style payment protection
- [ ] Deployment documentation

---

# Project Structure Overview

```
/app
  /routes
  /about
  /chat
    /[channelSlug]
  /client
    /dashboard
    /findFreelancers
      /[id]
    /findJobs
    /jobs
      /[id]
      /inprogress
      /new
  /contact
    /success
  /freelancer
    /(protected)
      /aiassistant
      /analytics
      /clients
        /[id]
      /dashboard
      /findJobs
        /[id]
      /invoices
      /jobs
        /[id]
          /expense-form
          /income-form
      /profile
        /[id]
    /plans
  /setup
  /sign-in
    /[[...sign-in]]
/components
/lib
/utils
```

---

# Future Improvements

- AI job matching system
- Middleman/Escrow Payments
- Dispute system
- Email notification system

---

# Contact

Add your contact details here.

---

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->

## Light House Scores

![alt text](image-1.png)

[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://react.dev/
[Clerk]: https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white
[Clerk-url]: https://clerk.com/
[Ably]: https://img.shields.io/badge/Ably-FF5414?style=for-the-badge&logo=ably&logoColor=white
[Ably-url]: https://ably.com/
[OpenAI]: https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white
[OpenAI-url]: https://openai.com/
[Tailwind]: https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white
[Tailwind-url]: https://tailwindcss.com/
[Supabase]: https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white
[Supabase-url]: https://supabase.com/
[ChartJS]: https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white
[ChartJS-url]: https://www.chartjs.org/
