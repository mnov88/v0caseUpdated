-- Insert sample legislations
INSERT INTO legislations (celex_number, title, full_markdown_content) VALUES
('32016R0679', 'General Data Protection Regulation (GDPR)', 'This regulation lays down rules relating to the protection of natural persons with regard to the processing of personal data and rules relating to the free movement of such data...'),
('32000L0031', 'E-Commerce Directive', 'This Directive aims to contribute to the proper functioning of the internal market by ensuring the free movement of information society services between Member States...'),
('31995L0046', 'Data Protection Directive', 'This Directive aims to protect the fundamental rights and freedoms of natural persons, and in particular their right to privacy with respect to the processing of personal data...')
ON CONFLICT (celex_number) DO NOTHING;

-- Insert sample articles
INSERT INTO articles (legislation_id, article_number_text, title, filename, markdown_content)
SELECT 
    l.id,
    '6',
    'Lawfulness of processing',
    'article-6.md',
    'Processing shall be lawful only if and to the extent that at least one of the following applies: (a) the data subject has given consent...'
FROM legislations l WHERE l.celex_number = '32016R0679'
ON CONFLICT DO NOTHING;

INSERT INTO articles (legislation_id, article_number_text, title, filename, markdown_content)
SELECT 
    l.id,
    '17',
    'Right to erasure (right to be forgotten)',
    'article-17.md',
    'The data subject shall have the right to obtain from the controller the erasure of personal data concerning him or her without undue delay...'
FROM legislations l WHERE l.celex_number = '32016R0679'
ON CONFLICT DO NOTHING;

-- Insert sample case laws
INSERT INTO case_laws (celex_number, case_id_text, title, court, date_of_judgment, parties, summary_text, operative_parts_combined, html_content, plaintext_content) VALUES
('62012CJ0131', 'C-131/12', 'Google Spain SL and Google Inc. v Agencia Española de Protección de Datos', 'Court of Justice', '2014-05-13', 'Google Spain SL, Google Inc. v Agencia Española de Protección de Datos, Mario Costeja González', 'This case established the "right to be forgotten" under EU data protection law. The Court ruled that individuals have the right to request search engines to remove inadequate, irrelevant or no longer relevant information from search results.', 'The Court declares that: 1) The operator of a search engine is required to remove from the list of results displayed following a search made on the basis of a person''s name links to web pages...', '<div>Full HTML content of the judgment...</div>', 'Full plaintext content of the judgment...'),
('62014CJ0362', 'C-362/14', 'Maximillian Schrems v Data Protection Commissioner', 'Court of Justice', '2015-10-06', 'Maximillian Schrems v Data Protection Commissioner', 'This case invalidated the Safe Harbor framework for data transfers between the EU and US, establishing stricter requirements for international data transfers.', 'The Court declares that: 1) Decision 2000/520/EC is invalid...', '<div>Full HTML content of the Schrems judgment...</div>', 'Full plaintext content of the Schrems judgment...')
ON CONFLICT (celex_number) DO NOTHING;

-- Insert sample operative parts
INSERT INTO operative_parts (case_law_id, part_number, verbatim_text, simplified_text, markdown_content)
SELECT 
    cl.id,
    1,
    'The operator of a search engine is required to remove from the list of results displayed following a search made on the basis of a person''s name links to web pages, published by third parties and containing information relating to that person, also in a case where that name or information is not erased beforehand or simultaneously from those web pages.',
    'Search engines must remove links to personal information from search results when requested, even if the original webpage still contains the information.',
    '**Operative Part 1**: Search engine operators must remove personal information links from search results upon request.'
FROM case_laws cl WHERE cl.case_id_text = 'C-131/12'
ON CONFLICT DO NOTHING;

INSERT INTO operative_parts (case_law_id, part_number, verbatim_text, simplified_text, markdown_content)
SELECT 
    cl.id,
    2,
    'That obligation may also exist in a case where the publication of the information in question on those web pages is, as such, lawful.',
    'The removal obligation applies even when the original publication was legal.',
    '**Operative Part 2**: Removal is required even if original publication was lawful.'
FROM case_laws cl WHERE cl.case_id_text = 'C-131/12'
ON CONFLICT DO NOTHING;

-- Create relationships between articles and cases
INSERT INTO case_law_interprets_article (case_law_id, article_id)
SELECT cl.id, a.id
FROM case_laws cl, articles a, legislations l
WHERE cl.case_id_text = 'C-131/12' 
AND a.article_number_text = '17'
AND a.legislation_id = l.id
AND l.celex_number = '32016R0679'
ON CONFLICT DO NOTHING;

-- Create relationships between operative parts and articles
INSERT INTO operative_part_interprets_article (operative_part_id, article_id)
SELECT op.id, a.id
FROM operative_parts op, case_laws cl, articles a, legislations l
WHERE op.case_law_id = cl.id
AND cl.case_id_text = 'C-131/12'
AND a.article_number_text = '17'
AND a.legislation_id = l.id
AND l.celex_number = '32016R0679'
ON CONFLICT DO NOTHING;

-- Create relationships between operative parts and legislations
INSERT INTO operative_part_mentions_legislation (operative_part_id, mentioned_legislation_id)
SELECT op.id, l.id
FROM operative_parts op, case_laws cl, legislations l
WHERE op.case_law_id = cl.id
AND cl.case_id_text = 'C-131/12'
AND l.celex_number = '32016R0679'
ON CONFLICT DO NOTHING;
