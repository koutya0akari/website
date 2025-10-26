<?php
declare(strict_types=1);

const DEFAULT_DIARY_PASSWORD = '@Koutya062525!akar1';
const DATA_DIR = __DIR__ . '/../data';
const DATA_FILE = DATA_DIR . '/diary_entries.json';
const SORT_OPTIONS = ['newest', 'oldest', 'title'];
const SORT_LABELS = [
    'newest' => '新しい順',
    'oldest' => '古い順',
    'title' => 'タイトル順'
];
const DIARY_LIKES_COOKIE = 'akari_diary_likes';
const DIARY_ENTRIES_PER_PAGE = 10;

function diary_password(): string
{
    $fromEnv = getenv('DIARY_POST_PASSWORD');
    if ($fromEnv !== false && trim($fromEnv) !== '') {
        return $fromEnv;
    }

    return DEFAULT_DIARY_PASSWORD;
}

function load_entries(): array
{
    if (!is_dir(DATA_DIR)) {
        mkdir(DATA_DIR, 0755, true);
    }

    if (!file_exists(DATA_FILE)) {
        file_put_contents(DATA_FILE, json_encode([], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    }

    $json = file_get_contents(DATA_FILE);
    $data = json_decode($json, true);

    if (!is_array($data)) {
        $data = [];
    }

    usort($data, static function ($left, $right) {
        $leftDate = $left['entry_date'] ?? '';
        $rightDate = $right['entry_date'] ?? '';
        if ($leftDate === $rightDate) {
            return strcmp($right['created_at'] ?? '', $left['created_at'] ?? '');
        }

        return strcmp($rightDate, $leftDate);
    });

    $normalized = array_map('normalize_entry', $data);

    return $normalized;
}

function save_entries(array $entries): void
{
    if (!is_dir(DATA_DIR)) {
        mkdir(DATA_DIR, 0755, true);
    }

    $fp = fopen(DATA_FILE, 'c+');
    if ($fp === false) {
        throw new RuntimeException('日記ファイルを開けませんでした。');
    }

    if (!flock($fp, LOCK_EX)) {
        fclose($fp);
        throw new RuntimeException('日記ファイルをロックできませんでした。');
    }

    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode(array_values($entries), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
}

function normalize_entry(array $entry): array
{
    $entry['tags'] = sanitize_tags($entry['tags'] ?? []);
    $entry['category'] = sanitize_category($entry['category'] ?? '');
    $entry['likes_count'] = isset($entry['likes_count']) ? max(0, (int) $entry['likes_count']) : 0;
    $entry['comments'] = sanitize_comments($entry['comments'] ?? []);

    return $entry;
}

function sanitize_tags($value): array
{
    if (is_string($value)) {
        return parse_tags($value);
    }

    if (!is_array($value)) {
        return [];
    }

    $normalized = [];
    foreach ($value as $tag) {
        if (!is_string($tag)) {
            continue;
        }

        $clean = trim($tag);
        if ($clean === '') {
            continue;
        }

        $normalized[] = $clean;
    }

    return array_values(array_unique($normalized));
}

function parse_tags(string $input): array
{
    if ($input === '') {
        return [];
    }

    $parts = preg_split('/[,\n、]+/u', $input);
    if ($parts === false) {
        $parts = [$input];
    }

    $tags = [];
    foreach ($parts as $part) {
        $tag = trim($part);
        if ($tag === '') {
            continue;
        }
        $tags[] = $tag;
    }

    return array_values(array_unique($tags));
}

function sanitize_comments($value): array
{
    if (!is_array($value)) {
        return [];
    }

    $comments = [];
    foreach ($value as $comment) {
        if (!is_array($comment)) {
            continue;
        }

        $body = trim((string)($comment['body'] ?? ''));
        if ($body === '') {
            continue;
        }

        $comments[] = [
            'id' => (string)($comment['id'] ?? generate_id()),
            'name' => trim((string)($comment['name'] ?? '')),
            'body' => $body,
            'posted_at' => isset($comment['posted_at']) && $comment['posted_at'] !== ''
                ? (string)$comment['posted_at']
                : date('c')
        ];
    }

    usort($comments, static fn($a, $b) => strcmp($a['posted_at'], $b['posted_at']));

    return $comments;
}

function create_comment(string $name, string $body): array
{
    return [
        'id' => generate_id(),
        'name' => trim($name),
        'body' => trim($body),
        'posted_at' => date('c')
    ];
}

function sanitize_category($value): string
{
    if (!is_string($value)) {
        return '';
    }

    return trim($value);
}

function collect_categories(array $entries): array
{
    $categories = [];
    foreach ($entries as $entry) {
        $value = sanitize_category($entry['category'] ?? '');
        if ($value === '') {
            continue;
        }
        $categories[$value] = true;
    }

    $list = array_keys($categories);
    sort($list, SORT_NATURAL | SORT_FLAG_CASE);

    return $list;
}

function filter_entries(array $entries, string $query, string $category, string $tag): array
{
    $category = sanitize_category($category);
    $tag = trim($tag);

    return array_values(array_filter($entries, static function ($entry) use ($query, $category, $tag) {
        if ($category !== '') {
            $entryCategory = sanitize_category($entry['category'] ?? '');
            if (normalize_text($entryCategory) !== normalize_text($category)) {
                return false;
            }
        }

        if ($tag !== '') {
            $tags = sanitize_tags($entry['tags'] ?? []);
            $matched = false;
            foreach ($tags as $entryTag) {
                if (normalize_text($entryTag) === normalize_text($tag)) {
                    $matched = true;
                    break;
                }
            }
            if (!$matched) {
                return false;
            }
        }

        if ($query === '') {
            return true;
        }

        $fields = [
            (string)($entry['title'] ?? ''),
            (string)($entry['body'] ?? ''),
            sanitize_category($entry['category'] ?? ''),
            implode(' ', sanitize_tags($entry['tags'] ?? [])),
            implode(' ', array_map(static fn($comment) => (string)($comment['body'] ?? ''), $entry['comments'] ?? []))
        ];

        foreach ($fields as $field) {
            if ($field === '') {
                continue;
            }

            if (contains_text($field, $query)) {
                return true;
            }
        }

        return false;
    }));
}

function sort_entries(array $entries, string $sort): array
{
    $sorted = $entries;

    usort($sorted, static function ($a, $b) use ($sort) {
        $dateA = (string)($a['entry_date'] ?? '');
        $dateB = (string)($b['entry_date'] ?? '');
        $createdA = (string)($a['created_at'] ?? '');
        $createdB = (string)($b['created_at'] ?? '');

        switch ($sort) {
            case 'oldest':
                $cmp = strcmp($dateA, $dateB);
                if ($cmp !== 0) {
                    return $cmp;
                }
                return strcmp($createdA, $createdB);
            case 'title':
                $titleA = normalize_text((string)($a['title'] ?? ''));
                $titleB = normalize_text((string)($b['title'] ?? ''));
                $cmp = strcmp($titleA, $titleB);
                if ($cmp !== 0) {
                    return $cmp;
                }
                return strcmp($createdB, $createdA);
            case 'newest':
            default:
                $cmp = strcmp($dateB, $dateA);
                if ($cmp !== 0) {
                    return $cmp;
                }
                return strcmp($createdB, $createdA);
        }
    });

    return $sorted;
}

function paginate_entries(array $entries, int $page): array
{
    $perPage = max(1, DIARY_ENTRIES_PER_PAGE);
    $totalItems = count($entries);
    $totalPages = max(1, (int)ceil($totalItems / $perPage));
    $page = max(1, min($page, $totalPages));
    $offset = ($page - 1) * $perPage;
    $items = array_slice($entries, $offset, $perPage);

    $hasPrev = $page > 1;
    $hasNext = $page < $totalPages;

    return [
        'items' => $items,
        'page' => $page,
        'total_pages' => $totalPages,
        'total_items' => $totalItems,
        'per_page' => $perPage,
        'has_prev' => $hasPrev,
        'has_next' => $hasNext,
        'prev_page' => $hasPrev ? $page - 1 : 1,
        'next_page' => $hasNext ? $page + 1 : $totalPages
    ];
}

function contains_text(string $haystack, string $needle): bool
{
    if ($needle === '') {
        return true;
    }

    if (function_exists('mb_stripos')) {
        return mb_stripos($haystack, $needle) !== false;
    }

    return stripos($haystack, $needle) !== false;
}

function normalize_text(string $value): string
{
    if ($value === '') {
        return '';
    }

    if (function_exists('mb_strtolower')) {
        return mb_strtolower($value);
    }

    return strtolower($value);
}

function sanitize_html(string $html): string
{
    $allowedTags = '<a><p><br><strong><em><u><ul><ol><li><blockquote><code><pre><img><figure><figcaption><h1><h2><h3><h4><h5><h6><div><span>';
    $clean = strip_tags($html, $allowedTags);

    // Remove event handlers and inline styles
    $clean = preg_replace('/\s(on\w+|style)\s*=\s*"[^"]*"/i', '', $clean);
    $clean = preg_replace("/\s(on\w+|style)\s*=\s*'[^']*'/i", '', $clean);

    // Sanitize anchor and image tags
    $clean = preg_replace_callback('/<a\b[^>]*>/i', 'sanitize_anchor_tag', $clean);
    $clean = preg_replace_callback('/<img\b[^>]*>/i', 'sanitize_image_tag', $clean);

    return $clean;
}

function sanitize_anchor_tag(array $matches): string
{
    $tag = $matches[0];
    $allowedAttributes = ['href', 'title', 'target', 'rel'];
    $attributes = extract_attributes($tag);
    $sanitized = [];

    $href = $attributes['href'] ?? '#';
    $href = trim($href);
    if (!preg_match('#^(https?:|mailto:|\/|\.|#)#i', $href)) {
        $href = '#';
    }
    $sanitized['href'] = $href;

    if (isset($attributes['title'])) {
        $sanitized['title'] = $attributes['title'];
    }

    if (isset($attributes['target']) && in_array(strtolower($attributes['target']), ['_blank', '_self'], true)) {
        $sanitized['target'] = strtolower($attributes['target']);
        if ($sanitized['target'] === '_blank') {
            $sanitized['rel'] = 'noopener noreferrer';
        }
    }

    if (isset($attributes['rel']) && ($sanitized['target'] ?? '') !== '_blank') {
        $sanitized['rel'] = $attributes['rel'];
    }

    $attrString = '';
    foreach ($sanitized as $name => $value) {
        if (!in_array($name, $allowedAttributes, true)) {
            continue;
        }
        $attrString .= ' ' . $name . '="' . htmlspecialchars($value, ENT_QUOTES, 'UTF-8') . '"';
    }

    return '<a' . $attrString . '>';
}

function sanitize_image_tag(array $matches): string
{
    $tag = $matches[0];
    $allowedAttributes = ['src', 'alt', 'title', 'width', 'height', 'loading'];
    $attributes = extract_attributes($tag);
    $sanitized = [];

    $src = $attributes['src'] ?? '';
    $src = trim($src);
    if ($src === '' || !preg_match('#^(https?:|\/|\.{1,2}\/|data:image/)#i', $src)) {
        return '';
    }
    $sanitized['src'] = $src;

    if (isset($attributes['alt'])) {
        $sanitized['alt'] = $attributes['alt'];
    }

    if (isset($attributes['title'])) {
        $sanitized['title'] = $attributes['title'];
    }

    foreach (['width', 'height'] as $dimension) {
        if (isset($attributes[$dimension]) && preg_match('/^\d{1,4}$/', trim($attributes[$dimension]))) {
            $sanitized[$dimension] = trim($attributes[$dimension]);
        }
    }

    if (isset($attributes['loading']) && in_array(strtolower($attributes['loading']), ['lazy', 'eager'], true)) {
        $sanitized['loading'] = strtolower($attributes['loading']);
    }

    $attrString = '';
    foreach ($sanitized as $name => $value) {
        if (!in_array($name, $allowedAttributes, true)) {
            continue;
        }
        $attrString .= ' ' . $name . '="' . htmlspecialchars($value, ENT_QUOTES, 'UTF-8') . '"';
    }

    return '<img' . $attrString . '>';
}

function extract_attributes(string $tag): array
{
    $attributes = [];
    if (preg_match_all('/(\w+)\s*=\s*("([^"]*)"|\'([^\']*)\')/i', $tag, $matches, PREG_SET_ORDER)) {
        foreach ($matches as $match) {
            $name = strtolower($match[1]);
            $value = $match[3] !== '' ? $match[3] : $match[4];
            $attributes[$name] = $value;
        }
    }

    return $attributes;
}

function add_flash(string $type, string $message): void
{
    $_SESSION['flash'][$type][] = $message;
}

function persist_form_state(array $data, array $errors): void
{
    $_SESSION['form_data'] = array_intersect_key($data, ['title' => true, 'entry_date' => true, 'body' => true, 'tags' => true, 'category' => true, 'entry_id' => true]);
    $_SESSION['form_errors'] = $errors;
}

function base_redirect_params(): array
{
    $params = [];
    $q = trim((string)($_POST['redirect_q'] ?? ''));
    if ($q !== '') {
        $params['q'] = $q;
    }

    $sort = (string)($_POST['redirect_sort'] ?? '');
    if (in_array($sort, SORT_OPTIONS, true) && $sort !== 'newest') {
        $params['sort'] = $sort;
    }

    $category = sanitize_category($_POST['redirect_category'] ?? '');
    if ($category !== '') {
        $params['category'] = $category;
    }

    $tag = trim((string)($_POST['redirect_tag'] ?? ''));
    if ($tag !== '') {
        $params['tag'] = $tag;
    }

    $page = (int)($_POST['redirect_page'] ?? 1);
    if ($page > 1) {
        $params['page'] = $page;
    }

    $anchor = trim((string)($_POST['redirect_anchor'] ?? ''));
    if ($anchor !== '') {
        $params['__anchor'] = ltrim($anchor, '#');
    }

    return $params;
}

function redirect_to(array $params = []): void
{
    $anchor = '';
    if (isset($params['__anchor'])) {
        $anchor = '#' . ltrim((string)$params['__anchor'], '#');
        unset($params['__anchor']);
    }

    $query = http_build_query($params);
    $location = 'index.php' . ($query !== '' ? '?' . $query : '') . $anchor;
    header('Location: ' . $location);
    exit;
}

function build_query_string(array $params): string
{
    $filtered = [];
    foreach ($params as $key => $value) {
        if ($value === '' || $value === null) {
            continue;
        }
        if ($key === '__anchor') {
            continue;
        }
        if ($key === 'sort') {
            if (!in_array($value, SORT_OPTIONS, true) || $value === 'newest') {
                continue;
            }
        }
        if ($key === 'category') {
            $clean = sanitize_category($value);
            if ($clean === '') {
                continue;
            }
            $value = $clean;
        }
        if ($key === 'tag') {
            $value = trim((string)$value);
            if ($value === '') {
                continue;
            }
        }
        if ($key === 'page') {
            $pageValue = (int)$value;
            if ($pageValue <= 1) {
                continue;
            }
            $filtered[$key] = $pageValue;
            continue;
        }
        $filtered[$key] = $value;
    }

    if (empty($filtered)) {
        return '';
    }

    return '?' . http_build_query($filtered);
}

function liked_entry_ids(): array
{
    if (!isset($_COOKIE[DIARY_LIKES_COOKIE])) {
        return [];
    }

    $raw = $_COOKIE[DIARY_LIKES_COOKIE];
    if (!is_string($raw) || $raw === '') {
        return [];
    }

    $decoded = base64_decode($raw, true);
    if ($decoded === false || $decoded === '') {
        return [];
    }

    $data = json_decode($decoded, true);
    if (!is_array($data)) {
        return [];
    }

    $ids = [];
    foreach ($data as $value) {
        if (!is_string($value)) {
            continue;
        }
        $value = trim($value);
        if ($value === '') {
            continue;
        }
        $ids[$value] = true;
    }

    return array_keys($ids);
}

function has_liked_entry(string $id): bool
{
    if ($id === '') {
        return false;
    }

    return in_array($id, liked_entry_ids(), true);
}

function remember_like_cookie(array $ids): void
{
    $normalized = [];
    foreach ($ids as $id) {
        if (!is_string($id)) {
            $id = (string)$id;
        }
        $id = trim($id);
        if ($id === '') {
            continue;
        }
        $normalized[$id] = true;
    }

    $payload = json_encode(array_keys($normalized));
    if ($payload === false) {
        return;
    }

    $encoded = base64_encode($payload);
    if ($encoded === false) {
        return;
    }

    $expires = time() + (60 * 60 * 24 * 365 * 5);
    $secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    if (PHP_VERSION_ID >= 70300) {
        setcookie(
            DIARY_LIKES_COOKIE,
            $encoded,
            [
                'expires' => $expires,
                'path' => '/',
                'secure' => $secure,
                'httponly' => false,
                'samesite' => 'Lax'
            ]
        );
    } else {
        setcookie(DIARY_LIKES_COOKIE, $encoded, $expires, '/', '', $secure, false);
    }
}

function remember_like(string $id): void
{
    if ($id === '') {
        return;
    }

    $ids = liked_entry_ids();
    if (!in_array($id, $ids, true)) {
        $ids[] = $id;
        remember_like_cookie($ids);
    }
}

function generate_id(): string
{
    return bin2hex(random_bytes(8));
}

function h(?string $value): string
{
    return htmlspecialchars($value ?? '', ENT_QUOTES, 'UTF-8');
}

function format_body(string $body): string
{
    $trimmed = trim($body);
    if ($trimmed === '') {
        return '';
    }

    if (!preg_match('/<\s*[a-zA-Z!\/]/', $body)) {
        return nl2br(h($body), false);
    }

    return sanitize_html($body);
}
