#!/bin/sh

CONTAINER="e2e_db_1"
DB="wordpress"

sleep 3
while ! docker exec $CONTAINER /bin/sh -c "mysqladmin ping -ppassword"; do
    echo "testing connection..."
    docker exec $CONTAINER /bin/sh -c "mysqladmin ping -ppassword"
    sleep 1
done

docker cp __tests__/e2e/db.sql $CONTAINER:/
docker exec $CONTAINER /bin/sh -c "mysql --protocol=tcp -uroot -ppassword $DB < /db.sql"