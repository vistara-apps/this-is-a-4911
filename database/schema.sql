-- OnboardWise Database Schema
-- This file contains the complete database schema for the OnboardWise application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies table
CREATE TABLE companies (
    company_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'paid')),
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID NOT NULL UNIQUE, -- References Supabase auth.users
    company_id UUID NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'employee' CHECK (role IN ('admin', 'employee')),
    onboarding_progress INTEGER DEFAULT 0 CHECK (onboarding_progress >= 0 AND onboarding_progress <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Policies table
CREATE TABLE policies (
    policy_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Policy modules table (quizzes and reading materials)
CREATE TABLE policy_modules (
    module_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES policies(policy_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) DEFAULT 'quiz' CHECK (type IN ('quiz', 'reading')),
    questions JSONB, -- Array of question objects
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz attempts table
CREATE TABLE quiz_attempts (
    attempt_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES policy_modules(module_id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    answers JSONB, -- Array of user answers
    completion_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User badges table
CREATE TABLE user_badges (
    badge_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    badge_type VARCHAR(20) NOT NULL CHECK (badge_type IN ('bronze', 'silver', 'gold')),
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, badge_type)
);

-- User invitations table
CREATE TABLE user_invitations (
    invitation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    invited_by UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX idx_policy_modules_policy_id ON policy_modules(policy_id);
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_module_id ON quiz_attempts(module_id);
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_invitations_company_id ON user_invitations(company_id);
CREATE INDEX idx_user_invitations_email ON user_invitations(email);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON policies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_policy_modules_updated_at BEFORE UPDATE ON policy_modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_invitations_updated_at BEFORE UPDATE ON user_invitations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;

-- Companies: Users can only see their own company
CREATE POLICY "Users can view their own company" ON companies
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can update their own company" ON companies
    FOR UPDATE USING (
        company_id IN (
            SELECT company_id FROM users 
            WHERE auth_user_id = auth.uid() AND role = 'admin'
        )
    );

-- Users: Users can see users in their company
CREATE POLICY "Users can view users in their company" ON users
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth_user_id = auth.uid());

CREATE POLICY "Admins can insert users in their company" ON users
    FOR INSERT WITH CHECK (
        company_id IN (
            SELECT company_id FROM users 
            WHERE auth_user_id = auth.uid() AND role = 'admin'
        )
    );

-- Policies: Everyone can read policies (public content)
CREATE POLICY "Anyone can view policies" ON policies
    FOR SELECT USING (true);

-- Policy modules: Everyone can read modules (public content)
CREATE POLICY "Anyone can view policy modules" ON policy_modules
    FOR SELECT USING (true);

-- Quiz attempts: Users can only see their own attempts, admins can see company attempts
CREATE POLICY "Users can view their own quiz attempts" ON quiz_attempts
    FOR SELECT USING (
        user_id IN (
            SELECT user_id FROM users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view company quiz attempts" ON quiz_attempts
    FOR SELECT USING (
        user_id IN (
            SELECT u1.user_id FROM users u1
            JOIN users u2 ON u1.company_id = u2.company_id
            WHERE u2.auth_user_id = auth.uid() AND u2.role = 'admin'
        )
    );

CREATE POLICY "Users can insert their own quiz attempts" ON quiz_attempts
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT user_id FROM users WHERE auth_user_id = auth.uid()
        )
    );

-- User badges: Users can see their own badges, admins can see company badges
CREATE POLICY "Users can view their own badges" ON user_badges
    FOR SELECT USING (
        user_id IN (
            SELECT user_id FROM users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view company badges" ON user_badges
    FOR SELECT USING (
        user_id IN (
            SELECT u1.user_id FROM users u1
            JOIN users u2 ON u1.company_id = u2.company_id
            WHERE u2.auth_user_id = auth.uid() AND u2.role = 'admin'
        )
    );

CREATE POLICY "System can insert badges" ON user_badges
    FOR INSERT WITH CHECK (true); -- Badges are awarded by the system

-- User invitations: Admins can manage invitations for their company
CREATE POLICY "Admins can view company invitations" ON user_invitations
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM users 
            WHERE auth_user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can create invitations" ON user_invitations
    FOR INSERT WITH CHECK (
        company_id IN (
            SELECT company_id FROM users 
            WHERE auth_user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update company invitations" ON user_invitations
    FOR UPDATE USING (
        company_id IN (
            SELECT company_id FROM users 
            WHERE auth_user_id = auth.uid() AND role = 'admin'
        )
    );

-- Function to get company average scores (for analytics)
CREATE OR REPLACE FUNCTION get_company_avg_scores(company_id UUID)
RETURNS TABLE(avg_score NUMERIC) AS $$
BEGIN
    RETURN QUERY
    SELECT AVG(qa.score)::NUMERIC
    FROM quiz_attempts qa
    JOIN users u ON qa.user_id = u.user_id
    WHERE u.company_id = get_company_avg_scores.company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sample data for development
INSERT INTO policies (title, content, category, summary) VALUES
('Employee Rights and Responsibilities', 'This policy outlines the fundamental rights and responsibilities of all employees...', 'HR', 'Overview of employee rights including fair treatment, privacy, and workplace safety.'),
('Code of Conduct', 'All employees are expected to maintain the highest standards of professional conduct...', 'Ethics', 'Guidelines for professional behavior, ethics, and workplace interactions.'),
('Data Privacy and Security', 'This policy establishes guidelines for handling sensitive company and customer data...', 'Security', 'Requirements for data protection, privacy compliance, and security best practices.'),
('Workplace Safety', 'Safety is our top priority. This policy outlines safety procedures and requirements...', 'Safety', 'Comprehensive safety guidelines and emergency procedures for all employees.');

INSERT INTO policy_modules (policy_id, title, description, type, questions, points) VALUES
(
    (SELECT policy_id FROM policies WHERE title = 'Employee Rights and Responsibilities'),
    'Employee Rights Quiz',
    'Test your knowledge of employee rights and workplace protections.',
    'quiz',
    '[
        {
            "question": "What is the minimum notice period for termination?",
            "options": ["1 week", "2 weeks", "1 month", "No notice required"],
            "correct": 1,
            "explanation": "Most jurisdictions require at least 2 weeks notice for termination."
        },
        {
            "question": "Employees have the right to a safe workplace free from harassment.",
            "options": ["True", "False"],
            "correct": 0,
            "explanation": "All employees have the fundamental right to a safe and harassment-free workplace."
        },
        {
            "question": "Which of the following is NOT typically considered a protected characteristic?",
            "options": ["Age", "Religion", "Favorite color", "Disability"],
            "correct": 2,
            "explanation": "Protected characteristics are legally defined categories that protect against discrimination."
        }
    ]'::jsonb,
    100
),
(
    (SELECT policy_id FROM policies WHERE title = 'Code of Conduct'),
    'Professional Conduct Quiz',
    'Assess your understanding of professional behavior expectations.',
    'quiz',
    '[
        {
            "question": "What should you do if you witness unethical behavior?",
            "options": ["Ignore it", "Report it to management", "Confront the person directly", "Discuss it with colleagues"],
            "correct": 1,
            "explanation": "Unethical behavior should be reported through proper channels to ensure appropriate action."
        },
        {
            "question": "Personal use of company resources is always prohibited.",
            "options": ["True", "False"],
            "correct": 1,
            "explanation": "Most companies allow limited personal use of resources, but policies vary by organization."
        }
    ]'::jsonb,
    100
),
(
    (SELECT policy_id FROM policies WHERE title = 'Data Privacy and Security'),
    'Data Security Fundamentals',
    'Learn about data protection and security requirements.',
    'quiz',
    '[
        {
            "question": "What is the first step when handling sensitive customer data?",
            "options": ["Share it with your team", "Verify you have authorization", "Make a backup copy", "Print it out"],
            "correct": 1,
            "explanation": "Always verify authorization before accessing or handling sensitive data."
        },
        {
            "question": "Strong passwords should contain which elements?",
            "options": ["Only letters", "Letters and numbers", "Letters, numbers, and symbols", "Just numbers"],
            "correct": 2,
            "explanation": "Strong passwords combine letters, numbers, and symbols for maximum security."
        }
    ]'::jsonb,
    100
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
