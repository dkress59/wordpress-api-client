FROM wordpress:php8.0

ARG WORDPRESS_DB_HOST=${WORDPRESS_DB_HOST}
ARG WORDPRESS_DB_NAME=${WORDPRESS_DB_NAME}
ARG WORDPRESS_DB_USER=${WORDPRESS_DB_USER}
ARG WORDPRESS_DB_PASSWORD=${WORDPRESS_DB_PASSWORD}

RUN apt-get -y update \
    && apt-get -y upgrade \
    && apt-get -y install default-mysql-client unzip wget \
    && wget https://github.com/WP-API/Basic-Auth/archive/refs/heads/master.zip \
    && unzip -o master.zip -d wp-content/plugins
RUN curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar \
    && chmod +x wp-cli.phar \
    && mv ./wp-cli.phar /usr/local/bin/wp

COPY wp-plugin.php wp-content/plugins