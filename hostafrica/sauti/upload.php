<?php
declare(strict_types=1);
require dirname(__DIR__, 2) . '/sauti-storage-config.php';
header('Access-Control-Allow-Origin: https://sauti-peach.vercel.app');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

function fail_request(int $status, string $message): never { http_response_code($status); header('Content-Type: application/json'); echo json_encode(['error' => $message]); exit; }
function decode_token(string $token): array {
  $parts = explode('.', $token, 2);
  if (count($parts) !== 2) fail_request(401, 'Invalid token.');
  $expected = rtrim(strtr(base64_encode(hash_hmac('sha256', $parts[0], SAUTI_STORAGE_SECRET, true)), '+/', '-_'), '=');
  if (!hash_equals($expected, $parts[1])) fail_request(401, 'Invalid signature.');
  $payload = json_decode(base64_decode(strtr($parts[0], '-_', '+/')), true);
  if (!is_array($payload) || ($payload['exp'] ?? 0) < time()) fail_request(401, 'Expired token.');
  return $payload;
}

$p = decode_token($_GET['token'] ?? '');
if (($p['action'] ?? '') !== 'upload' || !isset($_FILES['file'])) fail_request(400, 'Invalid upload.');
$file = $_FILES['file'];
if ($file['error'] !== UPLOAD_ERR_OK || $file['size'] !== ($p['size'] ?? -1)) fail_request(400, 'Upload size mismatch.');
$actual = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
if ($actual !== ($p['mime'] ?? '')) fail_request(415, 'File type mismatch.');
$key = $p['key'] ?? '';
if (!preg_match('/^[a-f0-9-]{36}\/[a-f0-9-]{36}$/', $key)) fail_request(400, 'Invalid storage key.');

if (($p['kind'] ?? '') === 'artwork') {
  $ext = ['image/jpeg'=>'jpg','image/png'=>'png','image/webp'=>'webp'][$actual] ?? null;
  if (!$ext || $file['size'] > 8388608) fail_request(413, 'Artwork rejected.');
  $name = hash_file('sha256', $file['tmp_name']) . '.' . $ext;
  $target = __DIR__ . '/artwork/' . $name;
  if (!is_dir(dirname($target))) mkdir(dirname($target), 0755, true);
  if (!move_uploaded_file($file['tmp_name'], $target)) fail_request(500, 'Could not store artwork.');
  header('Content-Type: application/json'); echo json_encode(['url' => SAUTI_PUBLIC_BASE . '/artwork/' . $name]); exit;
}
if (($p['kind'] ?? '') !== 'audio' || $file['size'] > 31457280) fail_request(413, 'Audio rejected.');
$plain = file_get_contents($file['tmp_name']);
$iv = random_bytes(12); $tag = '';
$cipher = openssl_encrypt($plain, 'aes-256-gcm', SAUTI_ENCRYPTION_KEY, OPENSSL_RAW_DATA, $iv, $tag);
if ($cipher === false) fail_request(500, 'Could not encrypt audio.');
$target = SAUTI_PRIVATE_ROOT . '/' . $key . '.bin';
if (!is_dir(dirname($target))) mkdir(dirname($target), 0700, true);
if (is_file($target)) fail_request(409, 'This upload has already been stored.');
$header = json_encode(['mime'=>$actual,'size'=>$file['size']]);
$blob = 'SAUTI01' . pack('N', strlen($header)) . $header . $iv . $tag . $cipher;
if (file_put_contents($target, $blob, LOCK_EX) === false) fail_request(500, 'Could not store audio.');
chmod($target, 0600);
$receipt = rtrim(strtr(base64_encode(hash_hmac('sha256', 'stored:' . $key, SAUTI_STORAGE_SECRET, true)), '+/', '-_'), '=');
header('Content-Type: application/json'); echo json_encode(['key' => $key, 'receipt' => $receipt]);
