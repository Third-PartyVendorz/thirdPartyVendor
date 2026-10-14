ALTER TABLE refresh_token DROP CONSTRAINT IF EXISTS fk_refresh_token_user;

ALTER TABLE refresh_token
    ALTER COLUMN user_id TYPE BIGINT USING user_id::BIGINT;

ALTER TABLE refresh_token
    ADD CONSTRAINT fk_refresh_token_user
        FOREIGN KEY (user_id)
        REFERENCES users (user_id)
        ON DELETE CASCADE;