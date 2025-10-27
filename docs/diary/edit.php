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
$formData = $_SESSION['form_data'] ?? [];
$formErrors = $_SESSION['form_errors'] ?? [];
$shouldClearDraft = $_SESSION['clear_draft'] ?? false;

unset($_SESSION['flash'], $_SESSION['form_data'], $_SESSION['form_errors'], $_SESSION['clear_draft']);

$defaultDate = date('Y-m-d');
$formDefaults = [
    'title' => '',
    'entry_date' => $defaultDate,
    'body' => '',
    'tags' => '',
    'category' => ''
];

if ($entry !== null && (empty($formErrors) || ($formData['entry_id'] ?? '') !== $entryId)) {
    $formDefaults['title'] = (string)($entry['title'] ?? '');
    $formDefaults['entry_date'] = (string)($entry['entry_date'] ?? $defaultDate);
    $formDefaults['body'] = (string)($entry['body'] ?? '');
    $formDefaults['tags'] = implode(', ', sanitize_tags($entry['tags'] ?? []));
    $formDefaults['category'] = sanitize_category($entry['category'] ?? '');
}

$formValues = array_merge($formDefaults, array_intersect_key($formData, $formDefaults));

$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? '';
$scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
$scriptDir = rtrim(dirname($scriptName), '/\\');
if ($scriptDir === '.' || $scriptDir === '/' || $scriptDir === '\\') {
    $scriptDir = '';
}
$shareBaseUrl = $host !== '' ? $scheme . '://' . $host . $scriptDir : 'https://example.com/diary';
$shareBaseUrl = rtrim($shareBaseUrl, '/');

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
    <title><?php echo h(($entry['title'] ?? '') !== '' ? $entry['title'] . ' を編集 | Akari Diary' : '日記を編集 | Akari Diary'); ?></title>
    <meta name="description" content="学習日記の投稿を編集する専用ページです。内容の更新やタグ・フォルダーの調整ができます。">
    <meta name="robots" content="noindex, nofollow" />
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
            <span class="section-eyebrow">Diary Editor</span>
            <h2>日記を編集</h2>
            <p>投稿済みの日記を落ち着いて編集できるページです。編集内容は保存すると一覧にも反映されます。</p>
            <p>
              <a class="diary-back-link" href="index.php">← Diary に戻る</a>
              <?php if ($entry !== null): ?>
                <a class="diary-back-link" href="show.php?id=<?php echo h($entryId); ?>">投稿を表示</a>
              <?php endif; ?>
            </p>
          </div>
        </section>

        <section class="section">
          <article class="profile-card diary-editor diary-editor-full">
            <?php if ($entry === null): ?>
              <p>該当する日記が見つかりませんでした。すでに削除されている可能性があります。</p>
            <?php else: ?>
              <?php if (!empty($formErrors)): ?>
                <div class="form-errors" role="alert">
                  <ul>
                    <?php foreach ($formErrors as $error): ?>
                      <li><?php echo h($error); ?></li>
                    <?php endforeach; ?>
                  </ul>
                </div>
              <?php endif; ?>

              <form method="post" action="index.php" class="diary-form">
                <input type="hidden" name="action" value="update" />
                <input type="hidden" name="entry_id" value="<?php echo h($entryId); ?>" />
                <input type="hidden" name="redirect_path" value="<?php echo h('edit.php?id=' . $entryId); ?>" />

                <label class="diary-label">
                  <span>タイトル</span>
                  <input type="text" name="title" class="diary-input" placeholder="タイトル" value="<?php echo h($formValues['title']); ?>" />
                </label>

                <label class="diary-label">
                  <span>日付</span>
                  <input type="date" name="entry_date" class="diary-input" value="<?php echo h($formValues['entry_date']); ?>" />
                </label>

                <label class="diary-label">
                  <span>本文</span>
                  <textarea name="body" class="diary-textarea" rows="12" placeholder="本文を入力してください…"><?php echo h($formValues['body']); ?></textarea>
                </label>

                <label class="diary-label">
                  <span>フォルダー</span>
                  <input type="text" name="category" class="diary-input" list="edit-categories" placeholder="例: 研究メモ" value="<?php echo h($formValues['category']); ?>" />
                </label>
                <datalist id="edit-categories">
                  <?php foreach ($entries as $candidate): ?>
                    <?php $category = sanitize_category($candidate['category'] ?? ''); ?>
                    <?php if ($category !== ''): ?>
                      <option value="<?php echo h($category); ?>"></option>
                    <?php endif; ?>
                  <?php endforeach; ?>
                </datalist>

                <label class="diary-label">
                  <span>タグ (カンマ区切り)</span>
                  <input type="text" name="tags" class="diary-input" placeholder="例: 代数幾何, ゼミ" value="<?php echo h($formValues['tags']); ?>" />
                </label>

                <label class="diary-label">
                  <span>投稿パスワード</span>
                  <input type="password" name="post_password" class="diary-input" placeholder="投稿パスワード" autocomplete="off" />
                </label>

                <div class="diary-actions">
                  <button type="submit" class="btn btn-primary">日記を更新</button>
                  <a href="show.php?id=<?php echo h($entryId); ?>" class="btn btn-outline">投稿を確認</a>
                </div>
              </form>
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
        const form = document.querySelector('.diary-form');
        if (!form) return;

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
          // ignore parse errors
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
      });
    </script>
  </body>
</html>
