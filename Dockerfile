FROM php:8-fpm-alpine as composer

RUN apk upgrade && apk add --update --no-cache \
    curl-dev imagemagick imagemagick-dev libcap libmemcached-dev libpng-dev libzip-dev \
    freetype-dev jpeg-dev libjpeg-turbo-dev libjpeg-turbo-utils libwebp libwebp-tools gifsicle optipng \
    autoconf build-base nginx supervisor git subversion

RUN docker-php-ext-configure gd \
		--with-freetype \
		--with-jpeg \
    && docker-php-ext-install -j$(nproc) gd
RUN docker-php-ext-install curl exif mysqli opcache zip
RUN docker-php-ext-enable gd curl exif mysqli opcache zip
RUN pecl install imagick && docker-php-ext-enable imagick

ARG COMPOSER_VERSION="2.1.8"
RUN set -ex; \
    \
    curl -o composer.sha256sum -fSL "https://getcomposer.org/download/${COMPOSER_VERSION}/composer.phar.sha256sum"; \
    export COMPOSER_SHA256=$(sed 's/\scomposer.phar$//' composer.sha256sum); \
    curl -o composer.phar -fSl "https://getcomposer.org/download/${COMPOSER_VERSION}/composer.phar"; \
    echo "$COMPOSER_SHA256 ./composer.phar" | sha256sum -c -; \
    chmod +x composer.phar; \
    mv composer.phar /usr/local/bin/composer

RUN set -ex; \
        \
        curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar; \
        chmod +x wp-cli.phar; \
        mv wp-cli.phar /usr/local/bin/wp

WORKDIR /var/www/html


FROM composer as wordpress

ARG WORDPRESS_LOCALE="en_US"
ARG WORDPRESS_VERSION="5.8.1"
RUN set -ex; \
        wp core download --version=$WORDPRESS_VERSION --locale=$WORDPRESS_LOCALE --skip-content --allow-root; \
        wp core verify-checksums --allow-root
RUN mkdir -p wp-content/uploads
RUN chmod 0755 wp-content
RUN chmod -R 0777 wp-content/uploads
RUN chown www-data:www-data /var/www/html/wp-content
RUN chown -R www-data:www-data /var/www/html/wp-content/uploads

COPY ./conf/composer.json ./
RUN composer update --no-interaction
RUN rm composer.json composer.lock

COPY script /var/www/script
RUN chmod +x ../script/post-deploy.sh

COPY ./wp-theme/ ./wp-content/themes/demo-theme/
COPY ./wp-plugin/ ./wp-content/plugins/demo-plugin/

COPY ./conf/php.ini /usr/local/etc/php/php.ini

COPY ./conf/wp-config.php ./
COPY ./conf/opcache.php ../


FROM wordpress AS docker-compose

# Disable Opcache Preload
RUN echo '<?php' > /var/www/opcache.php

#VOLUME /var/www/html