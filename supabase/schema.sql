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
    company_id UUID NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'employee' CHECK (role IN ('admin', 'employee')),
    onboarding_progress INTEGER DEFAULT 0 CHECK (onboarding_progress >= 0 AND onboarding_progress <= 100),
    auth_user_id UUID, -- Reference to Supabase auth.users
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

-- Policy modules table
CREATE TABLE policy_modules (
    module_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES policies(policy_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('quiz', 'reading')),
    questions JSONB, -- Store questions as JSON
    description TEXT,
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
    completion_date TIMESTAMP WITH TIME ZONE NOT NULL,
    answers JSONB NOT NULL, -- Store user answers as JSON
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User badges table (for gamification)
CREATE TABLE user_badges (
    badge_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    badge_type VARCHAR(50) NOT NULL, -- 'bronze', 'silver', 'gold', etc.
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, badge_type)
);

-- User invitations table
CREATE TABLE user_invitations (
    invitation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    invited_by UUID NOT NULL REFERENCES users(user_id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX idx_policy_modules_policy_id ON policy_modules(policy_id);
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_module_id ON quiz_attempts(module_id);
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_invitations_company_id ON user_invitations(company_id);
CREATE INDEX idx_user_invitations_email ON user_invitations(email);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_policy_modules_updated_at BEFORE UPDATE ON policy_modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies
CREATE POLICY "Users can view their own company" ON companies
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can update their company" ON companies
    FOR UPDATE USING (
        company_id IN (
            SELECT company_id FROM users 
            WHERE auth_user_id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for users
CREATE POLICY "Users can view users in their company" ON users
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth_user_id = auth.uid());

CREATE POLICY "Admins can manage users in their company" ON users
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM users 
            WHERE auth_user_id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for policies (public read)
CREATE POLICY "Anyone can view policies" ON policies FOR SELECT USING (true);

-- RLS Policies for policy_modules (public read)
CREATE POLICY "Anyone can view policy modules" ON policy_modules FOR SELECT USING (true);

-- RLS Policies for quiz_attempts
CREATE POLICY "Users can view their own quiz attempts" ON quiz_attempts
    FOR SELECT USING (
        user_id IN (
            SELECT user_id FROM users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own quiz attempts" ON quiz_attempts
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT user_id FROM users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all quiz attempts in their company" ON quiz_attempts
    FOR SELECT USING (
        user_id IN (
            SELECT u1.user_id FROM users u1
            JOIN users u2 ON u1.company_id = u2.company_id
            WHERE u2.auth_user_id = auth.uid() AND u2.role = 'admin'
        )
    );

-- RLS Policies for user_badges
CREATE POLICY "Users can view their own badges" ON user_badges
    FOR SELECT USING (
        user_id IN (
            SELECT user_id FROM users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert badges" ON user_badges
    FOR INSERT WITH CHECK (true);

-- RLS Policies for user_invitations
CREATE POLICY "Admins can manage invitations for their company" ON user_invitations
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM users 
            WHERE auth_user_id = auth.uid() AND role = 'admin'
        )
    );

-- Insert default policies and modules
INSERT INTO policies (policy_id, title, content, category, summary) VALUES
    ('hr-001', 'Employee Handbook', 'This handbook outlines all employee rights including fair compensation, safe working conditions, non-discrimination, and due process. It also covers responsibilities such as professional conduct, confidentiality, and compliance with company policies.', 'Human Resources', 'Comprehensive guide to employee rights, responsibilities, and company policies'),
    ('hr-002', 'Anti-Harassment Policy', 'Our company maintains a zero-tolerance policy toward harassment and discrimination. This includes verbal, physical, visual, or written conduct that creates an intimidating, offensive, or hostile work environment.', 'Human Resources', 'Zero-tolerance policy on workplace harassment and discrimination'),
    ('sec-001', 'Information Security Policy', 'All employees must follow security protocols including strong password policies, secure data handling, and proper use of company systems. Data breaches must be reported immediately.', 'Security', 'Guidelines for protecting company and customer data');

-- Insert default policy modules
INSERT INTO policy_modules (module_id, policy_id, title, type, questions, description, points) VALUES
    ('mod-001', 'hr-001', 'Employee Rights & Responsibilities', 'quiz', '[
        {
            "id": "1",
            "question": "What is the minimum notice period for termination?",
            "type": "multiple-choice",
            "options": ["1 week", "2 weeks", "1 month", "3 months"],
            "correctAnswer": "2 weeks",
            "explanation": "Standard notice period is 2 weeks for most positions."
        },
        {
            "id": "2",
            "question": "Employees have the right to a safe working environment.",
            "type": "true-false",
            "correctAnswer": true,
            "explanation": "All employees have the fundamental right to workplace safety."
        },
        {
            "id": "3",
            "question": "Which of these is considered workplace harassment?",
            "type": "multiple-choice",
            "options": ["Unwanted comments", "Excessive workload", "Late meetings", "Dress code"],
            "correctAnswer": "Unwanted comments",
            "explanation": "Unwanted comments, especially those based on protected characteristics, constitute harassment."
        }
    ]', 'Learn about your basic employee rights and workplace responsibilities', 100),
    ('mod-002', 'hr-002', 'Anti-Discrimination & Harassment', 'quiz', '[
        {
            "id": "1",
            "question": "Discrimination based on age is legal in the workplace.",
            "type": "true-false",
            "correctAnswer": false,
            "explanation": "Age discrimination is illegal and violates employment laws."
        },
        {
            "id": "2",
            "question": "What should you do if you witness harassment?",
            "type": "multiple-choice",
            "options": ["Ignore it", "Report it to HR", "Handle it yourself", "Wait and see"],
            "correctAnswer": "Report it to HR",
            "explanation": "All incidents should be reported to HR immediately for proper investigation."
        }
    ]', 'Understanding our zero-tolerance policy on discrimination and harassment', 120),
    ('mod-003', 'sec-001', 'Data Privacy & Security', 'quiz', '[
        {
            "id": "1",
            "question": "Strong passwords should contain which elements?",
            "type": "multiple-choice",
            "options": ["Only letters", "Letters and numbers", "Letters, numbers, and symbols", "Just numbers"],
            "correctAnswer": "Letters, numbers, and symbols",
            "explanation": "Strong passwords combine uppercase, lowercase, numbers, and special characters."
        },
        {
            "id": "2",
            "question": "You can share your login credentials with trusted colleagues.",
            "type": "true-false",
            "correctAnswer": false,
            "explanation": "Login credentials should never be shared with anyone, regardless of trust level."
        }
    ]', 'Essential guidelines for protecting company and customer data', 90);
