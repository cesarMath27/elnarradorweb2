<?php
/**
 * queries.php — capa de acceso a datos.
 * Equivale a src/lib/supabase/queries.ts y magazines.ts del proyecto Next.
 */

declare(strict_types=1);

/* ──────────────────────────── NOTAS ──────────────────────────── */

function get_latest_news(int $limit = 20, int $offset = 0): array
{
    $st = db()->prepare(
        "SELECT * FROM news ORDER BY published_at DESC LIMIT :lim OFFSET :off"
    );
    $st->bindValue(':lim', $limit, PDO::PARAM_INT);
    $st->bindValue(':off', $offset, PDO::PARAM_INT);
    $st->execute();
    return $st->fetchAll();
}

function get_featured_news(int $limit = 5): array
{
    $st = db()->prepare(
        "SELECT * FROM news WHERE is_featured = 1 ORDER BY published_at DESC LIMIT :lim"
    );
    $st->bindValue(':lim', $limit, PDO::PARAM_INT);
    $st->execute();
    return $st->fetchAll();
}

function get_breaking_news(int $limit = 3): array
{
    $st = db()->prepare(
        "SELECT * FROM news WHERE is_breaking = 1 ORDER BY published_at DESC LIMIT :lim"
    );
    $st->bindValue(':lim', $limit, PDO::PARAM_INT);
    $st->execute();
    return $st->fetchAll();
}

function get_news_by_category(string $slug, int $limit = 20): array
{
    $st = db()->prepare(
        "SELECT * FROM news WHERE category_slug = :slug ORDER BY published_at DESC LIMIT :lim"
    );
    $st->bindValue(':slug', $slug);
    $st->bindValue(':lim', $limit, PDO::PARAM_INT);
    $st->execute();
    return $st->fetchAll();
}

function get_news_by_id(string $id): ?array
{
    $st = db()->prepare("SELECT * FROM news WHERE id = :id LIMIT 1");
    $st->execute([':id' => $id]);
    $row = $st->fetch();
    return $row ?: null;
}

function search_news(string $query, int $limit = 20): array
{
    $like = '%' . $query . '%';
    $st = db()->prepare(
        "SELECT * FROM news
         WHERE title LIKE :q OR summary LIKE :q2 OR content LIKE :q3
         ORDER BY published_at DESC LIMIT :lim"
    );
    $st->bindValue(':q', $like);
    $st->bindValue(':q2', $like);
    $st->bindValue(':q3', $like);
    $st->bindValue(':lim', $limit, PDO::PARAM_INT);
    $st->execute();
    return $st->fetchAll();
}

function get_most_viewed(int $limit = 5): array
{
    $st = db()->prepare(
        "SELECT * FROM news ORDER BY view_count DESC LIMIT :lim"
    );
    $st->bindValue(':lim', $limit, PDO::PARAM_INT);
    $st->execute();
    return $st->fetchAll();
}

function increment_view_count(string $id): void
{
    try {
        $st = db()->prepare("UPDATE news SET view_count = view_count + 1 WHERE id = :id");
        $st->execute([':id' => $id]);
    } catch (PDOException $e) {
        // No romper la vista del artículo por un fallo en el contador.
        error_log('increment_view_count: ' . $e->getMessage());
    }
}

/* ──────────────────────────── AUTORES ──────────────────────────── */

function get_authors_by_news_id(string $newsId): array
{
    $st = db()->prepare(
        "SELECT a.* FROM authors a
         JOIN news_authors na ON na.author_id = a.id
         WHERE na.news_id = :id ORDER BY a.name"
    );
    $st->execute([':id' => $newsId]);
    return $st->fetchAll();
}

/* ──────────────────────────── REVISTAS ──────────────────────────── */

function get_magazines(int $limit = 20): array
{
    $st = db()->prepare(
        "SELECT * FROM magazines ORDER BY published_at DESC LIMIT :lim"
    );
    $st->bindValue(':lim', $limit, PDO::PARAM_INT);
    $st->execute();
    return $st->fetchAll();
}

function get_magazine_by_id(string $id): ?array
{
    $st = db()->prepare("SELECT * FROM magazines WHERE id = :id LIMIT 1");
    $st->execute([':id' => $id]);
    $row = $st->fetch();
    return $row ?: null;
}

/* ──────────────────────────── CONTEOS (dashboard) ──────────────────────────── */

function count_news(): int          { return (int) db()->query("SELECT COUNT(*) FROM news")->fetchColumn(); }
function count_magazines(): int      { return (int) db()->query("SELECT COUNT(*) FROM magazines")->fetchColumn(); }
function count_featured(): int       { return (int) db()->query("SELECT COUNT(*) FROM news WHERE is_featured = 1")->fetchColumn(); }
function count_breaking(): int       { return (int) db()->query("SELECT COUNT(*) FROM news WHERE is_breaking = 1")->fetchColumn(); }
