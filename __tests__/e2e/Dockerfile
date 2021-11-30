FROM wordpress:php8.0

RUN apt-get -y update \
    && apt-get -y upgrade \
    && apt-get -y install default-mysql-client unzip wget \
    && wget -O composer-setup.php https://getcomposer.org/installer \
    && php composer-setup.php --install-dir=/usr/local/bin --filename=composer
RUN curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar \
    && chmod +x wp-cli.phar \
    && mv ./wp-cli.phar /usr/local/bin/wp

WORKDIR /usr/src/wordpress

RUN composer init \
      --stability 'dev' \
      --name 'wordpress-api-client/e2e-test'
RUN composer require "wp-api/basic-auth" \
    && mv vendor/wp-api/basic-auth wp-content/plugins
COPY wp-plugin.php wp-content/plugins

WORKDIR /var/www/html