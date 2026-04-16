-- Update all user passwords to a known valid hash for "password123"
-- Valid hash: $2a$10$ByI6qP2z5v1P2z5v1P2z5uk6E0NfG.2ZMRZoMyeIjZAgNoU716le
-- Note: Using a standard hash for "password123"

UPDATE users 
SET password_hash = '$2a$10$vI8tmZH.AYV64.6B0L638u4zWuf7.LDRvS5A2QyRz8H7S7uCqJ.3C'
WHERE email IN ('admin@toolsly.com', 'staff_central@toolsly.com', 'staff_north@toolsly.com', 'client_verified@mail.com', 'client_new@mail.com');
