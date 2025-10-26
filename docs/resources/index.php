<?php
declare(strict_types=1);

$filesDir = __DIR__ . '/files';
$baseUrl = 'files';

if (!is_dir($filesDir)) {
    mkdir($filesDir, 0755, true);
}

$items = [];
$handle = opendir($filesDir);
if ($handle !== false) {
    while (($entry = readdir($handle)) !== false) {
        if ($entry === '.' || $entry === '..') {
            continue;
        }
        $path = $filesDir . '/' . $entry;
        if (is_file($path) && preg_match('/\\.pdf$/i', $entry)) {
            $items[] = [
                'name' => $entry,
                'size' => filesize($path),
                'mtime' => filemtime($path),
                'description' => load_description($filesDir, $entry)
            ];
        }
    }
    closedir($handle);
}

usort($items, static function ($a, $b) {
    return $b['mtime'] <=> $a['mtime'];
});

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

function load_description(string $dir, string $filename): string
{
    $base = pathinfo($filename, PATHINFO_FILENAME);
    foreach (['txt', 'md'] as $ext) {
        $candidate = $dir . '/' . $base . '.' . $ext;
        if (is_file($candidate)) {
            $content = trim(file_get_contents($candidate));
            if ($content !== '') {
                return $content;
            }
        }
    }

    return '';
}

function format_description(string $text): string
{
    return nl2br(htmlspecialchars($text, ENT_QUOTES, 'UTF-8'), false);
}
?>
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Resources | Akari Math Lab</title>
    <meta name="description" content="制作した PDF や資料を公開するページです。">
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
        <section class="section">
          <div class="section-header">
            <span class="section-eyebrow">Resources</span>
            <h2>公開資料</h2>
            <p>ゼミ資料や制作した PDF をダウンロードできます。新しいファイルは <code>docs/resources/files/</code> に追加してください。</p>
          </div>
        </section>

        <section class="section">
          <article class="profile-card">
            <h3>ファイル一覧</h3>
            <?php if (!empty($items)): ?>
              <ul class="resource-list">
                <?php foreach ($items as $item): ?>
                  <li class="resource-item">
                    <div class="resource-meta">
                      <strong><?php echo htmlspecialchars($item['name'], ENT_QUOTES, 'UTF-8'); ?></strong>
                      <span><?php echo human_filesize($item['size']); ?></span>
                      <time datetime="<?php echo date('c', $item['mtime']); ?>"><?php echo date('Y-m-d', $item['mtime']); ?></time>
                      <?php if (!empty($item['description'])): ?>
                        <p class="resource-description"><?php echo format_description($item['description']); ?></p>
                      <?php endif; ?>
                    </div>
                    <a class="btn resource-download" href="<?php echo htmlspecialchars($baseUrl . '/' . rawurlencode($item['name']), ENT_QUOTES, 'UTF-8'); ?>" download>ダウンロード</a>
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
  </body>
</html>
