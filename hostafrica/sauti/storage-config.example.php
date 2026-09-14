<?php
// Install as /domains/images.solfit.co.ke/sauti-storage-config.php (outside public_html).
define('SAUTI_STORAGE_SECRET', 'GENERATE_A_SEPARATE_RANDOM_64_HEX_SECRET');
define('SAUTI_ENCRYPTION_KEY', hash_hmac('sha256', 'encryption', SAUTI_STORAGE_SECRET, true));
define('SAUTI_PRIVATE_ROOT', __DIR__ . '/sauti-private-audio');
define('SAUTI_PUBLIC_BASE', 'https://images.solfit.co.ke/sauti');
