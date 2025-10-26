<?php
declare(strict_types=1);

session_start();

const DEFAULT_DIARY_PASSWORD = '@Koutya0akari';
const DATA_DIR = __DIR__ . '/../data';
const DATA_FILE = DATA_DIR . '/diary_entries.json';
const SORT_OPTIONS = ['newest', 'oldest', 'title'];
const SORT_LABELS = [
    'newest' => '新しい順',
    'oldest' => '古い順',
    'title' => 'タイトル順'
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    handle_post();
}

$flash = $_SESSION['flash'] ?? ['notice' => [], 'alert' => []];
$formData = $_SESSION['form_data'] ?? [];
$formErrors = $_SESSION['form_errors'] ?? [];
$shouldClearDraft = $_SESSION['clear_draft'] ?? false;

unset($_SESSION['flash'], $_SESSION['form_data'], $_SESSION['form_errors'], $_SESSION['clear_draft']);

$query = trim((string)($_GET['q'] ?? ''));
$sort = (string)($_GET['sort'] ?? 'newest');
if (!in_array($sort, SORT_OPTIONS, true)) {
    $sort = 'newest';
}

$sessionEditingId = $_SESSION['editing_id'] ?? '';
unset($_SESSION['editing_id']);

$entries = load_entries();
$allCategories = collect_categories($entries);

$categoryFilter = trim((string)($_GET['category'] ?? ''));
$tagFilter = trim((string)($_GET['tag'] ?? ''));

$editingId = trim((string)($_GET['edit'] ?? ''));
if ($editingId === '' && !empty($formData['entry_id'])) {
    $editingId = (string)$formData['entry_id'];
}
if ($editingId === '' && $sessionEditingId !== '') {
    $editingId = (string)$sessionEditingId;
}

$editingEntry = null;
if ($editingId !== '') {
    foreach ($entries as $entry) {
        if (($entry['id'] ?? '') === $editingId) {
            $editingEntry = $entry;
            break;
        }
    }

    if ($editingEntry === null) {
        $editingId = '';
    }
}

$displayEntries = sort_entries(
    filter_entries($entries, $query, $categoryFilter, $tagFilter),
    $sort
);
$defaultDate = date('Y-m-d');
$formData = array_merge(
    [
        'title' => '',
        'entry_date' => $defaultDate,
        'body' => '',
        'tags' => '',
        'category' => '',
        'entry_id' => ''
    ],
    array_intersect_key($formData, ['title' => true, 'entry_date' => true, 'body' => true, 'tags' => true, 'category' => true, 'entry_id' => true])
);

if ($editingEntry !== null) {
    if (empty($formErrors) || ($formData['entry_id'] ?? '') !== $editingId) {
        $formData['title'] = (string)($editingEntry['title'] ?? '');
        $formData['entry_date'] = (string)($editingEntry['entry_date'] ?? $defaultDate);
        $formData['body'] = (string)($editingEntry['body'] ?? '');
        $formData['tags'] = implode(', ', $editingEntry['tags'] ?? []);
        $formData['category'] = (string)($editingEntry['category'] ?? '');
    }
    $formData['entry_id'] = $editingId;
} else {
    $formData['entry_id'] = '';
}

$baseQueryParams = [];
if ($query !== '') {
    $baseQueryParams['q'] = $query;
}
if ($categoryFilter !== '') {
    $baseQueryParams['category'] = $categoryFilter;
}
if ($sort !== 'newest') {
    $baseQueryParams['sort'] = $sort;
}
if ($tagFilter !== '') {
    $baseQueryParams['tag'] = $tagFilter;
}

function handle_post(): void
{
    $action = $_POST['action'] ?? '';
    $password = (string)($_POST['post_password'] ?? '');

    if (!hash_equals(diary_password(), $password)) {
        add_flash('alert', '投稿パスワードが正しくありません。');
        persist_form_state($_POST, []);
        $params = base_redirect_params();
        if ($action === 'update') {
            $editId = trim((string)($_POST['entry_id'] ?? ''));
            if ($editId !== '') {
                $params['edit'] = $editId;
                $_SESSION['editing_id'] = $editId;
            }
        }
        redirect_to($params);
    }

    if ($action === 'create') {
        handle_create();
    } elseif ($action === 'update') {
        handle_update();
    } elseif ($action === 'delete') {
        handle_delete();
    } else {
        redirect_to(base_redirect_params());
    }
}

function handle_create(): void
{
    $title = trim((string)($_POST['title'] ?? ''));
    $entryDate = trim((string)($_POST['entry_date'] ?? ''));
    $body = trim((string)($_POST['body'] ?? ''));
    $categoryInput = (string)($_POST['category'] ?? '');
    $category = sanitize_category($categoryInput);
    $tagsInput = (string)($_POST['tags'] ?? '');
    $tags = parse_tags($tagsInput);

    if ($entryDate === '' || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $entryDate)) {
        $entryDate = date('Y-m-d');
    }

    $errors = [];
    if ($body === '') {
        $errors[] = '本文を入力してください。';
    }

    if (!empty($errors)) {
        persist_form_state(
            [
                'title' => $title,
                'entry_date' => $entryDate,
                'body' => $body,
                'tags' => $tagsInput,
                'category' => $categoryInput
            ],
            $errors
        );
        redirect_to(base_redirect_params());
    }

    $entry = [
        'id' => generate_id(),
        'title' => $title,
        'entry_date' => $entryDate,
        'body' => $body,
        'category' => $category,
        'tags' => $tags,
        'created_at' => date('c'),
        'updated_at' => date('c')
    ];

    $entries = load_entries();
    $entries[] = $entry;
    save_entries($entries);

    add_flash('notice', '日記を保存しました。');
    $_SESSION['clear_draft'] = true;
    redirect_to(base_redirect_params());
}

function handle_update(): void
{
    $id = trim((string)($_POST['entry_id'] ?? ''));
    if ($id === '') {
        add_flash('alert', '日記が見つかりませんでした。');
        redirect_to(base_redirect_params());
    }

    $entries = load_entries();
    $index = null;
    foreach ($entries as $i => $entry) {
        if (($entry['id'] ?? '') === $id) {
            $index = $i;
            break;
        }
    }

    if ($index === null) {
        add_flash('alert', '日記が見つかりませんでした。');
        redirect_to(base_redirect_params());
    }

    $title = trim((string)($_POST['title'] ?? ''));
    $entryDate = trim((string)($_POST['entry_date'] ?? ''));
    $body = trim((string)($_POST['body'] ?? ''));
    $categoryInput = (string)($_POST['category'] ?? '');
    $category = sanitize_category($categoryInput);
    $tagsInput = (string)($_POST['tags'] ?? '');
    $tags = parse_tags($tagsInput);

    if ($entryDate === '' || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $entryDate)) {
        $entryDate = date('Y-m-d');
    }

    $errors = [];
    if ($body === '') {
        $errors[] = '本文を入力してください。';
    }

    if (!empty($errors)) {
        persist_form_state(
            [
                'title' => $title,
                'entry_date' => $entryDate,
                'body' => $body,
                'tags' => $tagsInput,
                'category' => $categoryInput,
                'entry_id' => $id
            ],
            $errors
        );
        $_SESSION['editing_id'] = $id;
        $params = base_redirect_params();
        $params['edit'] = $id;
        redirect_to($params);
    }

    $entries[$index]['title'] = $title;
    $entries[$index]['entry_date'] = $entryDate;
    $entries[$index]['body'] = $body;
    $entries[$index]['category'] = $category;
    $entries[$index]['tags'] = $tags;
    $entries[$index]['updated_at'] = date('c');

    save_entries($entries);

    add_flash('notice', '日記を更新しました。');
    $_SESSION['clear_draft'] = true;
    redirect_to(base_redirect_params());
}

function handle_delete(): void
{
    $id = trim((string)($_POST['id'] ?? ''));
    if ($id === '') {
        add_flash('alert', '日記が見つかりませんでした。');
        redirect_to(base_redirect_params());
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
        redirect_to(base_redirect_params());
    }

    $entries = array_values($entries);
    save_entries($entries);
    add_flash('notice', '日記を削除しました。');
    redirect_to(base_redirect_params());
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
            implode(' ', sanitize_tags($entry['tags'] ?? []))
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

function add_flash(string $type, string $message): void
{
    $_SESSION['flash'][$type][] = $message;
}

function persist_form_state(array $data, array $errors): void
{
    $_SESSION['form_data'] = array_intersect_key($data, ['title' => true, 'entry_date' => true, 'body' => true, 'tags' => true, 'entry_id' => true]);
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

    return $params;
}

function redirect_to(array $params = []): void
{
    $query = http_build_query($params);
    $location = 'index.php' . ($query !== '' ? '?' . $query : '');
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
        $filtered[$key] = $value;
    }

    if (empty($filtered)) {
        return '';
    }

    return '?' . http_build_query($filtered);
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

              <?php if ($editingEntry !== null): ?>
                <div class="diary-editing-banner">
                  <div>
                    <strong>編集中:</strong> <?php echo h($editingEntry['title'] ?? '無題'); ?>
                  </div>
                  <a class="diary-edit-cancel" href="index.php<?php echo build_query_string($baseQueryParams); ?>">編集をやめる</a>
                </div>
              <?php endif; ?>

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

              <form method="post" class="diary-form" data-editing="<?php echo $editingEntry ? 'true' : 'false'; ?>">
                <input type="hidden" name="action" value="<?php echo $editingEntry ? 'update' : 'create'; ?>" />
                <input type="hidden" name="redirect_q" value="<?php echo h($query); ?>" />
                <input type="hidden" name="redirect_sort" value="<?php echo h($sort); ?>" />
                <input type="hidden" name="redirect_category" value="<?php echo h($categoryFilter); ?>" />
                <input type="hidden" name="redirect_tag" value="<?php echo h($tagFilter); ?>" />
                <?php if (!empty($formData['entry_id'])): ?>
                  <input type="hidden" name="entry_id" value="<?php echo h($formData['entry_id']); ?>" />
                <?php endif; ?>
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
                  <span>フォルダー</span>
                  <input type="text" name="category" class="diary-input" list="diary-categories" placeholder="例: 研究メモ" value="<?php echo h($formData['category']); ?>" />
                </label>
                <datalist id="diary-categories">
                  <?php foreach ($allCategories as $categoryName): ?>
                    <option value="<?php echo h($categoryName); ?>"></option>
                  <?php endforeach; ?>
                </datalist>
                <label class="diary-label">
                  <span>タグ (カンマ区切り)</span>
                  <input type="text" name="tags" class="diary-input" placeholder="例: 代数幾何, ゼミ" value="<?php echo h($formData['tags']); ?>" />
                </label>
                <label class="diary-label">
                  <span>投稿パスワード</span>
                  <input type="password" name="post_password" class="diary-input" placeholder="投稿パスワード" autocomplete="off" />
                </label>
                <div class="diary-actions">
                  <button type="submit" class="btn btn-primary"><?php echo $editingEntry ? '日記を更新' : '日記に追加'; ?></button>
                  <button type="button" class="btn btn-outline" data-action="clear-draft">下書きをクリア</button>
                </div>
              </form>
              <div class="diary-password-callout">
                <p>投稿パスワードが必要です。パスワードは閲覧者には公開されません。</p>
              </div>
            </article>

            <aside class="profile-card diary-entries">
              <h3>保存した日記</h3>
              <form method="get" class="diary-filter-form">
                <input type="search" name="q" class="diary-input diary-filter-search" placeholder="キーワードで検索" value="<?php echo h($query); ?>" />
                <select name="category" class="diary-input diary-select">
                  <option value="">すべてのフォルダー</option>
                  <?php foreach ($allCategories as $categoryName): ?>
                    <option value="<?php echo h($categoryName); ?>" <?php if ($categoryFilter !== '' && normalize_text($categoryFilter) === normalize_text($categoryName)) { echo 'selected'; } ?>><?php echo h($categoryName); ?></option>
                  <?php endforeach; ?>
                </select>
                <select name="sort" class="diary-input diary-select">
                  <?php foreach (SORT_LABELS as $key => $label): ?>
                    <option value="<?php echo h($key); ?>" <?php if ($sort === $key) { echo 'selected'; } ?>><?php echo h($label); ?></option>
                  <?php endforeach; ?>
                </select>
                <input type="hidden" name="tag" value="<?php echo h($tagFilter); ?>" />
                <div class="diary-filter-actions">
                  <button type="submit" class="btn btn-outline">絞り込む</button>
                  <a href="index.php" class="btn btn-outline">リセット</a>
                </div>
              </form>
              <?php if (!empty($allCategories)): ?>
                <div class="diary-category-buttons">
                  <?php $allCategoryParams = $baseQueryParams; unset($allCategoryParams['category']); ?>
                  <a class="diary-category-button<?php if ($categoryFilter === '') { echo ' is-active'; } ?>" href="index.php<?php echo build_query_string($allCategoryParams); ?>">フォルダー: すべて</a>
                  <?php foreach ($allCategories as $categoryName): ?>
                    <?php $categoryLinkParams = array_merge($baseQueryParams, ['category' => $categoryName]); ?>
                    <a class="diary-category-button<?php if ($categoryFilter !== '' && normalize_text($categoryFilter) === normalize_text($categoryName)) { echo ' is-active'; } ?>" href="index.php<?php echo build_query_string($categoryLinkParams); ?>"><?php echo h($categoryName); ?></a>
                  <?php endforeach; ?>
                </div>
              <?php endif; ?>
              <?php if ($tagFilter !== ''): ?>
                <?php $clearTagParams = $baseQueryParams; unset($clearTagParams['tag']); ?>
                <div class="diary-tag-filter">
                  <span class="diary-tag-filter-label">タグで絞り込み中: <strong>#<?php echo h($tagFilter); ?></strong></span>
                  <a class="diary-tag-filter-clear" href="index.php<?php echo build_query_string($clearTagParams); ?>">タグを解除</a>
                </div>
              <?php endif; ?>
              <?php $resultCount = count($displayEntries); ?>
              <p class="diary-filter-result">
                表示件数: <?php echo $resultCount; ?> 件
                <?php if ($query !== '' || $sort !== 'newest' || $categoryFilter !== '' || $tagFilter !== ''): ?>
                  （
                    <?php
                      $filterParts = [];
                      if ($query !== '') {
                          $filterParts[] = '検索: "' . h($query) . '"';
                      }
                      if ($categoryFilter !== '') {
                          $filterParts[] = 'フォルダー: ' . h($categoryFilter);
                      }
                      if ($tagFilter !== '') {
                          $filterParts[] = 'タグ: #' . h($tagFilter);
                      }
                      if ($sort !== 'newest') {
                          $filterParts[] = '並び替え: ' . h(SORT_LABELS[$sort] ?? '');
                      }
                      echo implode('、', $filterParts);
                    ?>）
                <?php endif; ?>
              </p>
              <?php if ($resultCount > 0): ?>
                <ul class="diary-list">
                  <?php foreach ($displayEntries as $entry): ?>
                    <li class="diary-item">
                      <div class="diary-item-header">
                        <div class="diary-item-meta">
                          <h4><?php echo h($entry['title'] ?? '') ?: '無題'; ?></h4>
                          <?php if (!empty($entry['entry_date'])): ?>
                            <time datetime="<?php echo h($entry['entry_date']); ?>"><?php echo h($entry['entry_date']); ?></time>
                          <?php endif; ?>
                          <?php if (!empty($entry['category'])): ?>
                            <?php
                              $entryCategory = sanitize_category($entry['category']);
                              $categoryLinkParams = array_merge($baseQueryParams, ['category' => $entryCategory]);
                              $isActiveCategory = $categoryFilter !== '' && normalize_text($categoryFilter) === normalize_text($entryCategory);
                            ?>
                            <a class="diary-item-category<?php if ($isActiveCategory) { echo ' is-active'; } ?>" href="index.php<?php echo build_query_string($categoryLinkParams); ?>">
                              <span class="diary-item-category-label">フォルダー</span>
                              <?php echo h($entryCategory); ?>
                            </a>
                          <?php endif; ?>
                          <?php if (!empty($entry['tags'])): ?>
                            <ul class="diary-tag-list">
                              <?php foreach ($entry['tags'] as $tag): ?>
                                <?php
                                  $tagLinkParams = $baseQueryParams;
                                  unset($tagLinkParams['q']);
                                  $tagLinkParams['tag'] = $tag;
                                  $isActiveTag = $tagFilter !== '' && normalize_text($tagFilter) === normalize_text($tag);
                                ?>
                                <li>
                                  <a class="diary-tag<?php if ($isActiveTag) { echo ' is-active'; } ?>" href="index.php<?php echo build_query_string($tagLinkParams); ?>">#<?php echo h($tag); ?></a>
                                </li>
                              <?php endforeach; ?>
                            </ul>
                          <?php endif; ?>
                        </div>
                        <div class="diary-item-actions">
                          <?php $entryId = (string)($entry['id'] ?? ''); ?>
                          <a class="diary-edit-link<?php if ($editingId !== '' && $editingId === $entryId) { echo ' is-active'; } ?>" href="index.php<?php echo build_query_string(array_merge($baseQueryParams, ['edit' => $entryId])); ?>">編集</a>
                          <form method="post" class="diary-delete-form">
                            <input type="hidden" name="action" value="delete" />
                            <input type="hidden" name="id" value="<?php echo h($entryId); ?>" />
                            <input type="hidden" name="redirect_q" value="<?php echo h($query); ?>" />
                            <input type="hidden" name="redirect_sort" value="<?php echo h($sort); ?>" />
                            <input type="password" name="post_password" class="diary-input diary-delete-password" placeholder="投稿パスワード" autocomplete="off" />
                            <button type="submit" class="diary-delete">削除</button>
                          </form>
                        </div>
                      </div>
                      <div class="diary-item-body">
                        <?php echo format_body($entry['body'] ?? ''); ?>
                      </div>
                    </li>
                  <?php endforeach; ?>
                </ul>
              <?php else: ?>
                <div class="diary-empty">
                  <?php if (!empty($entries)): ?>
                    <p>検索条件に一致する日記はありません。</p>
                  <?php else: ?>
                    <p>まだ保存した日記はありません。</p>
                  <?php endif; ?>
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
        const isEditing = form.dataset.editing === 'true';
        const titleField = form.querySelector('input[name="title"]');
        const dateField = form.querySelector('input[name="entry_date"]');
        const bodyField = form.querySelector('textarea[name="body"]');
        const tagsField = form.querySelector('input[name="tags"]');
        const categoryField = form.querySelector('input[name="category"]');
        const clearButton = form.querySelector('[data-action="clear-draft"]');

        function currentDate() {
          return new Date().toISOString().slice(0, 10);
        }

        function loadDraft() {
          if (isEditing) return;
          try {
            const stored = localStorage.getItem(storageKey);
            if (!stored) return;
            const draft = JSON.parse(stored);
            if (draft.title && titleField) titleField.value = draft.title;
            if (draft.date && dateField) dateField.value = draft.date;
            if (draft.body && bodyField) bodyField.value = draft.body;
            if (draft.tags && tagsField) tagsField.value = draft.tags;
            if (draft.category && categoryField) categoryField.value = draft.category;
          } catch (error) {
            console.warn('Failed to load diary draft', error);
          }
        }

        function persistDraft() {
          if (isEditing) return;
          if (!titleField || !dateField || !bodyField) return;
          const draft = {
            title: titleField.value || '',
            date: dateField.value || '',
            body: bodyField.value || '',
            tags: tagsField ? tagsField.value || '' : '',
            category: categoryField ? categoryField.value || '' : ''
          };

          const allBlank =
            !draft.title.trim() &&
            !draft.date.trim() &&
            !draft.body.trim() &&
            !draft.tags.trim() &&
            !draft.category.trim();
          if (allBlank) {
            localStorage.removeItem(storageKey);
            return;
          }

          localStorage.setItem(storageKey, JSON.stringify(draft));
        }

        function clearDraft() {
          if (titleField) titleField.value = '';
          if (bodyField) bodyField.value = '';
          if (tagsField) tagsField.value = '';
          if (categoryField && !isEditing) categoryField.value = '';
          if (dateField) dateField.value = currentDate();
          localStorage.removeItem(storageKey);
        }

        if (dateField && !dateField.value) {
          dateField.value = currentDate();
        }

        if (!isEditing) {
          loadDraft();
        }

        [titleField, dateField, bodyField, tagsField, categoryField].forEach(function(field) {
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
