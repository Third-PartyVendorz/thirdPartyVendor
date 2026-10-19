UPDATE users
SET role = UPPER(role)
WHERE Role IS NOT NULL  
    AND role <> UPPER(role);

INSERT INTO users (
    first_name,
    last_name,
    email,
    password_hash,
    role,
    phone_number,
    date_of_birth,
    is_active,
    is_frozen
)
VALUES (
    'Analyst',
    'User',
    'analyst@example.com',
    '$2a$10$.Zx3jShWnEb8VUYfb7i/suBYIQYCL4Do8yVFKL/ZAjWa88O9cq6b',
    'ANALYST',
    '555-0199',
    '1990-01-01',
    TRUE,
    FALSE
)
ON CONFLICT (email) DO UPDATE
SET role = 'ANALYST';