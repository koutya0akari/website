<?php
declare(strict_types=1);

header('Content-Type: application/xml; charset=UTF-8');

require_once __DIR__ . '/diary/lib.php';

$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'akari0koutya.jp';
$basePath = rtrim(dirname($_SERVER['SCRIPT_NAME'] ?? ''), '/\\');
if ($basePath === '.' || $basePath === '/' || $basePath === '\\') {
    $basePath = '';
}
$baseUrl = rtrim($scheme . '://' . $host . $basePath, '/');

$staticUrls = [
    [
        'loc' => $baseUrl . '/',
        'changefreq' => 'weekly',
        'priority' => '1.0',
    ],
    [
        'loc' => $baseUrl . '/about/',
        'changefreq' => 'monthly',
        'priority' => '0.7',
    ],
    [
        'loc' => $baseUrl . '/diary/',
        'changefreq' => 'daily',
        'priority' => '0.9',
    ],
    [
        'loc' => $baseUrl . '/resources/',
        'changefreq' => 'weekly',
        'priority' => '0.6',
    ],
    [
        'loc' => $baseUrl . '/googlec1264d9f07ec30d1.html',
        'changefreq' => 'yearly',
        'priority' => '0.1',
    ],
];

$entryUrls = [];
$folderUrls = [];
try {
    $entries = load_entries();
    foreach ($entries as $entry) {
        $id = trim((string)($entry['id'] ?? ''));
        if ($id === '') {
            continue;
        }
        $entryUrls[] = [
            'loc' => $baseUrl . '/diary/show.php?id=' . rawurlencode($id),
            'changefreq' => 'weekly',
            'priority' => '0.6',
        ];
    }

    $categories = collect_categories($entries);
    foreach ($categories as $category) {
        $query = http_build_query(['name' => $category], '', '&', PHP_QUERY_RFC3986);
        $folderUrls[] = [
            'loc' => $baseUrl . '/diary/folder.php' . ($query !== '' ? '?' . $query : ''),
            'changefreq' => 'weekly',
            'priority' => '0.5',
        ];
    }
} catch (Throwable $e) {
    $entryUrls = [];
    $folderUrls = [];
}

$resourceUrls = [];
$resourceDir = __DIR__ . '/resources/files';
if (is_dir($resourceDir)) {
    $files = scandir($resourceDir);
    if ($files !== false) {
        foreach ($files as $file) {
            if ($file === '.' || $file === '..') {
                continue;
            }
            $path = $resourceDir . '/' . $file;
            if (!is_file($path)) {
                continue;
            }
            $encodedFile = implode('/', array_map('rawurlencode', explode('/', $file)));
            $resourceUrls[] = [
                'loc' => $baseUrl . '/resources/files/' . $encodedFile,
                'changefreq' => 'monthly',
                'priority' => '0.4',
            ];
        }
    }
}

$urls = array_merge($staticUrls, $entryUrls, $folderUrls, $resourceUrls);

echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
foreach ($urls as $url) {
    $loc = htmlspecialchars($url['loc'], ENT_QUOTES, 'UTF-8');
    $changefreq = htmlspecialchars($url['changefreq'], ENT_QUOTES, 'UTF-8');
    $priority = htmlspecialchars($url['priority'], ENT_QUOTES, 'UTF-8');
    echo "  <url>\n";
    echo "    <loc>{$loc}</loc>\n";
    echo "    <changefreq>{$changefreq}</changefreq>\n";
    echo "    <priority>{$priority}</priority>\n";
    echo "  </url>\n";
}
echo "</urlset>\n";
