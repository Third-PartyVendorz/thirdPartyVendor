CREATE TABLE watchlist (
    user_id BIGINT NOT NULL,
    ticker VARCHAR(20) NOT NULL,
    PRIMARY KEY (user_id, ticker),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CHECK (ticker = UPPER(ticker)),
    CHECK (ticker <> '')
);

CREATE INDEX idx_watchlist_user_id
    ON watchlist (user_id);

CREATE OR REPLACE FUNCTION enforce_watchlist_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    PERFORM pg_advisory_xact_lock(NEW.user_id);

    IF (SELECT COUNT(*) FROM watchlist WHERE user_id = NEW.user_id) >= 25 THEN
        RAISE EXCEPTION 'A user may have at most 25 watchlist entries';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER watchlist_limit_trigger
BEFORE INSERT ON watchlist
FOR EACH ROW
EXECUTE FUNCTION enforce_watchlist_limit();