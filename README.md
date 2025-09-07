# OnboardWise

A gamified compliance training platform that helps new hires understand their rights and company policies through interactive learning and knowledge tracking.

![OnboardWise Screenshot](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=OnboardWise+Dashboard)

## 🚀 Features

### Core Features
- **🎮 Gamified Compliance Modules**: Interactive quizzes, challenges, and leaderboards focused on essential employee rights and company policies
- **📊 Knowledge Retention Dashboard**: Track new hire progress and scores with insights into knowledge gaps
- **📚 Policy Library & Search**: Searchable repository of all company policies and legal rights
- **👥 Admin Management**: Invite team members and track their onboarding progress
- **💳 Subscription Management**: Free and paid tiers with Stripe integration

### Business Model
- **Free Tier**: Up to 5 new hires per month
- **Professional Tier**: $10/month for unlimited new hires with advanced features

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: TailwindCSS with custom design system
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Payments**: Stripe
- **Icons**: Lucide React
- **Routing**: React Router
- **State Management**: React Context + useReducer

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Stripe account (for payments)

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/vistara-apps/this-is-a-4911.git
cd this-is-a-4911
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# OpenAI Configuration (Optional)
VITE_OPENAI_API_KEY=your_openai_api_key
```

### 4. Database Setup
1. Create a new Supabase project
2. Run the SQL schema from `database/schema.sql` in your Supabase SQL editor
3. This will create all necessary tables, indexes, RLS policies, and sample data

### 5. Stripe Setup (Optional)
1. Create a Stripe account
2. Set up webhook endpoints for subscription management
3. Configure product pricing in Stripe dashboard

### 6. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Card, etc.)
│   └── AppShell.tsx    # Main app layout
├── context/            # React Context for state management
├── lib/                # Utility libraries and API clients
│   ├── supabase.ts     # Supabase client configuration
│   ├── auth.ts         # Authentication functions
│   ├── api.ts          # API service layer
│   └── stripe.ts       # Stripe integration
├── pages/              # Page components
│   ├── Landing.tsx     # Marketing landing page
│   ├── Auth.tsx        # Authentication page
│   ├── Dashboard.tsx   # Employee dashboard
│   ├── AdminDashboard.tsx # Admin management
│   ├── Quiz.tsx        # Quiz interface
│   ├── PolicyLibrary.tsx # Policy browser
│   └── Progress.tsx    # Progress tracking
└── App.tsx             # Main app component
```

## 🎯 User Flows

### Company Admin Flow
1. **Sign Up**: Create company account and admin profile
2. **Setup**: Configure company settings and subscription
3. **Invite Users**: Send email invitations to new hires
4. **Monitor Progress**: Track team completion rates and scores
5. **Manage Subscription**: Upgrade/downgrade plans as needed

### Employee Flow
1. **Accept Invitation**: Join company via email invitation
2. **Complete Profile**: Set up user profile and preferences
3. **Take Quizzes**: Complete gamified compliance modules
4. **Earn Badges**: Receive recognition for achievements
5. **Reference Policies**: Access policy library as needed

## 🔐 Security Features

- **Row Level Security (RLS)**: Database-level access control
- **Authentication**: Supabase Auth with email/password
- **Data Isolation**: Company data is completely isolated
- **Secure API**: All API calls are authenticated and authorized
- **Input Validation**: Client and server-side validation

## 🎨 Design System

The application uses a custom design system built on TailwindCSS:

- **Colors**: Primary (blue), Accent (orange), Surface (white)
- **Typography**: Responsive text scales with semantic naming
- **Spacing**: Consistent spacing scale (sm, md, lg, xl, xxl)
- **Components**: Reusable UI components with variants
- **Motion**: Smooth transitions and animations

## 📊 Database Schema

Key entities:
- **Companies**: Organization data and subscription info
- **Users**: Employee profiles and progress tracking
- **Policies**: Company policies and legal content
- **Policy Modules**: Interactive quizzes and learning materials
- **Quiz Attempts**: User responses and scoring
- **User Badges**: Achievement system
- **User Invitations**: Team invitation management

## 🔧 API Integration

### Supabase
- **Database**: PostgreSQL with real-time subscriptions
- **Authentication**: User management and session handling
- **Storage**: File uploads and policy documents
- **Real-time**: Live updates for collaborative features

### Stripe
- **Subscriptions**: Recurring billing management
- **Customer Portal**: Self-service subscription management
- **Webhooks**: Payment event handling

### OpenAI (Optional)
- **Content Generation**: Dynamic quiz question creation
- **Policy Summarization**: AI-powered content processing

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel --prod
```

### Environment Variables
Ensure all environment variables are configured in your deployment platform.

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📈 Performance

- **Code Splitting**: Automatic route-based code splitting
- **Lazy Loading**: Components loaded on demand
- **Optimized Images**: Responsive image loading
- **Caching**: Aggressive caching of static assets
- **Bundle Analysis**: Regular bundle size monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Join community discussions
- **Email**: Contact support@onboardwise.com

## 🗺 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Custom policy creation tools
- [ ] Integration with HR systems
- [ ] Multi-language support
- [ ] Video-based training modules
- [ ] Compliance reporting tools

---

Built with ❤️ by the OnboardWise team
