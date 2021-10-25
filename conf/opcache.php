<?php
/**
 * WordPress opcache preloading.
 * Requires PHP >= 7.4.
 *
 * @author  Konrad Fedorczyk <contact@realhe.ro>
 * @link    https://stitcher.io/blog/preloading-in-php-74
 *
 * @version 1.0.0
 */

/**
 * Uwaga! Adjust your path.
 */
define('APP_PATH', '/var/www/html/');

$preload_patterns = [
	// WP native files (priority).
	'wp-load.php',
	'wp-settings.php',
	'wp-includes/http.php',
	'wp-includes/class-http.php',
	'wp-includes/general-template.php',
	'wp-includes/link-template.php',
	'wp-includes/class-wp-http-response.php',
	//'wp-includes/class-wp-http-requests-hooks.php',
	'wp-includes/class-wp-http-proxy.php',
	//'wp-includes/class-wp-http-requests-response.php',
	'wp-includes/class-wp-http-cookie.php',
	'wp-includes/class-wp-query.php',
	'wp-includes/class-wp-tax-query.php',
	'wp-includes/class-wp-user.php',
	'wp-includes/class-wp-post.php',
	'wp-includes/class-wp-roles.php',
	'wp-includes/class-wp-role.php',

	'wp-includes/taxonomy.php',
	'wp-includes/post.php',
	'wp-includes/user.php',
	'wp-includes/pluggable.php',
	'wp-includes/rest-api.php',
	'wp-includes/kses.php',
	'wp-includes/capabilities.php',
	'wp-includes/comment.php',
	'wp-includes/query.php',
	'wp-includes/l10n.php',
	'wp-includes/shortcodes.php',
	'wp-includes/theme.php',
	'wp-includes/post-template.php',
	'wp-includes/post-thumbnail-template.php',
	'wp-includes/media.php',
	'wp-includes/date.php',
	'wp-includes/author-template.php',

	// DK
	//'index.php',
	//'wp-admin/index.php',

	// Rest WP files.
	// 'wp-includes/**/*.php',
	// 'wp-includes/**/**/*.php',
	// 'wp-includes/**/**/**/*.php',
	// 'wp-includes/**/**/**/**/*.php',

	// Custom
	'wp-content/plugins/demo-plugin/*.php',
	'wp-content/themes/demo-theme/*.php',
];

$exclude_patterns = [
	'wp-includes/class-simplepie.php',
	'wp-includes/SimplePie/File.php',
	'wp-includes/SimplePie/Core.php',
	'wp-includes/class-wp-simplepie-file.php',
	'wp-includes/class-snoopy.php',
	'wp-includes/class-json.php',
	'wp-includes/class-wp-http-requests-hooks.php',
	'wp-includes/class-wp-http-requests-response.php',
];

foreach ($preload_patterns as $pattern) {
	$files = glob(APP_PATH . $pattern);

	foreach ($files as $file) if (!in_array($file, $exclude_patterns, true)) opcache_compile_file($file);
}