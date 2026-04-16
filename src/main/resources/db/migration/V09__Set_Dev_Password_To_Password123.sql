-- Set dev/UAT users password to "password123" (BCrypt).
-- Generated with bcrypt (2b, cost 12).

UPDATE users
SET password_hash = '$2b$12$sEcbfwygwDc9mzEe1h9d1OTa7p/DjPXz2ECRfhVW6EgW5qzrOTEiS'
WHERE email IN (
  'admin@toolsly.com',
  'staff_central@toolsly.com',
  'staff_north@toolsly.com',
  'client_verified@mail.com',
  'client_new@mail.com'
);

