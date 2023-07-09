USE p2render;

DROP TABLE IF EXISTS users;

CREATE TABLE users (
    user_id BIGINT NOT NULL AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    discord_id  VARCHAR(64) NOT NULL,
    discord_avatar VARCHAR(1024) NOT NULL,
    donation_link VARCHAR(1024),
    permissions INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id),
    UNIQUE KEY(username),
    UNIQUE KEY(discord_id),
    FULLTEXT (username)
);

DROP TABLE IF EXISTS access_tokens;

CREATE TABLE access_tokens (
    access_token_id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    token_name VARCHAR(32) NOT NULL,
    token_key VARCHAR(64) NOT NULL,
    permissions INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (access_token_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    UNIQUE KEY(user_id, token_name)
);

DROP TABLE IF EXISTS videos;

CREATE TABLE videos (
    video_id BINARY(16) NOT NULL,
    title VARCHAR(64),
    comment VARCHAR(512),
    requested_by_name VARCHAR(64) NOT NULL,
    requested_by_id VARCHAR(64) NOT NULL,
    requested_in_guild_id VARCHAR(64),
    requested_in_guild_name VARCHAR(64),
    requested_in_channel_id VARCHAR(64),
    requested_in_channel_name VARCHAR(64),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    render_quality VARCHAR(16),
    render_options VARCHAR(1024),
    file_name VARCHAR(64),
    file_url VARCHAR(1024),
    full_map_name VARCHAR(64),
    demo_size INT,
    demo_map_crc INT,
    demo_game_dir VARCHAR(64),
    demo_playback_time INT,
    demo_required_fix NOT NULL DEFAULT 0,
    pending INT NOT NULL DEFAULT 0,
    rendered_by BIGINT,
    rendered_by_token BIGINT,
    rendered_at TIMESTAMP,
    render_time INT AS (TIMESTAMPDIFF(SECOND, created_at, rendered_at)),
    render_node VARCHAR(64),
    video_url VARCHAR(1024),
    video_size INT,
    video_length INT,
    video_preview_url VARCHAR(1024),
    thumbnail_url_small VARCHAR(1024),
    thumbnail_url_large VARCHAR(1024),
    thumb_url VARCHAR(1024),
    views INT NOT NULL DEFAULT 0,
    visibility INT NOT NULL DEFAULT 0,
    deleted_by BIGINT,
    deleted_at TIMESTAMP,
    PRIMARY KEY (video_id),
    FOREIGN KEY (rendered_by) REFERENCES users(user_id),
    FOREIGN KEY (rendered_by_token) REFERENCES access_tokens(access_token_id),
    FOREIGN KEY (deleted_by) REFERENCES users(user_id),
    FULLTEXT (title)
);

DROP TABLE IF EXISTS likes;

CREATE TABLE likes (
    user_id BIGINT NOT NULL,
    video_id BINARY(16) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (video_id) REFERENCES videos(video_id)
);

DROP TABLE IF EXISTS bookmarks;

CREATE TABLE bookmarks (
    user_id BIGINT NOT NULL,
    video_id BINARY(16) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (video_id) REFERENCES videos(video_id)
);

DROP TABLE IF EXISTS audit_logs;

CREATE TABLE audit_logs (
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    title VARCHAR(512) NOT NULL,
    audit_type INT NOT NULL,
    source INT NOT NULL,
    source_user_id BIGINT,
    target_user_id BIGINT,
    extra VARCHAR(1024),
    FOREIGN KEY (source_user_id) REFERENCES users(user_id),
    FOREIGN KEY (target_user_id) REFERENCES users(user_id)
);
