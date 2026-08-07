-- Harden profiles table with unique username constraint and check constraints


-- Enforce username regex pattern: ^[a-z0-9._-]{3,30}$
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_username_format_check
  CHECK (
    username IS NULL OR 
    username ~ '^[a-z0-9._-]{3,30}$'
  );

-- Enforce inappropriate word filter on username and name
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_inappropriate_words_check
  CHECK (
    (username IS NULL OR username !~* '\b(admin|root|support|staff|moderator|god|sex|fuck|shit|bitch|cunt|pussy|dick|asshole)\b') AND
    (name IS NULL OR name !~* '\b(admin|root|support|staff|moderator|god|sex|fuck|shit|bitch|cunt|pussy|dick|asshole)\b')
  );
