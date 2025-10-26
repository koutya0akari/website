<?php
declare(strict_types=1);

session_start();

const DEFAULT_DIARY_PASSWORD = '@Koutya0akari';
const DATA_DIR = __DIR__ . '/../data';
const DATA_FILE = DATA_DIR . '/diary_entries.json';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    handle_post();
}

$flash = $_SESSION['flash'] ?? ['notice' => [], 'alert' => []];
$formData = $_SESSION['form_data'] ?? [];
$formErrors = $_SESSION['form_errors'] ?? [];
$shouldClearDraft = $_SESSION['clear_draft'] ?? false;

unset($_SESSION['flash'], $_SESSION['form_data'], $_SESSION['form_errors'], $_SESSION['clear_draft']);

$entries = load_entries();
$formData = array_merge(
    [
        'title' => '',
        'entry_date' => date('Y-m-d'),
        'body' => ''
    ],
    array_intersect_key($formData, ['title' => true, 'entry_date' => true, 'body' => true])
);

function handle_post(): void
{
    $action = $_POST['action'] ?? '';
    $password = (string)($_POST['post_password'] ?? '');

    if (!hash_equals(diary_password(), $password)) {
        add_flash('alert', '投稿パスワードが正しくありません。');
        if ($action === 'create') {
            persist_form_state($_POST, []);
        }
        redirect_self();
    }

    if ($action === 'create') {
        handle_create();
    } elseif ($action === 'delete') {
        handle_delete();
    }

    redirect_self();
}

function handle_create(): void
{
    $title = trim((string)($_POST['title'] ?? ''));
    $entryDate = trim((string)($_POST['entry_date'] ?? ''));
    $body = trim((string)($_POST['body'] ?? ''));

    if ($entryDate === '' || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $entryDate)) {
        $entryDate = date('Y-m-d');
    }

    $errors = [];
    if ($body === '') {
        $errors[] = '本文を入力してください。';
    }

    if (!empty($errors)) {
        persist_form_state(
            ['title' => $title, 'entry_date' => $entryDate, 'body' => $body],
            $errors
        );

        redirect_self();
    }

    $entry = [
        'id' => generate_id(),
        'title' => $title,
        'entry_date' => $entryDate,
        'body' => $body,
        'created_at' => date('c'),
        'updated_at' => date('c')
    ];

    $entries = load_entries();
    $entries[] = $entry;
    save_entries($entries);

    add_flash('notice', '日記を保存しました。');
    $_SESSION['clear_draft'] = true;
}

function handle_delete(): void
{
    $id = trim((string)($_POST['id'] ?? ''));
    if ($id === '') {
        add_flash('alert', '日記が見つかりませんでした。');
        return;
    }

    $entries = load_entries();
    $found = false;
    foreach ($entries as $index => $entry) {
        if (($entry['id'] ?? '') === $id) {
            unset($entries[$index]);
            $found = true;
            break;
        }
    }

    if (!$found) {
        add_flash('alert', '日記が見つかりませんでした。');
        return;
    }

    $entries = array_values($entries);
    save_entries($entries);
    add_flash('notice', '日記を削除しました。');
}

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

    return $data;
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

function add_flash(string $type, string $message): void
{
    $_SESSION['flash'][$type][] = $message;
}

function persist_form_state(array $data, array $errors): void
{
    $_SESSION['form_data'] = array_intersect_key($data, ['title' => true, 'entry_date' => true, 'body' => true]);
    $_SESSION['form_errors'] = $errors;
}

function redirect_self(): void
{
    $location = $_SERVER['REQUEST_URI'] ?? 'index.php';
    header('Location: ' . $location);
    exit;
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
    return nl2br(h($body), false);
}
?>
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>学習日記 | Akari Math Lab</title>
    <meta name="description" content="学習の気づきを記録できる学習日記。投稿パスワードを使ってサーバーに保存できます。">
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
            <li><a class="nav-link is-active" aria-current="page" href="index.php">Diary</a></li>
          </ul>
        </nav>
      </header>

      <main>
        <?php foreach ($flash as $type => $messages): ?>
          <?php foreach ($messages as $message): ?>
            <?php if (!empty($message)): ?>
              <?php $isNotice = $type === 'notice'; ?>
              <div class="flash <?php echo $isNotice ? 'flash-notice' : 'flash-alert'; ?>" role="<?php echo $isNotice ? 'status' : 'alert'; ?>">
                <?php echo h($message); ?>
              </div>
            <?php endif; ?>
          <?php endforeach; ?>
        <?php endforeach; ?>

        <section class="section">
          <div class="section-header">
            <span class="section-eyebrow">Diary</span>
            <h2>学習日記を書く</h2>
            <p>
              日々の学びや気づきを短くメモできるミニ日記です。投稿パスワードを知っているメンバーだけが
              サーバーに記録を保存でき、公開ページにも反映されます。下書きは端末のローカルストレージに
              自動保存されるので、安心して書き進められます。
            </p>
          </div>
        </section>

        <section class="section">
          <div class="split-grid diary-grid">
            <article class="profile-card diary-editor">
              <span class="section-eyebrow">Entry</span>
              <h2>今日の記録</h2>
              <p>
                タイトルと本文を入力し、「日記に追加」を押すと右側の一覧に公開されます。送信前に投稿パスワードを入力するとサーバーに保存され、閲覧者にも共有されます。
                書いている途中の内容はブラウザに自動保存されるため、ページを離れても続きから再開できます。
              </p>

              <?php if (!empty($formErrors)): ?>
                <div class="form-errors" role="alert">
                  <strong>入力内容を確認してください。</strong>
                  <ul>
                    <?php foreach ($formErrors as $error): ?>
                      <li><?php echo h($error); ?></li>
                    <?php endforeach; ?>
                  </ul>
                </div>
              <?php endif; ?>

              <form method="post" class="diary-form">
                <input type="hidden" name="action" value="create" />
                <label class="diary-label">
                  <span>タイトル</span>
                  <input type="text" name="title" class="diary-input" placeholder="タイトル" value="<?php echo h($formData['title']); ?>" />
                </label>
                <label class="diary-label">
                  <span>日付</span>
                  <input type="date" name="entry_date" class="diary-input" placeholder="日付 (YYYY-MM-DD)" value="<?php echo h($formData['entry_date']); ?>" />
                </label>
                <label class="diary-label">
                  <span>本文</span>
                  <textarea name="body" class="diary-textarea" rows="8" placeholder="今日のメモや感想を書いてください…"><?php echo h($formData['body']); ?></textarea>
                </label>
                <label class="diary-label">
                  <span>投稿パスワード</span>
                  <input type="password" name="post_password" class="diary-input" placeholder="投稿パスワード" autocomplete="off" />
                </label>
                <div class="diary-actions">
                  <button type="submit" class="btn btn-primary">日記に追加</button>
                  <button type="button" class="btn btn-outline" data-action="clear-draft">下書きをクリア</button>
                </div>
              </form>
              <div class="diary-password-callout">
                <p>投稿パスワードが必要です。パスワードは閲覧者には公開されません。</p>
              </div>
            </article>

            <aside class="profile-card diary-entries">
              <h3>保存した日記</h3>
              <?php if (!empty($entries)): ?>
                <ul class="diary-list">
                  <?php foreach ($entries as $entry): ?>
                    <li class="diary-item">
                      <div class="diary-item-header">
                        <div class="diary-item-meta">
                          <h4><?php echo h($entry['title'] ?? '') ?: '無題'; ?></h4>
                          <?php if (!empty($entry['entry_date'])): ?>
                            <time datetime="<?php echo h($entry['entry_date']); ?>"><?php echo h($entry['entry_date']); ?></time>
                          <?php endif; ?>
                        </div>
                        <form method="post" class="diary-delete-form">
                          <input type="hidden" name="action" value="delete" />
                          <input type="hidden" name="id" value="<?php echo h($entry['id'] ?? ''); ?>" />
                          <input type="password" name="post_password" class="diary-input diary-delete-password" placeholder="投稿パスワード" autocomplete="off" />
                          <button type="submit" class="diary-delete">削除</button>
                        </form>
                      </div>
                      <div class="diary-item-body">
                        <?php echo format_body($entry['body'] ?? ''); ?>
                      </div>
                    </li>
                  <?php endforeach; ?>
                </ul>
              <?php else: ?>
                <div class="diary-empty">
                  <p>まだ保存した日記はありません。</p>
                </div>
              <?php endif; ?>
            </aside>
          </div>
        </section>
      </main>

      <footer>
        <div class="footer-inner">
          <p>© <?php echo date('Y'); ?> Akari Math Lab. Crafted for Sakura Rental Server.</p>
          <div class="footer-links">
            <a href="../index.html">Home</a>
            <a href="../about/index.html">About</a>
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

        const storageKey = 'akari-math-lab-diary';
        const titleField = form.querySelector('input[name="title"]');
        const dateField = form.querySelector('input[name="entry_date"]');
        const bodyField = form.querySelector('textarea[name="body"]');
        const clearButton = form.querySelector('[data-action="clear-draft"]');

        function currentDate() {
          return new Date().toISOString().slice(0, 10);
        }

        function loadDraft() {
          try {
            const stored = localStorage.getItem(storageKey);
            if (!stored) return;
            const draft = JSON.parse(stored);
            if (draft.title && titleField) titleField.value = draft.title;
            if (draft.date && dateField) dateField.value = draft.date;
            if (draft.body && bodyField) bodyField.value = draft.body;
          } catch (error) {
            console.warn('Failed to load diary draft', error);
          }
        }

        function persistDraft() {
          if (!titleField || !dateField || !bodyField) return;
          const draft = {
            title: titleField.value || '',
            date: dateField.value || '',
            body: bodyField.value || ''
          };

          const allBlank = !draft.title.trim() && !draft.date.trim() && !draft.body.trim();
          if (allBlank) {
            localStorage.removeItem(storageKey);
            return;
          }

          localStorage.setItem(storageKey, JSON.stringify(draft));
        }

        function clearDraft() {
          if (titleField) titleField.value = '';
          if (bodyField) bodyField.value = '';
          if (dateField) dateField.value = currentDate();
          localStorage.removeItem(storageKey);
        }

        if (dateField && !dateField.value) {
          dateField.value = currentDate();
        }

        loadDraft();

        [titleField, dateField, bodyField].forEach(function(field) {
          if (field) {
            field.addEventListener('input', persistDraft);
          }
        });

        if (clearButton) {
          clearButton.addEventListener('click', function(event) {
            event.preventDefault();
            clearDraft();
          });
        }

        if (document.body.dataset.clearDraft === 'true') {
          clearDraft();
        }
      });
    </script>
  </body>
</html>
