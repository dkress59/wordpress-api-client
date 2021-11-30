FROM wordpress:php8.0

ARG WORDPRESS_DB_HOST=${WORDPRESS_DB_HOST}
ARG WORDPRESS_DB_NAME=${WORDPRESS_DB_NAME}
ARG WORDPRESS_DB_USER=${WORDPRESS_DB_USER}
ARG WORDPRESS_DB_PASSWORD=${WORDPRESS_DB_PASSWORD}
ARG WORDPRESS_DEBUG=${WORDPRESS_DEBUG}
ARG WORDPRESS_WORDPRESS_CONFIG_EXTRA=${WORDPRESS_WORDPRESS_CONFIG_EXTRA}

RUN apt-get -y update \
    && apt-get -y upgrade \
    && apt-get -y install default-mysql-client unzip wget \
    && wget -O composer-setup.php https://getcomposer.org/installer \
    && php composer-setup.php --install-dir=/usr/local/bin --filename=composer
RUN curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar \
    && chmod +x wp-cli.phar \
    && mv ./wp-cli.phar /usr/local/bin/wp

RUN composer init \
      --stability 'dev' \
      --name 'wordpress-api-client/e2e-test' \
      --repository '{"type":"composer","url":"https://wpackagist.org","only":["wpackagist-plugin/*","wpackagist-theme/*"]}' \
    && composer require "wp-api/basic-auth" \
    && mv vendor/wp-api/basic-auth wp-content/plugins

COPY wp-plugin.php wp-content/plugins