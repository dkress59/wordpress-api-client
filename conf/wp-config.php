<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the
 * installation. You don't have to use the web site, you can
 * copy this file to "wp-config.php" and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link    https://wordpress.org/support/article/editing-wp-config-php/
 *
 * @package WordPress
 */

const WP_AUTO_UPDATE_CORE = false;

 define('WP_SITEURL', getenv('WORDPRESS_SITEURL') ?? 'http://localhost:8080');
 const WP_HOME = WP_SITEURL;

$DB_PORT = getenv('WORDPRESS_DB_PORT') ?: 3306;
define('DB_NAME', getenv('WORDPRESS_DB_NAME'));
define('DB_USER', getenv('WORDPRESS_DB_USER'));
define('DB_PASSWORD', getenv('WORDPRESS_DB_PASSWORD'));
define('DB_HOST', getenv('WORDPRESS_DB_HOST') . ':' . $DB_PORT);
const DB_CHARSET = 'utf8';
const DB_COLLATE = '';
define('MYSQL_CLIENT_FLAGS', (bool) getenv('SQL_SSL') ? MYSQLI_CLIENT_SSL : null);

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the
 * {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service} You can change these at any
 * point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
const AUTH_KEY         = '0y`n`vQdEwQ;)O|q9L{$JPn!D=`f*xXG|t:F${`Yi;8nT40 Y3y59oJyS~+T14i;';
const SECURE_AUTH_KEY  = '?j?8#A|>)7]0H}B|:;UEd]$e*cp3)F!<yiI+Pnzy~&^y3]b%`?I9!Q-U+s6:#F[V';
const LOGGED_IN_KEY    = 'S-212,vIh(?&|j#e%;3~y-K:3oA)6z9zFh4ngWCJK]-NJ[TSq4zk en$]J7i+9M8';
const NONCE_KEY        = '+Z5<l^a8ZY!vgaBrjyO.Uja|%RxE}2m`@-dwQ:?2P7W8vn&b_R%v[HD=_XcIg(Za';
const AUTH_SALT        = 'K3#6O)n[%h)(^.,:J;InR2ki!p@@H:/>4@I}N;wLW,2&2}3rvrT_Sn$(Y_*(Q@>s';
const SECURE_AUTH_SALT = 'b-^YYd^^BwM>c8QH},Ao7s0&%cFx3S)-aEO/i6>Z~|rqzPtt6|QQcF/74zN!D8j*';
const LOGGED_IN_SALT   = 'K+iiv0Ea#JwwP0m?k*4W_}P M{@cSh|uQ^i<1uY!nM(8ph[ZjH_Q5LIJV|+|2ar/';
const NONCE_SALT       = '!C~in4 <R|Od~fJ0VBE*NGy0:YsJ:|Zlz@3F.8(fCfcASlQsDI.F5%V]x~9vOZ,S';
/**#@-*/

$table_prefix = getenv('WORDPRESS_TABLE_PREFIX');

define('WP_DEBUG', (bool) getenv('WORDPRESS_DEBUG'));
define('WP_DEBUG_LOG', (bool) getenv('WORDPRESS_DEBUG'));
define('WP_DEBUG_DISPLAY', (bool) getenv('WORDPRESS_DEBUG'));

/** SSL */
define('FORCE_SSL_ADMIN', (bool) getenv('WORDPRESS_ADMIN_SSL'));
// in some setups HTTP_X_FORWARDED_PROTO might contain
// a comma-separated list e.g. http,https
// so check for https existence
if (
	isset($_SERVER['HTTP_X_FORWARDED_PROTO'])
	&& strpos($_SERVER['HTTP_X_FORWARDED_PROTO'], 'https') !== false
)
	$_SERVER['HTTPS'] = 'on';

// WORDPRESS_CONFIG_EXTRA
const WP_POST_REVISIONS = 25;
define('FS_METHOD', getenv('WORDPRESS_FS_METHOD'));
define('DISALLOW_FILE_MODS', (bool) getenv('DISALLOW_FILE_MODS'));

// DOCKER_CONFIG_EXTRA
// define('DOMAIN_CURRENT_SITE', 'localhost');
define('JWT_AUTH_SECRET_KEY', getenv('JWT_AUTH_SECRET_KEY'));
define('JWT_AUTH_CORS_ENABLE', (bool) getenv('JWT_AUTH_CORS_ENABLE'));

/* That's all, stop editing! Happy publishing . */

/** Absolute path to the WordPress directory. */
if (!defined('ABSPATH')) {
	define('ABSPATH', __DIR__ . '/');
}
//define('WP_TEMP_DIR', ABSPATH . 'wp-content/temp');
const CONCATENATE_SCRIPTS = false;

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';