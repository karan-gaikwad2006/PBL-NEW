-- PoshanSetu Reference Data Migration
-- 002_reference_data.sql

-- 1. Seed Maharashtra Districts
INSERT INTO districts (name, slug, state) VALUES
('Ahmednagar', 'ahmednagar', 'Maharashtra'),
('Akola', 'akola', 'Maharashtra'),
('Amravati', 'amravati', 'Maharashtra'),
('Aurangabad', 'aurangabad', 'Maharashtra'),
('Beed', 'beed', 'Maharashtra'),
('Bhandara', 'bhandara', 'Maharashtra'),
('Buldhana', 'buldhana', 'Maharashtra'),
('Chandrapur', 'chandrapur', 'Maharashtra'),
('Dhule', 'dhule', 'Maharashtra'),
('Gadchiroli', 'gadchiroli', 'Maharashtra'),
('Gondia', 'gondia', 'Maharashtra'),
('Hingoli', 'hingoli', 'Maharashtra'),
('Jalgaon', 'jalgaon', 'Maharashtra'),
('Jalna', 'jalna', 'Maharashtra'),
('Kolhapur', 'kolhapur', 'Maharashtra'),
('Latur', 'latur', 'Maharashtra'),
('Mumbai City', 'mumbai-city', 'Maharashtra'),
('Mumbai Suburban', 'mumbai-suburban', 'Maharashtra'),
('Nagpur', 'nagpur', 'Maharashtra'),
('Nanded', 'nanded', 'Maharashtra'),
('Nandurbar', 'nandurbar', 'Maharashtra'),
('Nashik', 'nashik', 'Maharashtra'),
('Osmanabad', 'osmanabad', 'Maharashtra'),
('Palghar', 'palghar', 'Maharashtra'),
('Parbhani', 'parbhani', 'Maharashtra'),
('Pune', 'pune', 'Maharashtra'),
('Raigad', 'raigad', 'Maharashtra'),
('Ratnagiri', 'ratnagiri', 'Maharashtra'),
('Sangli', 'sangli', 'Maharashtra'),
('Satara', 'satara', 'Maharashtra'),
('Sindhudurg', 'sindhudurg', 'Maharashtra'),
('Solapur', 'solapur', 'Maharashtra'),
('Thane', 'thane', 'Maharashtra'),
('Wardha', 'wardha', 'Maharashtra'),
('Washim', 'washim', 'Maharashtra'),
('Yavatmal', 'yavatmal', 'Maharashtra')
ON CONFLICT (slug) DO NOTHING;

-- 2. Seed Initial Food Categories
INSERT INTO food_categories (name, description) VALUES
('Grains & Cereals', 'Essential energy sources like rice, wheat, and millets'),
('Pulses & Legumes', 'Protein-rich foods like lentils, chickpeas, and beans'),
('Dairy Products', 'Calcium and protein sources like milk, curd, and paneer'),
('Vegetables & Fruits', 'Vitamins and minerals sources'),
('Fortified Foods', 'Foods enriched with specific micronutrients'),
('Nutritional Supplements', 'Specialized supplements for targeted nutrition support')
ON CONFLICT (name) DO NOTHING;

-- 3. Seed Initial Food Item Reference Set
-- Note: We need the category IDs, so we'll use a subquery or do it by name
DO $$
DECLARE
    grains_id UUID;
    pulses_id UUID;
    fortified_id UUID;
BEGIN
    SELECT id INTO grains_id FROM food_categories WHERE name = 'Grains & Cereals';
    SELECT id INTO pulses_id FROM food_categories WHERE name = 'Pulses & Legumes';
    SELECT id INTO fortified_id FROM food_categories WHERE name = 'Fortified Foods';

    INSERT INTO food_items (category_id, name, description, nutritional_attributes) VALUES
    (grains_id, 'Rice (Basmati/Kolam)', 'Standard white rice, essential staple', '{"energy": "high", "iron": "low"}'),
    (grains_id, 'Wheat Flour (Atta)', 'Whole wheat flour for rotis', '{"fiber": "high", "protein": "moderate"}'),
    (grains_id, 'Ragi (Finger Millet)', 'Iron and calcium rich millet', '{"calcium": "very-high", "iron": "high"}'),
    (pulses_id, 'Tur Dal (Pigeon Peas)', 'Commonly used lentil for sambar/dal', '{"protein": "high", "folate": "high"}'),
    (pulses_id, 'Moong Dal (Green Gram)', 'Easy to digest protein source', '{"protein": "high", "easy-digest": "yes"}'),
    (fortified_id, 'Fortified Edible Oil', 'Oil enriched with Vitamin A and D', '{"vit-a": "high", "vit-d": "high"}'),
    (fortified_id, 'Double Fortified Salt (DFS)', 'Salt enriched with Iron and Iodine', '{"iron": "high", "iodine": "high"}')
    ON CONFLICT (name) DO NOTHING;
END $$;
