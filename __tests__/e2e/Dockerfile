FROM wordpress:php8.0

RUN apt-get -y update \
    && apt-get -y upgrade \
    && apt-get -y install default-mysql-client unzip wget \
    && wget -O composer-setup.php https://getcomposer.org/installer \
    && php composer-setup.php --install-dir=/usr/local/bin --filename=composer
RUN curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar \
    && chmod +x wp-cli.phar \
    && mv ./wp-cli.phar /usr/local/bin/wp

WORKDIR /var/www/html

RUN touch /var/www/html/composer.json && echo '{"name":"wordpress-api-client/e2e-test","minimum-stability":"dev","require":{"wp-api/basic-auth":"dev-master"},"extra":{"installer-paths":{"wp-content/plugins":["wp-api/basic-auth"]}}}' > /var/www/html/composer.json
RUN composer install

RUN ls .
RUN ls wp-content/plugins