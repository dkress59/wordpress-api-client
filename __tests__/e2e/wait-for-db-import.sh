#!/bin/sh

CONTAINER="e2e_db_1"
USER="wordpress_db_user"
PASS="wordpress_db_password"
DB="wordpress"

sleep 3
while ! docker exec $CONTAINER mysqladmin ping --password=password; do
    echo "testing connection..." && mysqladmin ping --password=password && sleep 1
done

docker cp __tests__/e2e/db.sql $CONTAINER:/
docker exec $CONTAINER /bin/sh -c "mysql -u$USER -p$PASS $DB < /db.sql"