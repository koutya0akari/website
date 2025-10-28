<?php
declare(strict_types=1);

require_once __DIR__ . '/../lib/link_preview.php';

session_start();

const RESOURCE_FILES_DIR = __DIR__ . '/files';
const RESOURCE_BASE_URL = 'files';
const RESOURCE_META_FILE = __DIR__ . '/../data/resources_meta.json';
const RESOURCE_LIKES_COOKIE = 'akari_resources_likes';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    handle_post();
}

$flash = $_SESSION['flash'] ?? ['notice' => [], 'alert' => []];
unset($_SESSION['flash']);

$items = load_files();
$meta = load_resource_meta($items);

$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? '';
$scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
$scriptDir = rtrim(dirname($scriptName), '/\\');
if ($scriptDir === '.' || $scriptDir === '/' || $scriptDir === '\\') {
    $scriptDir = '';
}
$shareBaseUrl = $host !== '' ? $scheme . '://' . $host . $scriptDir : 'https://example.com/resources';
$shareBaseUrl = rtrim($shareBaseUrl, '/');

function handle_post(): void
{
    $action = $_POST['action'] ?? '';
    $filename = (string)($_POST['file'] ?? '');
    $redirectAnchor = trim((string)($_POST['redirect_anchor'] ?? ''));

    $items = load_files();
    if (!resource_exists($items, $filename)) {
        add_flash('alert', '資料が見つかりませんでした。');
        redirect_to($redirectAnchor);
    }

    $meta = load_resource_meta($items);

    switch ($action) {
        case 'like':
            handle_like_action($filename, $meta, $redirectAnchor);
            break;
        case 'comment':
            handle_comment_action($filename, $meta, $redirectAnchor);
            break;
        default:
            redirect_to($redirectAnchor);
    }
}

function load_files(): array
{
    if (!is_dir(RESOURCE_FILES_DIR)) {
        mkdir(RESOURCE_FILES_DIR, 0755, true);
    }

    $items = [];
    $handle = opendir(RESOURCE_FILES_DIR);
    if ($handle !== false) {
        while (($entry = readdir($handle)) !== false) {
            if ($entry === '.' || $entry === '..') {
                continue;
            }
            $path = RESOURCE_FILES_DIR . '/' . $entry;
            if (is_file($path) && preg_match('/\.pdf$/i', $entry)) {
                $items[] = [
                    'name' => $entry,
                    'size' => filesize($path),
                    'mtime' => filemtime($path),
                    'description' => load_description($entry)
                ];
            }
        }
        closedir($handle);
    }

    usort($items, static fn($a, $b) => $b['mtime'] <=> $a['mtime']);

    return $items;
}

function load_resource_meta(array $items): array
{
    ensure_meta_storage();

    $json = file_get_contents(RESOURCE_META_FILE);
    $data = json_decode($json, true);
    if (!is_array($data)) {
        $data = [];
    }

    $meta = [];
    foreach ($items as $item) {
        $name = $item['name'];
        $entry = is_array($data[$name] ?? null) ? $data[$name] : [];
        $likes = isset($entry['likes_count']) ? max(0, (int)$entry['likes_count']) : 0;
        $comments = sanitize_comments($entry['comments'] ?? []);
        $meta[$name] = [
            'likes_count' => $likes,
            'comments' => $comments
        ];
    }

    return $meta;
}

function handle_like_action(string $filename, array $meta, string $redirectAnchor): void
{
    if (has_liked_resource($filename)) {
        add_flash('alert', 'この資料には既にいいねしています。');
        $anchor = $redirectAnchor !== '' ? $redirectAnchor : resource_anchor($filename);
        redirect_to($anchor);
    }

    $likes = $meta[$filename]['likes_count'] ?? 0;
    $meta[$filename]['likes_count'] = $likes + 1;
    save_resource_meta($meta);
    remember_resource_like($filename);

    add_flash('notice', 'いいねしました。');
    $anchor = $redirectAnchor !== '' ? $redirectAnchor : resource_anchor($filename);
    redirect_to($anchor);
}

function handle_comment_action(string $filename, array $meta, string $redirectAnchor): void
{
    $name = trim((string)($_POST['comment_name'] ?? ''));
    $body = trim((string)($_POST['comment_body'] ?? ''));

    if ($body === '') {
        add_flash('alert', 'コメントを入力してください。');
        $anchor = $redirectAnchor !== '' ? $redirectAnchor : resource_anchor($filename) . '-comments';
        redirect_to($anchor);
    }

    $comments = $meta[$filename]['comments'] ?? [];
    $comments[] = create_comment($name, $body);
    $meta[$filename]['comments'] = sanitize_comments($comments);
    save_resource_meta($meta);

    add_flash('notice', 'コメントを投稿しました。');
    $anchor = $redirectAnchor !== '' ? $redirectAnchor : resource_anchor($filename) . '-comments';
    redirect_to($anchor);
}

function human_filesize(int $bytes): string
{
    if ($bytes >= 1048576) {
        return round($bytes / 1048576, 2) . ' MB';
    }
    if ($bytes >= 1024) {
        return round($bytes / 1024, 2) . ' KB';
    }

    return $bytes . ' B';
}

function load_description(string $filename): string
{
    $base = pathinfo($filename, PATHINFO_FILENAME);
    foreach (['txt', 'md'] as $ext) {
        $candidate = RESOURCE_FILES_DIR . '/' . $base . '.' . $ext;
        if (is_file($candidate)) {
            $content = trim((string)file_get_contents($candidate));
            if ($content !== '') {
                return $content;
            }
        }
    }

    return '';
}

function resources_normalize_newlines(string $text): string
{
    return str_replace(["\r\n", "\r"], "\n", $text);
}

function format_description(string $text): string
{
    return nl2br(h($text), false);
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

        $rawBody = resources_normalize_newlines((string)($comment['body'] ?? ''));
        $rawBody = trim($rawBody) === '' ? '' : $rawBody;
        $bodyHtml = $comment['body_html'] ?? '';

        if ($rawBody === '' && (!is_string($bodyHtml) || trim($bodyHtml) === '')) {
            continue;
        }

        if (!is_string($bodyHtml) || trim($bodyHtml) === '') {
            $bodyHtml = build_resource_comment_html($rawBody);
        }

        $comments[] = [
            'id' => (string)($comment['id'] ?? generate_id()),
            'name' => trim((string)($comment['name'] ?? '')),
            'body' => $rawBody,
            'body_html' => $bodyHtml,
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
    $normalizedBody = resources_normalize_newlines(trim($body));

    return [
        'id' => generate_id(),
        'name' => trim($name),
        'body' => $normalizedBody,
        'body_html' => $normalizedBody !== '' ? build_resource_comment_html($normalizedBody) : '',
        'posted_at' => date('c')
    ];
}

function format_resource_comment(string $text): string
{
    return build_resource_comment_html($text);
}

function build_resource_comment_html(string $text): string
{
    $normalized = resources_normalize_newlines($text);
    if ($normalized === '') {
        return '';
    }

    $escaped = htmlspecialchars($normalized, ENT_QUOTES, 'UTF-8');
    $linked = preg_replace_callback(
        '/https?:\/\/[^\s<>\"\'\)\]]+/i',
        static function ($matches) {
            return render_resource_link_card($matches[0]);
        },
        $escaped
    );

    return nl2br($linked, false);
}

function resource_comment_body_html(array $comment): string
{
    $bodyHtml = $comment['body_html'] ?? '';
    if (is_string($bodyHtml) && trim($bodyHtml) !== '') {
        return $bodyHtml;
    }

    return build_resource_comment_html((string)($comment['body'] ?? ''));
}


function render_resource_link_card(string $url, ?string $label = null, string $extraClass = ''): string
{
    $trimmedUrl = trim($url);
    if ($trimmedUrl === '') {
        if ($label === null) {
            return '';
        }

        $labelTrimmed = trim($label);
        if ($labelTrimmed === '') {
            return '';
        }

        return htmlspecialchars($label, ENT_QUOTES, 'UTF-8');
    }

    $labelTrimmed = $label !== null ? trim($label) : '';
    $hasCustomLabel = $labelTrimmed !== '' && $labelTrimmed !== $trimmedUrl;

    $decodedUrl = html_entity_decode($trimmedUrl, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $normalizedUrl = link_preview_normalize_url($decodedUrl);
    if ($normalizedUrl === '') {
        $fallback = $hasCustomLabel ? ($label ?? $labelTrimmed) : $trimmedUrl;
        return htmlspecialchars($fallback, ENT_QUOTES, 'UTF-8');
    }

    $safeUrl = htmlspecialchars($normalizedUrl, ENT_QUOTES, 'UTF-8');
    $host = parse_url($normalizedUrl, PHP_URL_HOST) ?: $normalizedUrl;

    $preview = link_preview_metadata($normalizedUrl);
    $previewTitle = $preview['title'] ?? '';
    $previewDescription = $preview['description'] ?? '';
    $previewSite = $preview['site_name'] ?? '';

    $displayTitleRaw = $hasCustomLabel ? ($label ?? $labelTrimmed) : ($previewTitle !== '' ? $previewTitle : $normalizedUrl);
    $displayTitleEscaped = htmlspecialchars($displayTitleRaw, ENT_QUOTES, 'UTF-8');

    $siteLabel = $previewSite !== '' ? $previewSite : ($host !== '' ? $host : $normalizedUrl);
    $siteLabelEscaped = htmlspecialchars($siteLabel, ENT_QUOTES, 'UTF-8');

    $descriptionHtml = '';
    if ($previewDescription !== '') {
        $descriptionHtml = '<p class="diary-link-card__description">' . htmlspecialchars($previewDescription, ENT_QUOTES, 'UTF-8') . '</p>';
    }

    $ariaText = $displayTitleRaw !== '' ? $displayTitleRaw : $normalizedUrl;
    $ariaLabel = htmlspecialchars('新しいタブで開く: ' . $ariaText, ENT_QUOTES, 'UTF-8');

    $class = trim('diary-link-card ' . $extraClass);

    return '<div class="' . $class . '">'
        . '<div class="diary-link-card__preview">'
        . '<iframe src="' . $safeUrl . '" loading="lazy" sandbox="allow-same-origin allow-scripts allow-popups allow-forms" referrerpolicy="no-referrer"></iframe>'
        . '</div>'
        . '<div class="diary-link-card__meta">'
        . '<span class="diary-link-card__host">' . $siteLabelEscaped . '</span>'
        . '<span class="diary-link-card__title">' . $displayTitleEscaped . '</span>'
        . '<span class="diary-link-card__icon" aria-hidden="true">↗</span>'
        . $descriptionHtml
        . '</div>'
        . '<a class="diary-link-card__overlay" href="' . $safeUrl . '" target="_blank" rel="noopener noreferrer" aria-label="' . $ariaLabel . '"></a>'
        . '</div>';
}


function ensure_meta_storage(): void
{
    $dir = dirname(RESOURCE_META_FILE);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    if (!file_exists(RESOURCE_META_FILE)) {
        file_put_contents(RESOURCE_META_FILE, json_encode(new stdClass(), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    }
}

function save_resource_meta(array $meta): void
{
    ensure_meta_storage();

    $fp = fopen(RESOURCE_META_FILE, 'c+');
    if ($fp === false) {
        throw new RuntimeException('リソースメタ情報を開けませんでした。');
    }

    if (!flock($fp, LOCK_EX)) {
        fclose($fp);
        throw new RuntimeException('リソースメタ情報をロックできませんでした。');
    }

    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($meta, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
}

function resource_exists(array $items, string $filename): bool
{
    foreach ($items as $item) {
        if ($item['name'] === $filename) {
            return true;
        }
    }

    return false;
}

function add_flash(string $type, string $message): void
{
    $_SESSION['flash'][$type][] = $message;
}

function redirect_to(string $anchor = ''): void
{
    $hash = '';
    if ($anchor !== '') {
        $hash = '#' . ltrim($anchor, '#');
    }

    header('Location: index.php' . $hash);
    exit;
}

function resource_slug(string $filename): string
{
    $base = pathinfo($filename, PATHINFO_FILENAME);
    $base = $base !== '' ? $base : $filename;
    if (function_exists('mb_strtolower')) {
        $base = mb_strtolower($base);
    } else {
        $base = strtolower($base);
    }
    $slug = preg_replace('/[^a-z0-9\-]+/u', '-', $base);
    $slug = trim((string)$slug, '-');
    if ($slug === '') {
        $slug = substr(md5($filename), 0, 10);
    }
    return $slug;
}

function resource_anchor(string $filename): string
{
    return 'resource-' . resource_slug($filename);
}

function generate_id(): string
{
    return bin2hex(random_bytes(8));
}

function resource_like_ids(): array
{
    if (!isset($_COOKIE[RESOURCE_LIKES_COOKIE])) {
        return [];
    }

    $raw = $_COOKIE[RESOURCE_LIKES_COOKIE];
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

function has_liked_resource(string $filename): bool
{
    return in_array($filename, resource_like_ids(), true);
}

function remember_resource_like(string $filename): void
{
    $ids = resource_like_ids();
    if (!in_array($filename, $ids, true)) {
        $ids[] = $filename;
        persist_resource_likes($ids);
    }
}

function persist_resource_likes(array $ids): void
{
    $payload = json_encode(array_values(array_unique($ids)));
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
            RESOURCE_LIKES_COOKIE,
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
        setcookie(RESOURCE_LIKES_COOKIE, $encoded, $expires, '/', '', $secure, false);
    }
}

function h(?string $value): string
{
    return htmlspecialchars($value ?? '', ENT_QUOTES, 'UTF-8');
}
?>
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Resources | Akari Math Lab</title>
    <meta name="description" content="制作した PDF や資料を公開するページです。">
    <meta name="robots" content="index, follow" />
    <meta property="og:title" content="Resources | Akari Math Lab" />
    <meta property="og:description" content="Akariが公開しているPDF資料やスライドをダウンロードできます。" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://akari0koutya.jp/resources/" />
    <meta property="og:image" content="https://akari0koutya.jp/assets/tako-icon.svg" />
    <link rel="canonical" href="https://akari0koutya.jp/resources/" />
    <link rel="icon" href="../assets/tako-icon.svg" type="image/svg+xml" />
    <link rel="shortcut icon" href="../assets/tako-icon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="../assets/tako-icon.svg" />
    <link rel="manifest" href="../site.webmanifest" />
    <meta name="theme-color" content="#0A2441" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Signika+Negative:wght@600&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="../assets/application.css" />
  </head>
  <body>
    <div class="page-wrap">
      <header>
        <nav class="nav" aria-label="主要ナビゲーション">
          <a href="../index.html" class="brand">
            <img src="../assets/tako-icon.svg" alt="Akari Math Lab アイコン" class="brand-icon" />
            <span class="brand-title">Akari Math Lab</span>
          </a>
          <ul class="nav-list">
            <li><a class="nav-link" href="../index.html#about">プロフィール</a></li>
            <li><a class="nav-link" href="../index.html#focus">研究関心</a></li>
            <li><a class="nav-link" href="../index.html#projects">プロジェクト</a></li>
            <li><a class="nav-link" href="../index.html#timeline">活動記録</a></li>
            <li><a class="nav-link" href="../about/index.html">About</a></li>
            <li><a class="nav-link is-active" aria-current="page" href="index.php">Resources</a></li>
            <li><a class="nav-link" href="../diary/index.php">Diary</a></li>
          </ul>
        </nav>
      </header>

      <main>
        <?php foreach ($flash as $type => $messages): ?>
          <?php foreach ($messages as $message): ?>
            <?php if ($message !== ''): ?>
              <?php $isNotice = $type === 'notice'; ?>
              <div class="flash <?php echo $isNotice ? 'flash-notice' : 'flash-alert'; ?>" role="<?php echo $isNotice ? 'status' : 'alert'; ?>">
                <?php echo h($message); ?>
              </div>
            <?php endif; ?>
          <?php endforeach; ?>
        <?php endforeach; ?>

        <section class="section">
          <div class="section-header">
            <span class="section-eyebrow">Resources</span>
            <h2>公開資料</h2>
            <p>ゼミ資料や制作した PDF をダウンロードできます。</p>
          </div>
        </section>

        <section class="section">
          <article class="profile-card">
            <h3>ファイル一覧</h3>
            <?php if (!empty($items)): ?>
              <ul class="resource-list">
                <?php foreach ($items as $item): ?>
                  <?php
                    $name = $item['name'];
                    $anchor = resource_anchor($name);
                    $commentsAnchor = $anchor . '-comments';
                    $stats = $meta[$name] ?? ['likes_count' => 0, 'comments' => []];
                    $likesCount = (int)($stats['likes_count'] ?? 0);
                    $comments = $stats['comments'] ?? [];
                    $commentCount = count($comments);
                    $viewerHasLiked = has_liked_resource($name);
                    $resourceUrl = $shareBaseUrl . '/index.php#' . $anchor;
                    $shareUrlEncoded = rawurlencode($resourceUrl);
                    $shareTextEncoded = rawurlencode(pathinfo($name, PATHINFO_FILENAME) . ' | Akari Resources');
                    $downloadUrl = RESOURCE_BASE_URL . '/' . rawurlencode($name);
                  ?>
                  <li class="resource-item" id="<?php echo h($anchor); ?>">
                    <div class="resource-item-header">
                      <div class="resource-meta">
                        <strong><?php echo h($name); ?></strong>
                        <span><?php echo human_filesize($item['size']); ?></span>
                        <time datetime="<?php echo h(date('c', $item['mtime'])); ?>"><?php echo h(date('Y-m-d', $item['mtime'])); ?></time>
                        <?php if (!empty($item['description'])): ?>
                          <p class="resource-description"><?php echo format_description($item['description']); ?></p>
                        <?php endif; ?>
                      </div>
                      <div class="resource-actions">
                        <a class="btn resource-download" href="<?php echo h($downloadUrl); ?>" download>ダウンロード</a>
                      </div>
                    </div>
                    <div class="resource-engagement">
                      <form method="post" class="resource-like-form diary-like-form" data-resource-id="<?php echo h($name); ?>">
                        <input type="hidden" name="action" value="like" />
                        <input type="hidden" name="file" value="<?php echo h($name); ?>" />
                        <input type="hidden" name="redirect_anchor" value="<?php echo h($anchor); ?>" />
                        <button
                          type="submit"
                          class="diary-like-button<?php if ($viewerHasLiked) { echo ' is-liked'; } ?>"
                          <?php if ($viewerHasLiked) { echo 'disabled'; } ?>
                        ><?php echo $viewerHasLiked ? 'いいね済み' : 'いいね'; ?></button>
                        <span class="diary-like-count" data-like-count><?php echo $likesCount; ?></span>
                      </form>
                      <div class="diary-share-buttons resource-share-buttons">
                        <a class="diary-share-button" target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?url=<?php echo $shareUrlEncoded; ?>&text=<?php echo $shareTextEncoded; ?>">Twitter</a>
                        <a class="diary-share-button" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=<?php echo $shareUrlEncoded; ?>">Facebook</a>
                      </div>
                    </div>
                    <details class="diary-comments resource-comments" id="<?php echo h($commentsAnchor); ?>">
                      <summary class="diary-comments-summary">
                        コメント
                        <?php if ($commentCount > 0): ?>
                          <span class="diary-comments-count"><?php echo $commentCount; ?></span>
                        <?php endif; ?>
                      </summary>
                      <div class="diary-comments-body">
                        <?php if (!empty($comments)): ?>
                          <ul class="diary-comment-list">
                            <?php foreach ($comments as $comment): ?>
                              <li class="diary-comment" id="resource-comment-<?php echo h($comment['id']); ?>">
                                <div class="diary-comment-meta">
                                  <span class="diary-comment-author"><?php echo h($comment['name'] !== '' ? $comment['name'] : '匿名'); ?></span>
                                  <?php if (!empty($comment['posted_at'])): ?>
                                    <time datetime="<?php echo h($comment['posted_at']); ?>"><?php echo h(date('Y-m-d H:i', strtotime($comment['posted_at']))); ?></time>
                                  <?php endif; ?>
                                </div>
                              <div class="diary-comment-body"><?php echo resource_comment_body_html($comment); ?></div>
                              </li>
                            <?php endforeach; ?>
                          </ul>
                        <?php else: ?>
                          <p class="diary-comments-empty">まだコメントはありません。</p>
                        <?php endif; ?>
                        <form method="post" class="diary-comment-form resource-comment-form">
                          <input type="hidden" name="action" value="comment" />
                          <input type="hidden" name="file" value="<?php echo h($name); ?>" />
                          <input type="hidden" name="redirect_anchor" value="<?php echo h($commentsAnchor); ?>" />
                          <label class="diary-label">
                            <span>お名前 (任意)</span>
                            <input type="text" name="comment_name" class="diary-input" placeholder="匿名" />
                          </label>
                          <label class="diary-label">
                            <span>コメント</span>
                            <textarea name="comment_body" class="diary-textarea" rows="3" placeholder="コメントを入力してください" required></textarea>
                          </label>
                          <div class="diary-comment-actions">
                            <button type="submit" class="btn btn-outline">コメントを送信</button>
                          </div>
                        </form>
                      </div>
                    </details>
                  </li>
                <?php endforeach; ?>
              </ul>
            <?php else: ?>
              <p>公開中の PDF はまだありません。<code>docs/resources/files/</code> に PDF を追加すると自動で表示されます。</p>
            <?php endif; ?>
          </article>
        </section>
      </main>

      <footer>
        <div class="footer-inner">
          <p>© <?php echo date('Y'); ?> Akari Math Lab. Crafted for Sakura Rental Server.</p>
          <div class="footer-links">
            <a href="../index.html">Home</a>
            <a href="../about/index.html">About</a>
            <a href="../diary/index.php">Diary</a>
            <a href="index.php">Resources</a>
            <a href="../index.html#contact">Contact</a>
          </div>
        </div>
      </footer>
    </div>

    <script>
      document.addEventListener('DOMContentLoaded', function() {
        function openCommentsFromHash() {
          const { hash } = window.location;
          if (!hash) return;
          try {
            const target = document.querySelector(hash);
            if (target && target.tagName === 'DETAILS') {
              target.open = true;
            }
          } catch (error) {
            // ignore invalid selectors
          }
        }

        openCommentsFromHash();
        window.addEventListener('hashchange', openCommentsFromHash);

        const likesStorageKey = 'akari-resources-likes';
        const likesCookieKey = 'akari_resources_likes';
        const likeCookieMaxAge = 60 * 60 * 24 * 365 * 5;

        const mergeUnique = (target, items) => {
          if (!Array.isArray(items)) return;
          items.forEach(item => {
            if (typeof item !== 'string') return;
            const trimmed = item.trim();
            if (!trimmed) return;
            if (!target.includes(trimmed)) {
              target.push(trimmed);
            }
          });
        };

        let likedResources = [];
        try {
          const storedLikes = JSON.parse(localStorage.getItem(likesStorageKey) || '[]');
          mergeUnique(likedResources, storedLikes);
        } catch (error) {
          likedResources = [];
        }

        try {
          const cookiePart = document.cookie.split('; ').find(row => row.startsWith(likesCookieKey + '='));
          if (cookiePart) {
            const encoded = cookiePart.substring(likesCookieKey.length + 1);
            const decoded = atob(encoded);
            const cookieLikes = JSON.parse(decoded);
            mergeUnique(likedResources, cookieLikes);
          }
        } catch (error) {
          // ignore cookie parse errors
        }

        const persistLikes = () => {
          try {
            localStorage.setItem(likesStorageKey, JSON.stringify(likedResources));
          } catch (error) {
            // ignore quota errors
          }
          try {
            const encoded = btoa(JSON.stringify(likedResources));
            document.cookie = `${likesCookieKey}=${encoded};path=/;max-age=${likeCookieMaxAge};SameSite=Lax`;
          } catch (error) {
            // ignore cookie errors
          }
        };

        if (likedResources.length > 0) {
          persistLikes();
        }

        document.querySelectorAll('.resource-like-form').forEach(form => {
          const resourceId = form.dataset.resourceId;
          if (!resourceId) return;

          const button = form.querySelector('.diary-like-button');
          const countEl = form.querySelector('[data-like-count]');

          const markLiked = () => {
            if (!button) return;
            button.classList.add('is-liked');
            button.disabled = true;
            button.textContent = 'いいね済み';
          };

          if (likedResources.includes(resourceId)) {
            markLiked();
          }

          form.addEventListener('submit', () => {
            if (!likedResources.includes(resourceId)) {
              likedResources.push(resourceId);
              persistLikes();
              if (countEl) {
                const current = parseInt(countEl.textContent, 10);
                if (!Number.isNaN(current)) {
                  countEl.textContent = current + 1;
                }
              }
            }
            markLiked();
          });
        });
      });
    </script>
  </body>
</html>
