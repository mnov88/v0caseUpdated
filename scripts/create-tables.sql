-- Create legislations table
CREATE TABLE IF NOT EXISTS legislations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    celex_number TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    full_markdown_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    legislation_id UUID REFERENCES legislations(id) ON DELETE CASCADE,
    article_number_text TEXT NOT NULL,
    title TEXT NOT NULL,
    filename TEXT,
    markdown_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create case_laws table
CREATE TABLE IF NOT EXISTS case_laws (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    celex_number TEXT,
    case_id_text TEXT NOT NULL,
    title TEXT NOT NULL,
    court TEXT NOT NULL,
    date_of_judgment DATE,
    parties TEXT,
    summary_text TEXT,
    operative_parts_combined TEXT,
    operative_parts_individual TEXT,
    html_content TEXT,
    plaintext_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create operative_parts table
CREATE TABLE IF NOT EXISTS operative_parts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_law_id UUID REFERENCES case_laws(id) ON DELETE CASCADE,
    part_number INTEGER NOT NULL,
    verbatim_text TEXT NOT NULL,
    simplified_text TEXT NOT NULL,
    markdown_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create junction tables for many-to-many relationships
CREATE TABLE IF NOT EXISTS case_law_interprets_article (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_law_id UUID REFERENCES case_laws(id) ON DELETE CASCADE,
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(case_law_id, article_id)
);

CREATE TABLE IF NOT EXISTS operative_part_interprets_article (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    operative_part_id UUID REFERENCES operative_parts(id) ON DELETE CASCADE,
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(operative_part_id, article_id)
);

CREATE TABLE IF NOT EXISTS operative_part_mentions_legislation (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    operative_part_id UUID REFERENCES operative_parts(id) ON DELETE CASCADE,
    mentioned_legislation_id UUID REFERENCES legislations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(operative_part_id, mentioned_legislation_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_legislation_id ON articles(legislation_id);
CREATE INDEX IF NOT EXISTS idx_operative_parts_case_law_id ON operative_parts(case_law_id);
CREATE INDEX IF NOT EXISTS idx_case_law_interprets_article_case_law_id ON case_law_interprets_article(case_law_id);
CREATE INDEX IF NOT EXISTS idx_case_law_interprets_article_article_id ON case_law_interprets_article(article_id);
CREATE INDEX IF NOT EXISTS idx_operative_part_interprets_article_operative_part_id ON operative_part_interprets_article(operative_part_id);
CREATE INDEX IF NOT EXISTS idx_operative_part_interprets_article_article_id ON operative_part_interprets_article(article_id);
CREATE INDEX IF NOT EXISTS idx_operative_part_mentions_legislation_operative_part_id ON operative_part_mentions_legislation(operative_part_id);
CREATE INDEX IF NOT EXISTS idx_operative_part_mentions_legislation_mentioned_legislation_id ON operative_part_mentions_legislation(mentioned_legislation_id);

-- Enable full-text search
CREATE INDEX IF NOT EXISTS idx_legislations_title_fts ON legislations USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_articles_title_fts ON articles USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_case_laws_title_fts ON case_laws USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_case_laws_summary_fts ON case_laws USING gin(to_tsvector('english', summary_text));
