FROM wordpress:php8.0

WORKDIR /var/www/html

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
      --name 'wordpress-api-client/e2e-test'
RUN composer require "wp-api/basic-auth"

COPY wp-plugin.php wp-content/plugins

RUN ls .
RUN ls wp-content/plugins