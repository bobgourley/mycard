# Linktree Clone - v0.me

A modern, customizable link-in-bio platform built with Next.js, TypeScript, and Supabase. Create your personalized link page to share all your important links in one place.

## Features

- 🔐 **User Authentication** - Secure signup/signin with Supabase Auth
- 👤 **Custom Profiles** - Personalized usernames, display names, bios, and avatars
- 🔗 **Link Management** - Add, edit, delete, and reorder your links
- 🎨 **Theme Customization** - Multiple themes and customization options
- 📱 **Responsive Design** - Works perfectly on desktop and mobile
- ⚡ **Fast Performance** - Built with Next.js for optimal speed
- 🌐 **Custom URLs** - Access your page at `yourdomain.com/username`

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel-ready
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd linktree-clone
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database**
   
   Run the following SQL in your Supabase SQL editor to create the required tables:

   ```sql
   -- Create profiles table
   CREATE TABLE profiles (
     id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
     username TEXT UNIQUE NOT NULL,
     display_name TEXT,
     bio TEXT,
     avatar_url TEXT,
     verified BOOLEAN DEFAULT FALSE,
     theme_settings JSONB DEFAULT '{}',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create links table
   CREATE TABLE links (
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
   CREATE POLICY "Links are viewable by everyone" ON links
     FOR SELECT USING (true);

   CREATE POLICY "Users can insert their own links" ON links
     FOR INSERT WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can update their own links" ON links
     FOR UPDATE USING (auth.uid() = user_id);

   CREATE POLICY "Users can delete their own links" ON links
     FOR DELETE USING (auth.uid() = user_id);

   -- Create function to handle new user signup
   CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS TRIGGER AS $$
   BEGIN
     INSERT INTO public.profiles (id, username, display_name)
     VALUES (
       NEW.id,
       NEW.raw_user_meta_data->>'username',
       NEW.raw_user_meta_data->>'display_name'
     );
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;

   -- Create trigger for new user signup
   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Deploy**
   Vercel will automatically deploy your app. Your app will be available at `your-app-name.vercel.app`

### Custom Domain (Optional)

1. Add your custom domain in Vercel dashboard
2. Update DNS settings as instructed by Vercel
3. Your app will be available at your custom domain

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── [username]/        # Dynamic user pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── link-tree/        # Link tree components
│   └── ui/               # shadcn/ui components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configs
│   ├── supabase.ts       # Supabase client
│   └── utils.ts          # Utility functions
├── public/               # Static assets
└── styles/               # Additional styles
```

## Usage

1. **Sign Up**: Create an account with username, email, and password
2. **Customize Profile**: Add display name, bio, and avatar
3. **Add Links**: Add your important links with custom titles
4. **Share**: Share your page at `yourdomain.com/username`
5. **Customize**: Choose themes and customize appearance

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or need help, please open an issue on GitHub.

---

Built with ❤️ using Next.js and Supabase
