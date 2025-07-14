# MockMate - AI-Powered Mock Interview Assistant

MockMate is a comprehensive web application that helps job seekers prepare for technical interviews through AI-powered mock interviews. The platform provides personalized feedback, scoring, and maintains a complete history of interview sessions.

![MockMate Demo](https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop)

## Features

### User Authentication
- Secure email/password authentication via Supabase Auth
- User session management with automatic token refresh
- Protected routes and data access

###  Role-Based Interviews
- **Frontend Developer**: React, Vue, Angular, JavaScript, CSS
- **Backend Developer**: Node.js, Python, APIs, Databases
- **Data Scientist**: Machine Learning, Python, Statistics, Analytics
- **DevOps Engineer**: AWS, Docker, Kubernetes, CI/CD

###  Interactive Interview Experience
- **Audio Recording**: Built-in voice recorder with real-time feedback
- **Text Input**: Type responses directly in the interface
- **Progress Tracking**: Visual progress bar showing interview completion
- **Question Flow**: 5 carefully curated questions per role

###  AI-Powered Feedback
- **Intelligent Scoring**: 1-10 scale based on response quality
- **Detailed Text Feedback**: Constructive criticism and improvement suggestions
- **Audio Feedback**: Text-to-speech synthesis for accessibility
- **Performance Analytics**: Track improvement over time

###  Session Management
- **Complete History**: View all past interview sessions
- **Performance Metrics**: Average scores and progress tracking
- **Detailed Reviews**: Question-by-question breakdown with feedback
- **Session Grouping**: Organized by role and date

###  Modern UI/UX
- **Dark Theme**: Professional, eye-friendly interface
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Smooth Animations**: Polished micro-interactions
- **Accessibility**: ARIA labels and keyboard navigation support

##  Live Demo

Visit the live application: [https://gregarious-empanada-ac87e7.netlify.app](https://gregarious-empanada-ac87e7.netlify.app)

##  Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and development server
- **Lucide React** - Beautiful, customizable icons

### Backend & Database
- **Supabase** - Backend-as-a-Service platform
- **PostgreSQL** - Robust relational database
- **Row Level Security (RLS)** - Data protection and user isolation
- **Real-time subscriptions** - Live data updates

### Authentication
- **Supabase Auth** - Secure authentication system
- **JWT Tokens** - Stateless authentication
- **Email/Password** - Simple, reliable auth method

### Deployment
- **Netlify** - Static site hosting with CI/CD
- **Environment Variables** - Secure configuration management

##  Prerequisites

Before running this project, make sure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Supabase Account** (free tier available)
- **Git** for version control

##  Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/mockmate.git
cd mockmate
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings > API** and copy your project URL and anon key
3. Navigate to **SQL Editor** and run the migration files:
   - `supabase/migrations/20250707070500_cool_sound.sql`
   - `supabase/migrations/20250707072654_sunny_coast.sql`

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key_optional
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

##  Project Structure

```
mockmate/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # Reusable UI components
│   │   ├── AudioRecorder.tsx
│   │   ├── AuthComponent.tsx
│   │   ├── FeedbackDisplay.tsx
│   │   ├── InterviewDashboard.tsx
│   │   ├── InterviewHistory.tsx
│   │   ├── InterviewSession.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── QuestionCard.tsx
│   │   └── RoleSelector.tsx
│   ├── contexts/         # React contexts
│   │   ├── AuthContext.tsx
│   │   └── SupabaseContext.tsx
│   ├── hooks/           # Custom React hooks
│   │   └── useAuth.ts
│   ├── utils/           # Utility functions
│   │   └── cn.ts
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles
├── supabase/
│   └── migrations/      # Database migration files
├── .env.example         # Environment variables template
├── package.json         # Project dependencies
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```

##  Database Schema

### `interview_sessions` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to auth.users |
| `role` | TEXT | Interview role (Frontend Developer, etc.) |
| `question` | TEXT | Interview question |
| `user_answer` | TEXT | User's response |
| `feedback_text` | TEXT | AI-generated feedback |
| `feedback_audio_url` | TEXT | Audio feedback URL (optional) |
| `score` | INTEGER | Score from 1-10 |
| `session_id` | TEXT | Groups questions in same interview |
| `created_at` | TIMESTAMPTZ | Timestamp of creation |

### Security Features

- **Row Level Security (RLS)** enabled
- Users can only access their own data
- Secure authentication with Supabase Auth
- Input validation and sanitization

##  Usage Guide

### Starting an Interview

1. **Sign Up/Sign In** with your email and password
2. **Select a Role** from the available options
3. **Click "Start Interview"** to begin the session
4. **Answer Questions** using voice recording or text input
5. **Review Feedback** after each question
6. **Complete the Interview** and view your overall performance

### Viewing History

1. Navigate to the **"History"** tab
2. View your **performance statistics**
3. **Expand sessions** to see detailed question-by-question breakdown
4. **Listen to audio feedback** from previous sessions

### Audio Features

- **Record Answers**: Use the built-in voice recorder
- **Playback**: Review your recorded responses
- **Audio Feedback**: Listen to AI-generated feedback
- **Browser Compatibility**: Works in modern browsers with microphone access

##  Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

### Code Quality

- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting (recommended)
- **Modular Architecture** with clear separation of concerns

### Adding New Features

1. **Components**: Add new React components in `src/components/`
2. **Contexts**: Create new contexts in `src/contexts/`
3. **Hooks**: Add custom hooks in `src/hooks/`
4. **Database**: Create new migrations in `supabase/migrations/`

##  Deployment

### Netlify Deployment

The project is configured for easy deployment on Netlify:

1. **Connect Repository** to Netlify
2. **Set Environment Variables** in Netlify dashboard
3. **Deploy** automatically on git push

### Environment Variables for Production

```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

### Build Configuration

```bash
# Build command
npm run build

# Publish directory
dist
```

##  Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow **TypeScript** best practices
- Use **functional components** with hooks
- Implement **proper error handling**
- Add **comments** for complex logic
- Ensure **responsive design**
- Test on **multiple browsers**

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Acknowledgments

- **Supabase** for the excellent backend platform
- **Tailwind CSS** for the utility-first CSS framework
- **Lucide React** for the beautiful icon library
- **Vite** for the fast development experience
- **Netlify** for seamless deployment

##  Support

If you encounter any issues or have questions:

1. **Check** the [Issues](https://github.com/your-username/mockmate/issues) page
2. **Create** a new issue with detailed information
3. **Contact** the development team

##  Future Enhancements

- **AI Integration**: OpenAI GPT for more sophisticated feedback
- **Video Interviews**: Support for video recording and analysis
- **Custom Questions**: Allow users to add their own questions
- **Team Features**: Company accounts and team management
- **Analytics Dashboard**: Advanced performance analytics
- **Mobile App**: Native iOS and Android applications
- **Integration**: Connect with job boards and ATS systems


