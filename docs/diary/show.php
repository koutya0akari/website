<?php
declare(strict_types=1);

session_start();

require_once __DIR__ . '/lib.php';

$entryId = trim((string)($_GET['id'] ?? ''));
if ($entryId === '') {
    header('Location: index.php');
    exit;
}

$entries = load_entries();
$entry = null;
foreach ($entries as $candidate) {
    if (($candidate['id'] ?? '') === $entryId) {
        $entry = $candidate;
        break;
    }
}

if ($entry === null) {
    http_response_code(404);
}

$flash = $_SESSION['flash'] ?? ['notice' => [], 'alert' => []];
$formErrors = $_SESSION['form_errors'] ?? [];
$formData = $_SESSION['form_data'] ?? [];
$shouldClearDraft = $_SESSION['clear_draft'] ?? false;

unset($_SESSION['flash'], $_SESSION['form_errors'], $_SESSION['form_data'], $_SESSION['clear_draft']);

$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? '';
$scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
$scriptDir = rtrim(dirname($scriptName), '/\\');
if ($scriptDir === '.' || $scriptDir === '/' || $scriptDir === '\\') {
    $scriptDir = '';
}
$shareBaseUrl = $host !== '' ? $scheme . '://' . $host . $scriptDir : 'https://example.com/diary';
$shareBaseUrl = rtrim($shareBaseUrl, '/');
$canonicalUrl = $shareBaseUrl . '/show.php?id=' . rawurlencode($entryId);

$redirectPath = 'show.php?id=' . rawurlencode($entryId);
$entryAnchor = 'entry-' . $entryId;
$commentsAnchor = $entryAnchor . '-comments';

$likesCount = isset($entry['likes_count']) ? (int)$entry['likes_count'] : 0;
$entryComments = $entry['comments'] ?? [];
$commentCount = is_array($entryComments) ? count($entryComments) : 0;
$viewerHasLiked = has_liked_entry($entryId);
$shareUrl = $shareBaseUrl . '/show.php?id=' . rawurlencode($entryId);
$shareUrlEncoded = rawurlencode($shareUrl);
$shareTextEncoded = rawurlencode(($entry['title'] ?? '学習日記') . ' | Akari Diary');

$category = sanitize_category($entry['category'] ?? '');
$tags = sanitize_tags($entry['tags'] ?? []);
$allCategories = collect_categories($entries);

function render_flash_messages(array $flash): void
{
    foreach ($flash as $type => $messages) {
        foreach ($messages as $message) {
            if ($message === '') {
                continue;
            }
            $isNotice = $type === 'notice';
            $class = $isNotice ? 'flash-notice' : 'flash-alert';
            $role = $isNotice ? 'status' : 'alert';
            echo '<div class="flash ' . $class . '" role="' . $role . '">' . h($message) . '</div>';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title><?php echo h(($entry['title'] ?? '') !== '' ? $entry['title'] . ' | Akari Diary' : '学習日記 | Akari Diary'); ?></title>
    <meta name="description" content="学習日記の投稿詳細ページです。カテゴリーやタグ、コメントも確認できます。">
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="<?php echo h($canonicalUrl); ?>" />
    <link rel="icon" href="../assets/tako-icon.svg" type="image/svg+xml" />
    <link rel="shortcut icon" href="../assets/tako-icon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="../assets/tako-icon.svg" />
    <link rel="manifest" href="../site.webmanifest" />
    <meta name="theme-color" content="#0A2441" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Signika+Negative:wght@600&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="../assets/application.css" />
    <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js" defer></script>
  </head>
  <body data-clear-draft="<?php echo $shouldClearDraft ? 'true' : 'false'; ?>">
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
            <li><a class="nav-link" href="../resources/index.php">Resources</a></li>
            <li><a class="nav-link is-active" aria-current="page" href="index.php">Diary</a></li>
          </ul>
        </nav>
      </header>

      <main>
        <?php render_flash_messages($flash); ?>

        <section class="section">
          <div class="section-header">
            <span class="section-eyebrow">Diary Entry</span>
            <h2><?php echo h(($entry['title'] ?? '') !== '' ? $entry['title'] : '無題'); ?></h2>
            <p>個別ページで日記を閲覧しています。タグ・フォルダー・コメント・リアクションもこちらで確認できます。</p>
            <p><a class="diary-back-link" href="index.php">← Diary 一覧に戻る</a></p>
          </div>
        </section>

        <section class="section">
          <article class="profile-card diary-detail" id="<?php echo h($entryAnchor); ?>">
            <?php if ($entry === null): ?>
              <p>該当する日記が見つかりませんでした。削除された可能性があります。</p>
            <?php else: ?>
              <header class="diary-detail-header">
                <div class="diary-item-meta">
                  <?php if (!empty($entry['entry_date'])): ?>
                    <time datetime="<?php echo h($entry['entry_date']); ?>"><?php echo h($entry['entry_date']); ?></time>
                  <?php endif; ?>
                  <?php if ($category !== ''): ?>
                    <?php
                      $categoryLinkParams = ['name' => $category];
                    ?>
                    <a class="diary-item-category" href="folder.php<?php echo build_query_string($categoryLinkParams); ?>">
                      <span class="diary-item-category-label">フォルダー</span>
                      <?php echo h($category); ?>
                    </a>
                  <?php endif; ?>
                  <?php if (!empty($tags)): ?>
                    <ul class="diary-tag-list">
                      <?php foreach ($tags as $tag): ?>
                        <li>
                          <a class="diary-tag" href="index.php<?php echo build_query_string(['tag' => $tag]); ?>">#<?php echo h($tag); ?></a>
                        </li>
                      <?php endforeach; ?>
                    </ul>
                  <?php endif; ?>
                </div>
                <div class="diary-detail-actions">
                  <a class="diary-edit-link" href="edit.php?id=<?php echo h($entryId); ?>">編集ページ</a>
                  <a class="diary-edit-link" href="index.php">一覧に戻る</a>
                </div>
              </header>

              <div class="diary-item-body">
                <?php echo entry_body_html($entry); ?>
              </div>

              <div class="diary-engagement">
                <form method="post" action="index.php" class="diary-like-form" data-entry-id="<?php echo h($entryId); ?>">
                  <input type="hidden" name="action" value="like" />
                  <input type="hidden" name="entry_id" value="<?php echo h($entryId); ?>" />
                  <input type="hidden" name="redirect_path" value="<?php echo h($redirectPath); ?>" />
                  <input type="hidden" name="redirect_anchor" value="<?php echo h($entryAnchor); ?>" />
                  <button
                    type="submit"
                    class="diary-like-button<?php if ($viewerHasLiked) { echo ' is-liked'; } ?>"
                    <?php if ($viewerHasLiked) { echo 'disabled'; } ?>
                  ><?php echo $viewerHasLiked ? 'いいね済み' : 'いいね'; ?></button>
                  <span class="diary-like-count" data-like-count><?php echo $likesCount; ?></span>
                </form>
                <div class="diary-share-buttons">
                  <a class="diary-share-button" target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?url=<?php echo $shareUrlEncoded; ?>&text=<?php echo $shareTextEncoded; ?>">Twitter</a>
                  <a class="diary-share-button" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=<?php echo $shareUrlEncoded; ?>">Facebook</a>
                </div>
              </div>

              <details class="diary-comments" id="<?php echo h($commentsAnchor); ?>">
                <summary class="diary-comments-summary">
                  コメント
                  <?php if ($commentCount > 0): ?>
                    <span class="diary-comments-count"><?php echo $commentCount; ?></span>
                  <?php endif; ?>
                </summary>
                <div class="diary-comments-body">
                  <?php if (!empty($entryComments)): ?>
                    <ul class="diary-comment-list">
                      <?php foreach ($entryComments as $comment): ?>
                        <li class="diary-comment" id="comment-<?php echo h(($comment['id'] ?? '')); ?>">
                          <div class="diary-comment-meta">
                            <span class="diary-comment-author"><?php echo h(!empty($comment['name']) ? $comment['name'] : '匿名'); ?></span>
                            <?php if (!empty($comment['posted_at'])): ?>
                              <time datetime="<?php echo h($comment['posted_at']); ?>"><?php echo h(date('Y-m-d H:i', strtotime($comment['posted_at']))); ?></time>
                            <?php endif; ?>
                          </div>
                          <div class="diary-comment-body"><?php echo comment_body_html($comment); ?></div>
                        </li>
                      <?php endforeach; ?>
                    </ul>
                  <?php else: ?>
                    <p class="diary-comments-empty">まだコメントはありません。</p>
                  <?php endif; ?>
                  <form method="post" action="index.php" class="diary-comment-form">
                    <input type="hidden" name="action" value="comment" />
                    <input type="hidden" name="entry_id" value="<?php echo h($entryId); ?>" />
                    <input type="hidden" name="redirect_path" value="<?php echo h($redirectPath); ?>" />
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
            <a href="../resources/index.php">Resources</a>
            <a href="index.php">Diary</a>
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

        const likesStorageKey = 'akari-diary-likes';
        const likesCookieKey = 'akari_diary_likes';
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

        let likedEntries = [];
        try {
          const storedLikes = JSON.parse(localStorage.getItem(likesStorageKey) || '[]');
          mergeUnique(likedEntries, storedLikes);
        } catch (error) {
          likedEntries = [];
        }

        try {
          const cookiePart = document.cookie.split('; ').find(row => row.startsWith(likesCookieKey + '='));
          if (cookiePart) {
            const encoded = cookiePart.substring(likesCookieKey.length + 1);
            const decoded = atob(encoded);
            const cookieLikes = JSON.parse(decoded);
            mergeUnique(likedEntries, cookieLikes);
          }
        } catch (error) {
          // ignore cookie parse errors
        }

        const persistLikes = () => {
          try {
            localStorage.setItem(likesStorageKey, JSON.stringify(likedEntries));
          } catch (error) {
            // ignore quota errors
          }
          try {
            const encoded = btoa(JSON.stringify(likedEntries));
            document.cookie = `${likesCookieKey}=${encoded};path=/;max-age=${likeCookieMaxAge};SameSite=Lax`;
          } catch (error) {
            // ignore cookie errors
          }
        };

        if (likedEntries.length > 0) {
          persistLikes();
        }

        document.querySelectorAll('.diary-like-form').forEach(form => {
          const entryId = form.dataset.entryId;
          if (!entryId) return;

          const button = form.querySelector('.diary-like-button');
          const countEl = form.querySelector('[data-like-count]');

          const markLiked = () => {
            if (!button) return;
            button.classList.add('is-liked');
            button.disabled = true;
            button.textContent = 'いいね済み';
          };

          if (likedEntries.includes(entryId)) {
            markLiked();
          }

          form.addEventListener('submit', () => {
            if (!likedEntries.includes(entryId)) {
              likedEntries.push(entryId);
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
