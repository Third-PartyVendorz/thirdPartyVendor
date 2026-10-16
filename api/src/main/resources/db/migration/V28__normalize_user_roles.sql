UPDATE users
SET role = UPPER(role)
WHERE role IS NOT NULL
  AND role <> UPPER(role);
