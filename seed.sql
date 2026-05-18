DO $$
DECLARE
    v_user_id BIGINT;
    v_key VARCHAR;
    v_keys VARCHAR[] := ARRAY[
        'WIN_RATE_50', 'WIN_RATE_55', 'WIN_RATE_60', 'WIN_RATE_65', 'WIN_RATE_75', 'WIN_RATE_80', 'WIN_RATE_85', 'WIN_RATE_90', 'WIN_RATE_95',
        'MATCHES_10', 'MATCHES_20', 'MATCHES_50', 'MATCHES_100', 'MATCHES_150', 'MATCHES_200', 'MATCHES_250', 'MATCHES_300', 'MATCHES_400', 'MATCHES_500', 'MATCHES_750', 'MATCHES_1000',
        'WINS_10', 'WINS_20', 'WINS_50', 'WINS_100', 'WINS_150', 'WINS_200', 'WINS_250', 'WINS_300', 'WINS_400', 'WINS_500', 'WINS_750', 'WINS_1000'
    ];
BEGIN
    SELECT id INTO v_user_id FROM users WHERE username = 'admin';
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User admin not found';
    END IF;

    FOREACH v_key IN ARRAY v_keys
    LOOP
        INSERT INTO user_achievements (user_id, achievement_key, unlocked_at)
        VALUES (v_user_id, v_key, NOW())
        ON CONFLICT (user_id, achievement_key) DO NOTHING;
    END LOOP;
END $$;
