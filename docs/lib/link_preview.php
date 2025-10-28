<?php
declare(strict_types=1);

if (!defined('LINK_PREVIEW_CACHE_FILE')) {
    define('LINK_PREVIEW_CACHE_FILE', __DIR__ . '/../data/link_previews.json');
}
if (!defined('LINK_PREVIEW_CACHE_TTL')) {
    define('LINK_PREVIEW_CACHE_TTL', 86400); // 1 day
}
if (!defined('LINK_PREVIEW_CACHE_LIMIT')) {
    define('LINK_PREVIEW_CACHE_LIMIT', 200);
}
if (!defined('LINK_PREVIEW_FETCH_TIMEOUT')) {
    define('LINK_PREVIEW_FETCH_TIMEOUT', 5);
}
if (!defined('LINK_PREVIEW_MAX_BYTES')) {
    define('LINK_PREVIEW_MAX_BYTES', 200000);
}
if (!defined('LINK_PREVIEW_MAX_TITLE')) {
    define('LINK_PREVIEW_MAX_TITLE', 120);
}
if (!defined('LINK_PREVIEW_MAX_DESCRIPTION')) {
    define('LINK_PREVIEW_MAX_DESCRIPTION', 240);
}

function link_preview_metadata(string $url): array
{
    $normalizedUrl = link_preview_normalize_url(trim($url));
    if ($normalizedUrl === '') {
        return [
            'title' => '',
            'description' => '',
            'site_name' => '',
            'image' => ''
        ];
    }

    static $cache = null;
    if ($cache === null) {
        $cache = link_preview_load_cache();
    }

    $key = hash('sha256', $normalizedUrl);
    $entry = $cache[$key] ?? null;
    $now = time();

    if (is_array($entry) && isset($entry['fetched_at'])) {
        $age = $now - (int)$entry['fetched_at'];
        if ($age < LINK_PREVIEW_CACHE_TTL) {
            return link_preview_hydrate_entry($entry);
        }
    }

    $fresh = link_preview_fetch($normalizedUrl);
    if ($fresh !== null) {
        $entry = array_merge(
            [
                'url' => $normalizedUrl,
                'title' => '',
                'description' => '',
                'site_name' => '',
                'image' => ''
            ],
            $fresh,
            ['fetched_at' => $now]
        );
        $cache[$key] = $entry;
        $cache = link_preview_trim_cache($cache);
        link_preview_save_cache($cache);

        return link_preview_hydrate_entry($entry);
    }

    if ($entry !== null) {
        $entry['fetched_at'] = $now;
        $cache[$key] = $entry;
        link_preview_save_cache($cache);

        return link_preview_hydrate_entry($entry);
    }

    $cache[$key] = [
        'url' => $normalizedUrl,
        'title' => '',
        'description' => '',
        'site_name' => '',
        'image' => '',
        'fetched_at' => $now
    ];
    link_preview_save_cache($cache);

    return [
        'title' => '',
        'description' => '',
        'site_name' => '',
        'image' => ''
    ];
}

function link_preview_normalize_url(string $url): string
{
    $trimmed = preg_replace('/^\s+|\s+$/u', '', $url);
    if (!is_string($trimmed)) {
        $trimmed = $url;
    }

    if ($trimmed === '' || !preg_match('#^https?://#i', $trimmed)) {
        return '';
    }

    $parts = parse_url($trimmed);
    if ($parts === false || !isset($parts['scheme'], $parts['host'])) {
        return '';
    }

    $scheme = strtolower($parts['scheme']);
    $host = strtolower($parts['host']);
    $port = isset($parts['port']) ? ':' . (int)$parts['port'] : '';
    $path = $parts['path'] ?? '';
    $path = $path !== '' ? $path : '/';
    $query = isset($parts['query']) ? '?' . $parts['query'] : '';
    $fragment = isset($parts['fragment']) ? '#' . $parts['fragment'] : '';

    return $scheme . '://' . $host . $port . $path . $query . $fragment;
}

function link_preview_load_cache(): array
{
    $file = LINK_PREVIEW_CACHE_FILE;
    $dir = dirname($file);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    if (!file_exists($file)) {
        file_put_contents($file, json_encode(new stdClass(), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
        return [];
    }

    $json = file_get_contents($file);
    $data = json_decode($json, true);

    return is_array($data) ? $data : [];
}

function link_preview_save_cache(array $cache): void
{
    $file = LINK_PREVIEW_CACHE_FILE;
    $dir = dirname($file);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }

    $fp = fopen($file, 'c+');
    if ($fp === false) {
        return;
    }

    if (!flock($fp, LOCK_EX)) {
        fclose($fp);
        return;
    }

    $encoded = json_encode($cache, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    if ($encoded !== false) {
        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, $encoded);
        fflush($fp);
    }

    flock($fp, LOCK_UN);
    fclose($fp);
}

function link_preview_trim_cache(array $cache): array
{
    $count = count($cache);
    if ($count <= LINK_PREVIEW_CACHE_LIMIT) {
        return $cache;
    }

    uasort($cache, static function ($a, $b) {
        $left = $a['fetched_at'] ?? 0;
        $right = $b['fetched_at'] ?? 0;
        return $left <=> $right;
    });

    return array_slice($cache, -LINK_PREVIEW_CACHE_LIMIT, null, true);
}

function link_preview_hydrate_entry(array $entry): array
{
    return [
        'title' => isset($entry['title']) ? (string)$entry['title'] : '',
        'description' => isset($entry['description']) ? (string)$entry['description'] : '',
        'site_name' => isset($entry['site_name']) ? (string)$entry['site_name'] : '',
        'image' => isset($entry['image']) ? (string)$entry['image'] : ''
    ];
}

function link_preview_fetch(string $url): ?array
{
    $response = link_preview_http_fetch($url);
    if ($response === null) {
        return null;
    }

    $contentType = strtolower($response['content_type'] ?? '');
    if ($contentType !== '' && strpos($contentType, 'text/html') === false && strpos($contentType, 'application/xhtml+xml') === false) {
        return null;
    }

    $html = $response['content'];
    if ($html === '') {
        return null;
    }

    $meta = link_preview_extract_from_html($html, $url);
    if (empty($meta)) {
        return [
            'title' => '',
            'description' => '',
            'site_name' => '',
            'image' => ''
        ];
    }

    return $meta;
}

function link_preview_http_fetch(string $url): ?array
{
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'timeout' => LINK_PREVIEW_FETCH_TIMEOUT,
            'user_agent' => 'AkariMathLab-LinkPreview/1.0 (+https://akari0koutya.jp/)',
            'follow_location' => 1,
            'max_redirects' => 3,
            'ignore_errors' => true,
            'header' => "Accept: text/html,application/xhtml+xml;q=0.9,*/*;q=0.8\r\nConnection: close\r\n"
        ],
        'ssl' => [
            'verify_peer' => true,
            'verify_peer_name' => true
        ]
    ]);

    $stream = @fopen($url, 'rb', false, $context);
    if ($stream === false) {
        return null;
    }

    $meta = stream_get_meta_data($stream);
    $headers = isset($meta['wrapper_data']) && is_array($meta['wrapper_data']) ? $meta['wrapper_data'] : [];
    $statusLine = $headers[0] ?? '';
    if (preg_match('#\s([45]\d\d)\b#', $statusLine, $matches)) {
        fclose($stream);
        return null;
    }

    $content = '';
    while (!feof($stream) && strlen($content) < LINK_PREVIEW_MAX_BYTES) {
        $chunk = fread($stream, 8192);
        if ($chunk === false || $chunk === '') {
            break;
        }
        $content .= $chunk;
    }
    fclose($stream);

    if ($content === '') {
        return null;
    }

    $contentType = '';
    foreach ($headers as $header) {
        if (stripos($header, 'Content-Type:') === 0) {
            $contentType = trim(substr($header, 13));
            break;
        }
    }

    return [
        'content' => $content,
        'headers' => $headers,
        'content_type' => $contentType
    ];
}

function link_preview_extract_from_html(string $html, string $url): array
{
    if (class_exists('DOMDocument')) {
        libxml_use_internal_errors(true);
        $dom = new DOMDocument();
        $loaded = @$dom->loadHTML('<?xml encoding="utf-8" ?>' . $html);
        libxml_clear_errors();
        if ($loaded !== false) {
            $xpath = new DOMXPath($dom);
            $title = link_preview_first_xpath_value($xpath, [
                "//meta[translate(@property,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')='og:title']/@content",
                "//meta[translate(@name,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')='twitter:title']/@content",
                '//title/text()'
            ]);
            $description = link_preview_first_xpath_value($xpath, [
                "//meta[translate(@property,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')='og:description']/@content",
                "//meta[translate(@name,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')='twitter:description']/@content",
                "//meta[translate(@name,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')='description']/@content"
            ]);
            $siteName = link_preview_first_xpath_value($xpath, [
                "//meta[translate(@property,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')='og:site_name']/@content",
                "//meta[translate(@name,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')='application-name']/@content"
            ]);
            $image = link_preview_first_xpath_value($xpath, [
                "//meta[translate(@property,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')='og:image']/@content",
                "//meta[translate(@name,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')='twitter:image']/@content"
            ]);

            return [
                'title' => link_preview_clean_text($title, LINK_PREVIEW_MAX_TITLE),
                'description' => link_preview_clean_text($description, LINK_PREVIEW_MAX_DESCRIPTION),
                'site_name' => link_preview_clean_text($siteName, LINK_PREVIEW_MAX_TITLE),
                'image' => link_preview_sanitize_image_url($image, $url)
            ];
        }
    }

    $title = link_preview_match_meta($html, [
        '/<meta[^>]+property=["\']og:title["\'][^>]*content=["\']([^"\']+)["\']/i',
        '/<meta[^>]+name=["\']twitter:title["\'][^>]*content=["\']([^"\']+)["\']/i',
        '/<title[^>]*>(.*?)<\/title>/is'
    ]);
    $description = link_preview_match_meta($html, [
        '/<meta[^>]+property=["\']og:description["\'][^>]*content=["\']([^"\']+)["\']/i',
        '/<meta[^>]+name=["\']twitter:description["\'][^>]*content=["\']([^"\']+)["\']/i',
        '/<meta[^>]+name=["\']description["\'][^>]*content=["\']([^"\']+)["\']/i'
    ]);
    $siteName = link_preview_match_meta($html, [
        '/<meta[^>]+property=["\']og:site_name["\'][^>]*content=["\']([^"\']+)["\']/i'
    ]);
    $image = link_preview_match_meta($html, [
        '/<meta[^>]+property=["\']og:image["\'][^>]*content=["\']([^"\']+)["\']/i',
        '/<meta[^>]+name=["\']twitter:image["\'][^>]*content=["\']([^"\']+)["\']/i'
    ]);

    return [
        'title' => link_preview_clean_text($title, LINK_PREVIEW_MAX_TITLE),
        'description' => link_preview_clean_text($description, LINK_PREVIEW_MAX_DESCRIPTION),
        'site_name' => link_preview_clean_text($siteName, LINK_PREVIEW_MAX_TITLE),
        'image' => link_preview_sanitize_image_url($image, $url)
    ];
}

function link_preview_first_xpath_value(DOMXPath $xpath, array $queries): string
{
    foreach ($queries as $query) {
        $nodes = $xpath->query($query);
        if ($nodes !== false && $nodes->length > 0) {
            $value = (string)$nodes->item(0)->nodeValue;
            if (trim($value) !== '') {
                return $value;
            }
        }
    }

    return '';
}

function link_preview_match_meta(string $html, array $patterns): string
{
    foreach ($patterns as $pattern) {
        if (preg_match($pattern, $html, $matches) === 1) {
            $value = $matches[1] ?? '';
            if (trim($value) !== '') {
                return $value;
            }
        }
    }

    return '';
}

function link_preview_clean_text(string $value, int $limit): string
{
    if ($value === '') {
        return '';
    }

    $decoded = html_entity_decode($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $normalized = preg_replace('/\s+/u', ' ', $decoded);
    $normalized = trim((string)$normalized);
    if ($normalized === '') {
        return '';
    }

    return link_preview_truncate($normalized, $limit);
}

function link_preview_truncate(string $text, int $limit): string
{
    if ($text === '') {
        return '';
    }

    if (function_exists('mb_strlen') && function_exists('mb_substr')) {
        if (mb_strlen($text, 'UTF-8') > $limit) {
            return rtrim(mb_substr($text, 0, $limit - 1, 'UTF-8')) . '…';
        }
        return $text;
    }

    if (strlen($text) > $limit) {
        return rtrim(substr($text, 0, $limit - 1)) . '…';
    }

    return $text;
}

function link_preview_sanitize_image_url(string $url, string $contextUrl): string
{
    $trimmed = trim($url);
    if ($trimmed === '') {
        return '';
    }

    if (preg_match('#^https?://#i', $trimmed)) {
        return $trimmed;
    }

    if ($trimmed[0] === '/' && isset(parse_url($contextUrl)['scheme'], parse_url($contextUrl)['host'])) {
        $parts = parse_url($contextUrl);
        if ($parts !== false && isset($parts['scheme'], $parts['host'])) {
            $scheme = $parts['scheme'];
            $host = $parts['host'];
            $port = isset($parts['port']) ? ':' . $parts['port'] : '';
            return $scheme . '://' . $host . $port . $trimmed;
        }
    }

    return '';
}
