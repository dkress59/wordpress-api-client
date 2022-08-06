#!/bin/sh

CONTAINER="e2e-db"
DB="wordpress"

sleep 3
while ! docker exec $CONTAINER /bin/sh -c "mysqladmin --protocol=tcp ping -ppassword >/dev/null 2>&1"; do
    echo "testing connection..."
    sleep 1
done

#docker cp __tests__/e2e/db.sql $CONTAINER:/
#docker exec $CONTAINER /bin/sh -c "mysql --protocol=tcp -uroot -ppassword $DB < /db.sql"