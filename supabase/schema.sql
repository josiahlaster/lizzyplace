-- Setup tables for Custom Channel Manager

-- 1. Properties
CREATE TABLE IF NOT EXISTS public.properties (
    id TEXT PRIMARY KEY, -- '5br' or '6br'
    name TEXT NOT NULL,
    base_price_per_night NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed properties if they don't exist
INSERT INTO public.properties (id, name, base_price_per_night)
VALUES 
    ('5br', 'The Classic (5BR Home)', 299.00),
    ('6br', 'The Grand (6BR Home)', 399.00)
ON CONFLICT (id) DO NOTHING;

-- 2. Direct Bookings (from Stripe/manual website booking)
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id TEXT REFERENCES public.properties(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    guest_name TEXT NOT NULL,
    guest_email TEXT NOT NULL,
    guest_phone TEXT,
    stripe_session_id TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled'
    total_price NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT bookings_dates_check CHECK (start_date < end_date)
);

-- 3. Blocked Dates (from iCal sync imports or manual blocks)
CREATE TABLE IF NOT EXISTS public.blocked_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id TEXT REFERENCES public.properties(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    source TEXT NOT NULL, -- 'airbnb', 'vrbo', 'manual'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(property_id, date, source)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;

-- Setup public read policies
CREATE POLICY "Allow public read access to properties" ON public.properties
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to confirmed bookings" ON public.bookings
    FOR SELECT USING (status = 'confirmed');

CREATE POLICY "Allow public read access to blocked dates" ON public.blocked_dates
    FOR SELECT USING (true);

-- Setup full admin access for authenticated dashboard users
CREATE POLICY "Allow admin full access to properties" ON public.properties
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow admin full access to bookings" ON public.bookings
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow admin full access to blocked_dates" ON public.blocked_dates
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
