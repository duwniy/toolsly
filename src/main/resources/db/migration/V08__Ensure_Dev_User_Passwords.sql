-- Ensure dev/UAT users have a known working password hash.
-- Password: "password123"
-- BCrypt hash (verified in migration history/comments): $2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu

UPDATE users
SET password_hash = '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu'
WHERE email IN (
  'admin@toolsly.com',
  'staff_central@toolsly.com',
  'staff_north@toolsly.com',
  'client_verified@mail.com',
  'client_new@mail.com'
);

