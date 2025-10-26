<?php
declare(strict_types=1);

session_start();

require_once __DIR__ . '/lib.php';

$folderName = sanitize_category($_GET['name'] ?? '');
if ($folderName === '') {
    header('Location: index.php');
    exit;
}

$query = trim((string)($_GET['q'] ?? ''));
$sort = (string)($_GET['sort'] ?? 'newest');
if (!in_array($sort, SORT_OPTIONS, true)) {
    $sort = 'newest';
}

$tagFilter = trim((string)($_GET['tag'] ?? ''));

$entries = load_entries();
$allCategories = collect_categories($entries);

$matchedCategory = null;
foreach ($allCategories as $candidate) {
    if (normalize_text($candidate) === normalize_text($folderName)) {
        $matchedCategory = $candidate;
        break;
    }
}

if ($matchedCategory === null) {
    $matchedCategory = $folderName;
    $displayEntries = [];
} else {
    $displayEntries = sort_entries(
        filter_entries($entries, $query, $matchedCategory, $tagFilter),
        $sort
    );
}

function folder_query(array $params): string
{
    $filtered = [];
    foreach ($params as $key => $value) {
        if ($value === '' || $value === null) {
            continue;
        }
        $filtered[$key] = $value;
    }

    if (empty($filtered)) {
        return '';
    }

    return '?' . http_build_query($filtered);
}
?>
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>フォルダー: <?php echo h($matchedCategory); ?> | Akari Math Lab</title>
    <meta name="description" content="学習日記フォルダー「<?php echo h($matchedCategory); ?>」の投稿一覧。">
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Signika+Negative:wght@600&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="../assets/application.css" />
    <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js" defer></script>
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
            <li><a class="nav-link" href="../resources/index.php">Resources</a></li>
            <li><a class="nav-link is-active" aria-current="page" href="index.php">Diary</a></li>
          </ul>
        </nav>
      </header>

      <main>
        <section class="section">
          <div class="section-header">
            <span class="section-eyebrow">Diary Folder</span>
            <h2><?php echo h($matchedCategory); ?></h2>
            <p>このフォルダーに保存された日記の一覧です。検索やタグでさらに絞り込めます。</p>
            <p><a href="index.php">← Diary に戻る</a></p>
          </div>
        </section>

        <section class="section">
          <article class="profile-card diary-entries">
            <h3>投稿一覧</h3>
            <form method="get" class="diary-filter-form">
              <input type="hidden" name="name" value="<?php echo h($matchedCategory); ?>" />
              <input type="search" name="q" class="diary-input diary-filter-search" placeholder="キーワードで検索" value="<?php echo h($query); ?>" />
              <select name="sort" class="diary-input diary-select">
                <?php foreach (SORT_LABELS as $key => $label): ?>
                  <option value="<?php echo h($key); ?>" <?php if ($sort === $key) { echo 'selected'; } ?>><?php echo h($label); ?></option>
                <?php endforeach; ?>
              </select>
              <input type="hidden" name="tag" value="<?php echo h($tagFilter); ?>" />
              <div class="diary-filter-actions">
                <button type="submit" class="btn btn-outline">絞り込む</button>
                <a href="folder.php<?php echo folder_query(['name' => $matchedCategory]); ?>" class="btn btn-outline">リセット</a>
              </div>
            </form>

            <?php if ($tagFilter !== ''): ?>
              <div class="diary-tag-filter">
                <span class="diary-tag-filter-label">タグで絞り込み中: <strong>#<?php echo h($tagFilter); ?></strong></span>
                <a class="diary-tag-filter-clear" href="folder.php<?php echo folder_query(['name' => $matchedCategory, 'q' => $query, 'sort' => $sort]); ?>">タグを解除</a>
              </div>
            <?php endif; ?>

            <?php $resultCount = count($displayEntries); ?>
            <p class="diary-filter-result">
              表示件数: <?php echo $resultCount; ?> 件
              <?php if ($query !== '' || $sort !== 'newest' || $tagFilter !== ''): ?>
                （
                  <?php
                    $filterParts = [];
                    if ($query !== '') {
                        $filterParts[] = '検索: "' . h($query) . '"';
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
                        <?php if (!empty($entry['tags'])): ?>
                          <ul class="diary-tag-list">
                            <?php foreach ($entry['tags'] as $tag): ?>
                              <?php
                                $isActiveTag = $tagFilter !== '' && normalize_text($tagFilter) === normalize_text($tag);
                                $tagLink = folder_query([
                                    'name' => $matchedCategory,
                                    'tag' => $tag,
                                    'q' => $query,
                                    'sort' => $sort
                                ]);
                              ?>
                              <li>
                                <a class="diary-tag<?php if ($isActiveTag) { echo ' is-active'; } ?>" href="folder.php<?php echo $tagLink; ?>">#<?php echo h($tag); ?></a>
                              </li>
                            <?php endforeach; ?>
                          </ul>
                        <?php endif; ?>
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
                <p>このフォルダーにはまだ日記がありません。</p>
              </div>
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
            <a href="index.php">Diary</a>
            <a href="../resources/index.php">Resources</a>
            <a href="../index.html#contact">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  </body>
</html>
