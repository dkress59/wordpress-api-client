#!/bin/sh

echo 'Executing post-deploy...'

# update wp translations
# & flush permalinks
# wp core install --allow-root --url="http://localhost:8080" --title="Demo" --admin_user=admin --admin_email=admin@local.host
wp --allow-root language core update
wp --allow-root language theme update --all
wp --allow-root language plugin update --all
wp --allow-root rewrite flush
