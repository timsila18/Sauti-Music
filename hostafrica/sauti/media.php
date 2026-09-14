<?php
declare(strict_types=1);
require dirname(__DIR__, 2) . '/sauti-storage-config.php';
function deny(): never { http_response_code(403); exit; }
$token = $_GET['token'] ?? ''; $parts = explode('.', $token, 2); if (count($parts) !== 2) deny();
$expected = rtrim(strtr(base64_encode(hash_hmac('sha256', $parts[0], SAUTI_STORAGE_SECRET, true)), '+/', '-_'), '=');
if (!hash_equals($expected, $parts[1])) deny();
$p = json_decode(base64_decode(strtr($parts[0], '-_', '+/')), true);
if (!is_array($p) || ($p['action'] ?? '') !== 'read' || ($p['kind'] ?? '') !== 'audio' || ($p['exp'] ?? 0) < time()) deny();
$key = $p['key'] ?? ''; if (!preg_match('/^[a-f0-9-]{36}\/[a-f0-9-]{36}$/', $key)) deny();
$path = SAUTI_PRIVATE_ROOT . '/' . $key . '.bin'; if (!is_file($path)) { http_response_code(404); exit; }
$blob = file_get_contents($path); if (substr($blob, 0, 7) !== 'SAUTI01') deny();
$hlen = unpack('N', substr($blob, 7, 4))[1]; $header = json_decode(substr($blob, 11, $hlen), true);
$offset = 11 + $hlen; $iv = substr($blob, $offset, 12); $tag = substr($blob, $offset + 12, 16); $cipher = substr($blob, $offset + 28);
$plain = openssl_decrypt($cipher, 'aes-256-gcm', SAUTI_ENCRYPTION_KEY, OPENSSL_RAW_DATA, $iv, $tag); if ($plain === false) deny();
header('Content-Type: ' . ($header['mime'] ?? 'application/octet-stream'));
header('Content-Length: ' . strlen($plain)); header('Cache-Control: private, no-store'); header('X-Content-Type-Options: nosniff');
if (($p['download'] ?? false) === true) header('Content-Disposition: attachment; filename="sauti-campaign-track"');
echo $plain;
