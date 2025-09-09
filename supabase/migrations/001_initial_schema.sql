-- Finança Fácil - Initial Database Schema
-- This migration creates all necessary tables, policies, and initial data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#16c64f',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subcategories table
CREATE TABLE subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('entrada', 'saida')),
    category_id UUID REFERENCES categories(id),
    subcategory_id UUID REFERENCES subcategories(id),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create financial_goals table
CREATE TABLE financial_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    target_amount DECIMAL(10,2) NOT NULL,
    current_amount DECIMAL(10,2) DEFAULT 0,
    deadline DATE,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create goal_contributions table
CREATE TABLE goal_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID REFERENCES financial_goals(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_subcategories_category_id ON subcategories(category_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_financial_goals_user_id ON financial_goals(user_id);
CREATE INDEX idx_financial_goals_is_completed ON financial_goals(is_completed);
CREATE INDEX idx_goal_contributions_goal_id ON goal_contributions(goal_id);
CREATE INDEX idx_goal_contributions_created_at ON goal_contributions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_contributions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for transactions table
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON transactions FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for financial_goals table
CREATE POLICY "Users can manage own goals" ON financial_goals FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for goal_contributions table
CREATE POLICY "Users can manage contributions to own goals" ON goal_contributions 
FOR ALL USING (
    goal_id IN (
        SELECT id FROM financial_goals WHERE user_id = auth.uid()
    )
);

-- Function to update goal current amount
CREATE OR REPLACE FUNCTION update_goal_current_amount()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE financial_goals 
    SET current_amount = (
        SELECT COALESCE(SUM(amount), 0) 
        FROM goal_contributions 
        WHERE goal_id = NEW.goal_id
    ),
    is_completed = (
        SELECT COALESCE(SUM(amount), 0) >= target_amount
        FROM goal_contributions 
        WHERE goal_id = NEW.goal_id
    ),
    updated_at = NOW()
    WHERE id = NEW.goal_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update goal amount
CREATE TRIGGER trigger_update_goal_amount
    AFTER INSERT ON goal_contributions
    FOR EACH ROW
    EXECUTE FUNCTION update_goal_current_amount();

-- Function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO users (id, email, name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Insert initial categories
INSERT INTO categories (name, color) VALUES 
('Alimentação', '#ff6b6b'),
('Transporte', '#4ecdc4'),
('Moradia', '#45b7d1'),
('Saúde', '#96ceb4'),
('Educação', '#feca57'),
('Lazer', '#ff9ff3'),
('Salário', '#16c64f'),
('Freelance', '#54a0ff'),
('Investimentos', '#a55eea'),
('Outros', '#778ca3');

-- Insert initial subcategories
INSERT INTO subcategories (category_id, name) VALUES 
-- Alimentação
((SELECT id FROM categories WHERE name = 'Alimentação'), 'Supermercado'),
((SELECT id FROM categories WHERE name = 'Alimentação'), 'Restaurante'),
((SELECT id FROM categories WHERE name = 'Alimentação'), 'Lanche'),
-- Transporte
((SELECT id FROM categories WHERE name = 'Transporte'), 'Combustível'),
((SELECT id FROM categories WHERE name = 'Transporte'), 'Transporte Público'),
((SELECT id FROM categories WHERE name = 'Transporte'), 'Uber/Taxi'),
-- Moradia
((SELECT id FROM categories WHERE name = 'Moradia'), 'Aluguel'),
((SELECT id FROM categories WHERE name = 'Moradia'), 'Contas de Casa'),
((SELECT id FROM categories WHERE name = 'Moradia'), 'Manutenção'),
-- Saúde
((SELECT id FROM categories WHERE name = 'Saúde'), 'Médico'),
((SELECT id FROM categories WHERE name = 'Saúde'), 'Farmácia'),
((SELECT id FROM categories WHERE name = 'Saúde'), 'Academia'),
-- Educação
((SELECT id FROM categories WHERE name = 'Educação'), 'Cursos'),
((SELECT id FROM categories WHERE name = 'Educação'), 'Livros'),
((SELECT id FROM categories WHERE name = 'Educação'), 'Material'),
-- Lazer
((SELECT id FROM categories WHERE name = 'Lazer'), 'Cinema'),
((SELECT id FROM categories WHERE name = 'Lazer'), 'Viagem'),
((SELECT id FROM categories WHERE name = 'Lazer'), 'Entretenimento');

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON categories TO anon;
GRANT SELECT ON categories TO authenticated;
GRANT SELECT ON subcategories TO anon;
GRANT SELECT ON subcategories TO authenticated;
GRANT ALL PRIVILEGES ON users TO authenticated;
GRANT ALL PRIVILEGES ON transactions TO authenticated;
GRANT ALL PRIVILEGES ON financial_goals TO authenticated;
GRANT ALL PRIVILEGES ON goal_contributions TO authenticated;