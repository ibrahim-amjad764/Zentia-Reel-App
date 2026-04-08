# 🚀 Zentia - Next.js Social Media Platform

A **modern full-stack social media application** built with **Next.js App Router**, **Firebase Authentication**, **PostgreSQL (TypeORM)**, and **Real-time Features**. This platform demonstrates **production-ready architecture**, **scalable authentication**, and **high-performance social features** including posts, notifications, and user interactions.

---

## ✨ Features

### 🔐 Authentication & Security
* **Firebase Authentication** (Email/Password Signup & Login)
* **HttpOnly Cookie-based Sessions** (XSS Protection)
* **Next.js Edge Middleware** (CDN-level auth protection)
* **Protected Routes** (`/feed`, `/profile`, `/api/*`)
* **Auth Page Blocking** (redirect logic for logged-in users)
* **Session Management** (automatic token refresh)
* **Secure Logout** (cookie clearing)

### 📱 Social Features
* **Create & Share Posts** (with image upload support)
* **Like/Unlike Posts** (real-time updates)
* **Comment System** (nested replies)
* **Follow/Unfollow Users** (relationship management)
* **User Profiles** (editable information)
* **Real-time Notifications** (WebSocket powered)
* **Search Users** (debounced search functionality)
* **Infinite Scroll** (optimized feed loading)

### 🎨 User Interface
* **Dark/Light Mode Toggle** (persistent theme)
* **Responsive Design** (mobile-first approach)
* **Modern UI Components** (shadcn/ui + Tailwind)
* **Premium Animations** (neon effects, micro-interactions)
* **Glass Morphism Effects** (modern design language)
* **Loading States** (skeleton screens, spinners)

### 🛠️ Technical Features
* **TypeScript** (full type safety)
* **React Query** (efficient data fetching & caching)
* **PostgreSQL + TypeORM** (robust database layer)
* **File Upload** (Cloudinary integration)
* **Real-time Updates** (WebSocket notifications)
* **API Rate Limiting** (security measures)
* **Environment Variables** (secure configuration)

---

## 🧠 Core Architecture

### Authentication Flow
```
Client (Firebase) → ID Token → API Route → Firebase Admin → Verification → HttpOnly Cookie
                                                              ↓
Edge Middleware ← Cookie Check ← Every Request ← Route Protection ← Redirect Logic
```

### Data Flow
```
UI Components → React Query → API Routes → TypeORM → PostgreSQL
     ↑                                    ↓
Real-time Updates ← WebSocket ← Notification Service ← Database Triggers
```

---

## 🏗️ Tech Stack

### Frontend
- **Next.js 15** (App Router)
- **React 18** (with hooks & concurrent features)
- **TypeScript** (strict mode)
- **Tailwind CSS** (custom design system)
- **shadcn/ui** (component library)
- **Zustand** (state management)
- **React Query** (server state)
- **Lucide React** (icons)

### Backend
- **Next.js API Routes** (serverless functions)
- **Firebase Admin SDK** (token verification)
- **PostgreSQL** (primary database)
- **TypeORM** (ORM with migrations)
- **Cloudinary** (image storage)
- **WebSocket Server** (real-time notifications)

### Infrastructure
- **Edge Middleware** (CDN-level protection)
- **HttpOnly Cookies** (session security)
- **Environment Variables** (configuration)
- **Database Migrations** (schema versioning)

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
│   │   │   ├── location-feed/
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
│   │   │   ├── location/
│   │   │   │    └── route.ts
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
│── components/                
│    ├── layout/
│    └──ui/
│              
├── src/
│   ├── components/                 # Reusable UI components
│   │   ├── membership/            # Profile components
│   │   │      ├── forget-page
│   │   │      │     └── forgot-password-form.tsx
│   │   │      │     
│   │   │      ├── login-page
│   │   │      │     ├── login-form.tsx
│   │   │      │     └── login-page-01.tsx
│   │   │      │     
│   │   │      ├── logout-page
│   │   │      │     └── logout-form.tsx
│   │   │      │     
│   │   │      ├── profile-page
│   │   │      │     ├── EditProfileForm.tsx
│   │   │      │     ├── EditProfilePreview.tsx
│   │   │      │     ├── FollowButton.tsx
│   │   │      │     ├── ProfileAboutPlanel.tsx
│   │   │      │     ├── ProfileCard.tsx
│   │   │      │     ├── ProfileContent.tsx
│   │   │      │     ├── ProfileHeader.tsx
│   │   │      │     ├── ProfilePageClient.tsx
│   │   │      │     ├── ProfileTabs.tsx
│   │   │      │     ├── UserProfileCard.tsx
│   │   │      │     └── UserProfileSummary.tsx
│   │   │      │     
│   │   │      ├── signup-page
│   │   │            └──signup-form.tsx
│   │   │      
│   │   ├── navbar/            # Profile components
│   │   │     └── navbar.tsx
│   │   │     
│   │   ├── notifications/         # Notification system
│   │   │     ├── NotificationBell.tsx
│   │   │     ├── NotificationDropdown.tsx
│   │   │     ├── NotificationItem.tsx
│   │   │     ├── SearchBar
│   │   │     └──SearchSugggestion.tsx
│   │   │
│   │   ├── posts/                # Post-related components
│   │   │     ├── likes/                
│   │   │     │     ├── LikeButton.tsx
│   │   │     ├── comments/                
│   │   │     │     ├──CommentSection.tsx
│   │   │     ├── share/                
│   │   │     │     ├──ShareButton.tsx
│   │   │     ├── CreatePostModal.tsx
│   │   │     ├── Post.tsx
│   │   │     └── PostItem.tsx
│   │   │              
│   │   └── shared/                
│   │         ├── BackButton.tsx
│   │         └── LinkToUserProfile.tsx
│   │                      
│   ├── db/                 
│   │    ├── data-source.ts
│   │    └──init-db.ts
│   │
│   ├── entities/                  # TypeORM database models
│   │      ├── comment.ts
│   │      ├── follow.ts
│   │      ├── like.ts
│   │      ├── notification.ts
│   │      ├── post.ts
│   │      └── user.ts
│   ├── hooks/             
│   │      └── userParallax.ts
│   │      
│   ├── lib/                      # Utility functions
│   │    ├── api.ts
│   │    ├── auth.ts
│   │    ├── cloudinary.ts
│   │    ├── firebase-admin.ts
│   │    ├── firebase.ts
│   │    ├── mappers.ts
│   │    ├── notificationSocket.ts
│   │    ├── notificationWsSocket.ts
│   │    ├── profileHelper.ts
│   │    ├── useDebounce.ts
│   │    ├── utils.ts
│   │    └── websocket.ts
│   │    
│   ├── provider/             
│   │    └── ReactQueryProvider.ts
│   │    
│   ├── services/                 # Business logic
│   │    ├── Auth.service.ts
│   │    ├── follow.service.ts
│   │    ├── notification.service.ts
│   │    └── user.service.ts
│   │    
│   ├── store/                    # State management
│   │    ├── notificationStore.ts
│   │    └── useStore.ts
│   │    
│   └── types/                    # TypeScript definitions
│        ├── post.ts
│        ├── profile.ts
│        ├── renderUser.ts
│        └── user.ts
│   
│   
├── components.json                # shadcn/ui config
├── middleware.ts                # Edge middleware
├── tailwind.config.js           # Tailwind configuration
└── package.json                # Dependencies
```

---

## 🔐 Authentication System

### Firebase Integration
```typescript
// Client-side authentication
const auth = getAuth(app);
const userCredential = await signInWithEmailAndPassword(auth, email, password);
const idToken = await userCredential.user.getIdToken();

// Server-side verification
const decodedToken = await admin.auth().verifyIdToken(idToken);
```

### Cookie Management
```typescript
// Secure cookie setting
response.cookies.set("auth-token", idToken, {
  httpOnly: true,        // Prevent XSS
  sameSite: "lax",      // CSRF protection
  secure: production,     // HTTPS only in prod
  maxAge: 86400,        // 24 hours
});
```

### Middleware Protection
```typescript
// Edge middleware runs at CDN level
export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  
  if (!token && request.nextUrl.pathname.startsWith("/feed")) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
}
```

---

## 🗄️ Database Schema

### User Entity
```typescript
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

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ nullable: true })
  bio?: string;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
```

### Post Entity
```typescript
@Entity("posts")
export class Post {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column()
  content!: string;

  @Column("simple-array", { nullable: true })
  images?: string[];

  @ManyToOne(() => User)
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;
}
```

---

## 🎨 UI/UX Features

### Theme System
- **Dark Mode**: Deep blue background with neon accents
- **Light Mode**: Clean white with subtle shadows
- **Persistent**: User preference saved in localStorage
- **Tailwind Integration**: Custom CSS variables for consistency

### Component Library
- **shadcn/ui**: Modern, accessible components
- **Custom Components**: Specialized for social features
- **Animations**: Premium micro-interactions
- **Responsive**: Mobile-first design approach

### Design Patterns
- **Glass Morphism**: Frosted glass effects
- **Neon Accents**: Vibrant color highlights
- **Smooth Transitions**: 200ms ease animations
- **Loading States**: Skeleton screens and spinners

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Firebase project
- Cloudinary account (for image uploads)

### Installation
```bash
# Clone repository
git clone <repository-url>
cd next-typeorm-postgres

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run database migrations
npm run migration:run

# Start development server
npm run dev
```

### Environment Variables
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database

# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 📊 Performance Optimizations

### Frontend
- **React Query**: Intelligent caching & background refetching
- **Infinite Scroll**: Lazy loading for large feeds
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic route-based splitting
- **Debounced Search**: Reduced API calls

### Backend
- **Database Indexes**: Optimized query performance
- **Connection Pooling**: Efficient database connections
- **Edge Middleware**: CDN-level request handling
- **WebSocket**: Real-time updates without polling

---

## 🔒 Security Features

### Authentication Security
- **HttpOnly Cookies**: Prevent XSS attacks
- **CSRF Protection**: SameSite cookie attributes
- **Token Verification**: Firebase Admin SDK validation
- **Session Expiration**: 24-hour automatic logout

### API Security
- **Input Validation**: TypeORM entity validation
- **Rate Limiting**: Prevent abuse
- **CORS Configuration**: Proper cross-origin setup
- **Environment Variables**: Sensitive data protection

---

## 🧪 Testing

### Manual Testing
1. **Authentication Flow**: Login → Cookie → Protected Route Access
2. **Post Creation**: Create post with image upload
3. **Social Interactions**: Like, comment, follow users
4. **Real-time Features**: Test notification system
5. **Theme Toggle**: Verify dark/light mode persistence

### API Testing
```bash
# Test authentication
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"token":"firebase_id_token"}'

# Test protected route
curl -X GET http://localhost:3000/api/posts \
  -H "Cookie: auth-token=valid_token"
```

---

## 🚀 Deployment

### Environment Setup
- **Production**: Vercel (recommended for Next.js)
- **Database**: PostgreSQL (Heroku, AWS RDS, Railway)
- **File Storage**: Cloudinary (or AWS S3)
- **Authentication**: Firebase (same project)

### Build Process
```bash
# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables
Set all variables in your hosting platform's dashboard:
- Database connection strings
- Firebase service account credentials
- Cloudinary API keys
- Next.js production settings

---

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server

# Database
npm run migration:generate # Create new migration
npm run migration:run     # Run migrations
npm run migration:revert  # Revert last migration

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # TypeScript validation
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the `LICENSE` file for details.

---

## 👤 Author

**Ibrahim Amjad**
- Full Stack Developer
- Specialized in Next.js, Firebase, PostgreSQL
- Passionate about modern web architecture
- Focus on scalable, secure applications

---

## 🙏 Acknowledgments

- **Next.js Team** - Excellent framework and documentation
- **Firebase** - Robust authentication solution
- **shadcn/ui** - Beautiful component library
- **Tailwind CSS** - Utility-first CSS framework
- **TypeORM** - Powerful TypeScript ORM

---

*Built with NextJs using modern web technologies*

