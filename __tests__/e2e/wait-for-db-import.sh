#!/bin/sh

CONTAINER="e2e_db_1"
DB="wordpress"

sleep 3
while ! docker exec $CONTAINER mysqladmin ping -ppassword; do
    echo "testing connection..." && mysqladmin ping --password=password && sleep 1
done

docker cp __tests__/e2e/db.sql $CONTAINER:/
docker exec $CONTAINER /bin/sh -c "mysql -uroot -ppassword $DB < /db.sql"