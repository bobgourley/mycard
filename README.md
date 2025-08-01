# 123l.ink - Personal Link Page

A modern, customizable link-in-bio platform built with Next.js, TypeScript, and Supabase. Create your personalized link page to share all your important links in one place.

![123l.ink Preview](https://via.placeholder.com/800x400/6366f1/ffffff?text=123l.ink+Preview)

## ✨ Features

### 🎯 **Core Features**
- **Beautiful Landing Page** - Professional homepage explaining features and benefits
- **User Authentication** - Secure signup/login with Supabase Auth
- **Custom Profile Pages** - Personalized URLs (`123l.ink/username`)
- **Unlimited Links** - Add, edit, delete, and reorder links
- **Profile Images** - Upload photos with drag-and-drop support
- **Theme Customization** - Multiple themes and color options
- **Mobile Optimized** - Perfect on all devices
- **Real-time Updates** - Instant changes without page refresh

### 🔧 **Advanced Features**
- **Admin Panel** - Secure admin dashboard for user management
- **Image Upload** - Supabase Storage integration with file validation
- **URL Encoding** - Handles usernames with spaces and special characters
- **Success Onboarding** - Clear next steps after account creation
- **Professional UI** - Modern design with shadcn/ui components

## 🏗️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **UI Components**: shadcn/ui, Radix UI
- **Icons**: Lucide React
- **Deployment**: Vercel-ready

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account ([supabase.com](https://supabase.com))

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd 123l-ink
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
     title TEXT NOT NULL,
     url TEXT NOT NULL,
     position INTEGER DEFAULT 0,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable Row Level Security
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE links ENABLE ROW LEVEL SECURITY;

   -- Create policies for profiles
   CREATE POLICY "Public profiles are viewable by everyone" ON profiles
     FOR SELECT USING (true);

   CREATE POLICY "Users can insert their own profile" ON profiles
     FOR INSERT WITH CHECK (auth.uid() = id);

   CREATE POLICY "Users can update their own profile" ON profiles
     FOR UPDATE USING (auth.uid() = id);

   -- Create policies for links

## Database Setup

Run the SQL script in `scripts/create-tables.sql` in your Supabase SQL editor to create the necessary tables and triggers.

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://your-domain.com/auth/callback` (production)
6. Configure OAuth consent screen with your app details

## 🚀 Deployment to Vercel

### Step-by-Step Deployment:

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings

3. **Set Environment Variables in Vercel**:
   - Go to Project Settings → Environment Variables
   - Add:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Deploy**:
   - Vercel deploys automatically on every push to main
   - Custom domain can be added in Project Settings

### ⚠️ **REMINDER: NO NETLIFY**
This project is specifically configured for Vercel. Do not use Netlify deployment tools or create netlify.toml files.

## Project Structure

```
├── app/                    # Next.js app router
│   ├── [username]/        # Dynamic user profile pages
│   ├── admin/             # Admin panel (restricted to bob@bobgourley.com)
│   ├── auth/              # Authentication pages
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── link-tree/         # Profile and link components
│   └── ui/                # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and configs
├── scripts/               # Database setup scripts
└── vercel.json            # Vercel configuration
```

## Features

### User Features
- Create account with Google OAuth or email/password
- Customize profile with bio, avatar, and display name
- Add/edit/delete links with drag-and-drop reordering
- Real-time profile updates with debounced saving (no character loss)
- Delete profile with confirmation dialog and complete data removal
- Custom 404 pages with call-to-action for profile creation
- Responsive design for all devices

### Admin Features
- Admin panel at `/admin` (restricted to bob@bobgourley.com only)
- View all user profiles
- Delete user profiles and associated data
- Search and filter users
- Email-based access control

### Technical Features
- Server-side rendering with Next.js
- Real-time database updates with optimistic UI
- Debounced profile saving to prevent data loss
- Comprehensive error handling and user feedback
- TypeScript for type safety
- Custom 404 pages with conversion-focused design
- Cascading deletion (links → profile → auth user)
- Row Level Security (RLS) policies in Supabase

## Environment Variables

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] GitHub repo connected to Vercel
- [ ] Environment variables set in Vercel dashboard
- [ ] Custom domain configured (if applicable)
- [ ] Google OAuth redirect URIs updated for production
- [ ] Supabase RLS policies configured
- [ ] Database tables and triggers created

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request
6. **Remember**: Deploy via Vercel, not Netlify!

## License

MIT License - see LICENSE file for details.

## Support

If you have any questions or need help, please open an issue on GitHub.

---

Built with ❤️ using Next.js and Supabase
