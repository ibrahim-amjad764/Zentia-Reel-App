# 🚀 Next.js Firebase Auth + Edge Middleware App

A **modern full-stack authentication and user management system** built with **Next.js App Router**, **Firebase Authentication**, **Edge Middleware**, and **PostgreSQL (TypeORM)**.
This project demonstrates **real-world auth patterns**, **secure session handling**, and **high-performance route protection** using the **Edge Runtime**.

---

## ✨ Features

* 🔐 **Firebase Authentication** (Signup / Login / Logout)
* 🍪 **HttpOnly Cookie-based Sessions**
* ⚡ **Next.js Edge Middleware** (CDN-level auth protection)
* 🛡️ Protected routes (`/feed`)
* 🚫 Auth pages blocked for logged-in users
* 🧑‍💻 **PostgreSQL + TypeORM** user persistence
* 🔄 **React Query** for efficient data fetching
* 🌙 **Dark Mode Toggle**
* 🔍 **Search Bar (centered, responsive)**
* ➕ **Create Post Button**
* 🎨 Tailwind CSS + shadcn/ui
* 🧩 Clean, scalable architecture

---

## 🧠 Core Concept (High Level)

* **Firebase (Client)** handles user identity
* **Firebase Admin (Server)** verifies tokens
* **Backend** sets a secure HttpOnly cookie
* **Edge Middleware** reads cookies before page loads
* Unauthorized users are redirected instantly
* No client-side auth hacks or localStorage

---

## 🏗️ Tech Stack

### Frontend

* Next.js (App Router)
* React
* Tailwind CSS
* shadcn/ui
* React Query

### Backend

* Next.js API Routes
* Firebase Admin SDK
* Axios

### Database

* PostgreSQL
* TypeORM

### Security & Runtime

* Edge Middleware
* Edge Runtime (CDN)
* HttpOnly Cookies
* Firebase ID Tokens

---

## 📁 Project Structure

```
next-typeorm-postgres/
│
├── .next/
├── node_modules/
├── dist/
├── public/
│
├── .env.local
├── .gitignore
├── README.md
├── components.json
├── eslint.config.mjs
├── middleware.ts
├── next-env.d.ts
├── next.config.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── runMigration.ts
├── server.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.cli.json
├── tsconfig.migrations.json
├── tsconfig.tsbuildinfo
├── websocket-server.js
│
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── route.ts
│   │   │   ├── logout/
│   │   │   │   └── route.ts
│   │   │   ├── refresh/
│   │   │   │   └── route.ts
│   │   │   └── signup/
│   │   │       └── route.ts
│   │   │
│   │   ├── notifications/
│   │   │   ├── route.ts
│   │   │   ├── mark-read/
│   │   │   │   └── route.ts
│   │   │   └── unread-count/
│   │   │       └── route.ts
│   │   │
│   │   ├── posts/
│   │   │   ├── [id]/
│   │   │   │    └── route.ts
│   │   │   ├── feed/
│   │   │   │    └── route.ts
│   │   │   ├── comment/
│   │   │   │   └── route.ts
│   │   │   ├── like/
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   │
│   │   ├── profile-user/
│   │   │   ├── profile/
│   │   │   │    └── route.ts
│   │   │   ├── route.ts
│   │   │   └── user.ts
│   │   │
│   │   ├── upload/
│   │   │   └── route.ts
│   │   │
│   │   └── users/
│   │       ├── [id]/
│   │       │   ├── follow-status/
│   │       │   │   └── route.ts
│   │       │   ├── follow/
│   │       │   │   └── route.ts
│   │       │   ├── unfollow/
│   │       │   │   └── route.ts
│   │       │   └── route.ts
│   │       └── route.ts
│   │
│   ├── assets/
│   │   └── svg/
│   │
│   ├── auth/
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── sign-up/
│   │       └── page.tsx
│   │
│   ├── feed/
│   │   └── page.tsx
│   │
│   ├── profile/
│   │   ├── [id]/
│   │   │   └── page.tsx
│   │   ├── edit/
│   │   │   └── page.tsx
│   │   └── page.tsx
│   │
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── src/
│   ├── components/
│   │   ├── logo/
│   │   ├── membership/
│   │   │   ├── forget-page
│   │   │   │       └── forgot-password.tsx
│   │   │   ├── login-page-02
│   │   │   │       └── login-from.tsx
│   │   │   │       └── login-page-01.tsx
│   │   │   ├── logout-page-03
│   │   │   │       └── logout-from.tsx
│   │   │   ├── profile-page
│   │   │   │       └── EditProfileForm.tsx
│   │   │   │       └── FollowButton.tsx
│   │   │   │       └── ProfileCard.tsx
│   │   │   │       └── ProfileContent.tsx
│   │   │   │       └── ProfileHeader.tsx
│   │   │   │       └── ProfilePageClient.tsx
│   │   │   │       └── ProfileTabs.tsx
│   │   │   │       └── UserProfileCards.tsx
│   │   │   │       └── UserProfileSummary.tsx
│   │   │   └── signup-page-01
│   │   │           └── signup-form.tsx
│   │   │           └── signup-page.tsx
│   │   ├── navbar/
│   │   │   └── navbar.tsx
│   │   ├── notifications/
│   │   │   ├── NotificationBell.tsx
│   │   │   ├── NotificationDropdown.tsx
│   │   │   ├── NotificationItem.tsx
│   │   │   └── SearchBar.tsx
│   │   ├── posts/
│   │   │   ├── comments/
│   │   │   │   └── CommentSection.tsx
│   │   │   ├── likes/
│   │   │   │   └── LikeButton.tsx
│   │   │   ├── Share/
│   │   │   │   └── ShareButton.tsx
│   │   │   ├── Shared/
│   │   │   │   ├── BackButton.tsx
│   │   │   │   └── LinkToUserProfile.tsx
│   │   │   ├── CreatePostModal.tsx
│   │   │   ├── Post.tsx
│   │   │   └── PostItem.tsx
│   │   └── ui/
│   │
│   ├── db/
│   │   ├── data-source.ts
│   │   ├── init-db.ts
│   │   └── hostDataSource.ts
│   │
│   ├── entities/
│   │   ├── comment.ts
│   │   ├── like.ts
│   │   ├── post.ts
│   │   ├── follow.ts
│   │   ├── notification.ts
│   │   └── user.ts
│   │
│   ├── lib/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── cloudinary.ts
│   │   ├── firebase.ts
│   │   ├── firebase-admin.ts
│   │   ├── utils.ts
│   │   ├── mappers.ts
│   │   ├── profileHelpers.ts
│   │   ├── notificationSocket.ts
│   │   ├── notificationWsServer.ts
│   │   └── websocket.ts
│   │
│   ├── migrations/
│   │
│   ├── providers/
│   │   └── ReactQueryProvider.tsx
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── follow.service.ts
│   │   ├── notification.service.ts
│   │   └── user.service.ts
│   │
│   ├── store/
│   │   ├── notificationStore.ts
│   │   └── useStore.ts
│   │
│   └── types/
│       ├── post.ts
│       ├── profile.ts
│       ├── renderUser.ts
│       └── users.ts

```

## 🔐 Authentication Flow

1. User logs in via **Firebase Auth (client)**
2. Firebase returns an **ID Token**
3. Token is sent to `/api/auth/login`
4. Backend verifies token using **Firebase Admin**
5. Backend sets **HttpOnly cookie**
6. Middleware checks cookie on every request
7. User can access `/feed`

---

## ⚡ Edge Middleware (Why It Matters)

* Runs **before page rendering**
* Executes at **CDN edge locations**
* No server or database hit
* Extremely fast redirects
* Perfect for auth & routing decisions

> ❌ Middleware does **NOT** handle database queries
> ✅ Only lightweight logic (cookies, headers, redirects)

---

## 🧪 How to Test Middleware

* Open `/feed` without login → redirected to `/auth/login`
* Login successfully → cookie is set
* Visit `/feed` → access granted
* Try `/auth/login` while logged in → redirected to `/feed`

---

## 🗄️ Database (TypeORM)

```ts
@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
```

## 🌙 UI Highlights

* Sticky Facebook-style Navbar
* Centered responsive search bar
* Dark mode toggle (Tailwind)
* User dropdown menu
* Clean & accessible UI components


## 📌 Why This Project Is Real-World Ready

* Uses **industry-standard auth flow**
* Secure against XSS (HttpOnly cookies)
* Works on refresh & hard reload
* Scales with CDN
* Clean separation of concerns
* Interview-ready architecture

## 👤 Author

**Ibrahim Amjad**
Web Developer – Next.js, Firebase, PostgreSQL

---

## 📄 License

MIT License
# Next-js-Social-App

