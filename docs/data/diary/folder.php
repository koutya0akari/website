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
$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? '';
$scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
$scriptDir = rtrim(dirname($scriptName), '/\\');
if ($scriptDir === '.' || $scriptDir === '/' || $scriptDir === '\\') {
    $scriptDir = '';
}
$baseUrl = $host !== '' ? $scheme . '://' . $host . $scriptDir : 'https://example.com/diary';
$baseUrl = rtrim($baseUrl, '/');
$canonicalUrl = $baseUrl . '/folder.php?name=' . rawurlencode($folderName);
$pageParam = (int)($_GET['page'] ?? 1);
$currentPage = 1;
$totalPages = 1;
$totalEntries = 0;

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
    $filteredEntries = filter_entries($entries, $query, $matchedCategory, $tagFilter);
    $sortedEntries = sort_entries($filteredEntries, $sort);
    $pagination = paginate_entries($sortedEntries, $pageParam);
    $displayEntries = $pagination['items'];
    $currentPage = $pagination['page'];
    $totalPages = $pagination['total_pages'];
    $totalEntries = $pagination['total_items'];
}

function folder_query(array $params): string
{
    $filtered = [];
    foreach ($params as $key => $value) {
        if ($value === '' || $value === null) {
            continue;
        }
        if ($key === 'q') {
            $value = trim((string)$value);
            if ($value === '') {
                continue;
            }
        }
        if ($key === 'sort') {
            if (!in_array($value, SORT_OPTIONS, true) || $value === 'newest') {
                continue;
            }
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
?>
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>フォルダー: <?php echo h($matchedCategory); ?> | Akari Math Lab</title>
    <meta name="description" content="学習日記フォルダー「<?php echo h($matchedCategory); ?>」の投稿一覧。">
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
            <?php
              $pageItemCount = count($displayEntries);
              $extraParts = [];
              if ($totalPages > 1) {
                  $extraParts[] = 'ページ ' . h((string)$currentPage) . ' / ' . h((string)$totalPages) . '（このページ ' . h((string)$pageItemCount) . ' 件）';
              }
              if ($query !== '' || $sort !== 'newest' || $tagFilter !== '') {
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
                  if (!empty($filterParts)) {
                      $extraParts[] = '条件: ' . implode('、', $filterParts);
                  }
              }
            ?>
            <p class="diary-filter-result">
              表示件数: <?php echo $totalEntries; ?> 件<?php if (!empty($extraParts)) { echo '（' . implode('／', $extraParts) . '）'; } ?>
            </p>

            <?php if ($pageItemCount > 0): ?>
              <ul class="diary-list">
                <?php foreach ($displayEntries as $entry): ?>
                  <?php
                    $entryId = (string)($entry['id'] ?? '');
                    if ($entryId === '') {
                        continue;
                    }
                    $entryTitle = (string)($entry['title'] ?? '');
                  ?>
                  <li class="diary-item">
                    <div class="diary-item-header">
                      <div class="diary-item-meta">
                        <h4>
                          <a class="diary-item-title-link" href="show.php?id=<?php echo h($entryId); ?>">
                            <?php echo $entryTitle !== '' ? h($entryTitle) : '無題'; ?>
                          </a>
                        </h4>
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
                    <div class="diary-item-footer">
                      <a class="diary-read-more" href="show.php?id=<?php echo h($entryId); ?>">続きを読む</a>
                    </div>
                  </li>
                <?php endforeach; ?>
              </ul>
              <?php if ($totalPages > 1): ?>
                <?php
                  $paginationBaseParams = [
                      'name' => $matchedCategory,
                      'q' => $query,
                      'sort' => $sort,
                      'tag' => $tagFilter
                  ];
                  $hasPrev = $currentPage > 1;
                  $hasNext = $currentPage < $totalPages;
                  $prevPage = max(1, $currentPage - 1);
                  $nextPage = min($totalPages, $currentPage + 1);
                  $windowStart = max(1, $currentPage - 2);
                  $windowEnd = min($totalPages, $currentPage + 2);
                ?>
                <nav class="diary-pagination" aria-label="フォルダーのページ送り">
                  <ul class="diary-pagination-list">
                    <li>
                      <?php if ($hasPrev): ?>
                        <a class="diary-page-button" href="folder.php<?php echo folder_query(array_merge($paginationBaseParams, ['page' => $prevPage])); ?>">前へ</a>
                      <?php else: ?>
                        <span class="diary-page-button is-disabled" aria-disabled="true">前へ</span>
                      <?php endif; ?>
                    </li>
                    <?php for ($pageNumber = $windowStart; $pageNumber <= $windowEnd; $pageNumber++): ?>
                      <li>
                        <?php if ($pageNumber === $currentPage): ?>
                          <span class="diary-page-number is-active" aria-current="page"><?php echo $pageNumber; ?></span>
                        <?php else: ?>
                          <a class="diary-page-number" href="folder.php<?php echo folder_query(array_merge($paginationBaseParams, ['page' => $pageNumber])); ?>"><?php echo $pageNumber; ?></a>
                        <?php endif; ?>
                      </li>
                    <?php endfor; ?>
                    <li>
                      <?php if ($hasNext): ?>
                        <a class="diary-page-button" href="folder.php<?php echo folder_query(array_merge($paginationBaseParams, ['page' => $nextPage])); ?>">次へ</a>
                      <?php else: ?>
                        <span class="diary-page-button is-disabled" aria-disabled="true">次へ</span>
                      <?php endif; ?>
                    </li>
                  </ul>
                </nav>
              <?php endif; ?>
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
