-- =====================================================================
--  El Narrador de México — Esquema MySQL / MariaDB para Neubox (cPanel)
--  Convertido desde el esquema PostgreSQL de Supabase.
--
--  Importar en phpMyAdmin:  Bases de datos -> (tu BD) -> Importar -> schema.sql
--  Después importar database/data.sql con los datos.
--
--  Notas de conversión:
--   * Postgres `text[]` (tags) -> columna TEXT que guarda un arreglo JSON.
--   * Postgres `timestamptz` -> DATETIME en UTC.
--   * Postgres `uuid` -> CHAR(36) (se guarda el UUID como texto).
--   * Se añade `password_hash` a admin_users para el login propio en PHP
--     (Supabase Auth ya no existe). Ver DEPLOY-NEUBOX.md.
-- =====================================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET sql_mode = 'NO_ENGINE_SUBSTITUTION';

-- ---------------------------------------------------------------------
--  categories — catálogo de categorías
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories` (
  `id`          VARCHAR(64)  NOT NULL,
  `name`        VARCHAR(120) NOT NULL,
  `icon`        VARCHAR(16)  DEFAULT '📰',
  `color`       INT          DEFAULT 5533294,
  `sort_order`  INT          DEFAULT 0,
  `created_at`  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
--  authors — autores normalizados
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `authors` (
  `id`          CHAR(36)     NOT NULL,
  `name`        VARCHAR(200) NOT NULL,
  `bio`         TEXT         NULL,
  `avatar_url`  TEXT         NULL,
  `email`       VARCHAR(200) NULL,
  `created_at`  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
--  news — notas del sitio (tabla principal)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `news` (
  `id`             VARCHAR(64)  NOT NULL,
  `source`         VARCHAR(20)  NOT NULL DEFAULT 'supabase',
  `title`          TEXT         NOT NULL,
  `summary`        TEXT         NULL,
  `content`        LONGTEXT     NULL,
  `image_url`      TEXT         NULL,
  `category_slug`  VARCHAR(80)  DEFAULT '',
  `category_name`  VARCHAR(120) DEFAULT '',
  `author_name`    VARCHAR(200) DEFAULT '',
  `tags`           TEXT         NULL,             -- arreglo JSON, p.ej. ["politica","mexico"]
  `published_at`   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  `created_at`     DATETIME     DEFAULT CURRENT_TIMESTAMP,
  `view_count`     INT          DEFAULT 0,
  `is_featured`    TINYINT(1)   DEFAULT 0,
  `is_breaking`    TINYINT(1)   DEFAULT 0,
  `source_url`     TEXT         NULL,
  `status`         VARCHAR(20)  NOT NULL DEFAULT 'published',
  PRIMARY KEY (`id`),
  KEY `idx_news_published_at` (`published_at`),
  KEY `idx_news_category_slug` (`category_slug`),
  KEY `idx_news_is_featured` (`is_featured`),
  KEY `idx_news_is_breaking` (`is_breaking`),
  KEY `idx_news_view_count` (`view_count`),
  KEY `idx_news_status` (`status`),
  FULLTEXT KEY `ft_news_search` (`title`, `summary`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
--  news_authors — relación N:M notas <-> autores
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `news_authors` (
  `news_id`    VARCHAR(64) NOT NULL,
  `author_id`  CHAR(36)    NOT NULL,
  PRIMARY KEY (`news_id`, `author_id`),
  KEY `idx_news_authors_author` (`author_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
--  magazines — revistas en PDF
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `magazines` (
  `id`               CHAR(36)     NOT NULL,
  `title`            VARCHAR(300) NOT NULL,
  `description`      TEXT         NULL,
  `cover_image_url`  TEXT         NULL,
  `pdf_url`          TEXT         NOT NULL,
  `edition`          VARCHAR(120) DEFAULT '',
  `published_at`     DATETIME     DEFAULT CURRENT_TIMESTAMP,
  `created_at`       DATETIME     DEFAULT CURRENT_TIMESTAMP,
  `is_featured`      TINYINT(1)   DEFAULT 0,
  `view_count`       INT          DEFAULT 0,
  `download_count`   INT          DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_magazines_published_at` (`published_at`),
  KEY `idx_magazines_is_featured` (`is_featured`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
--  admin_users — control de acceso al panel (con login propio en PHP)
--  password_hash se llena con password_hash() de PHP (bcrypt).
--  Ver tools/hash-password.php y DEPLOY-NEUBOX.md.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id`             CHAR(36)     NOT NULL,
  `email`          VARCHAR(200) NOT NULL,
  `display_name`   VARCHAR(200) NOT NULL,
  `role`           VARCHAR(20)  NOT NULL DEFAULT 'writer',
  `password_hash`  VARCHAR(255) NULL,
  `created_at`     DATETIME     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_admin_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
