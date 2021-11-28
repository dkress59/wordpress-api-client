#!/bin/sh

CONTAINER="e2e_db_1"
USERNAME="wordpress_db_user"
PASSWORD="wordpress_db_password"

sleep 5
while ! docker exec $CONTAINER mysql --user=$USERNAME --password=$PASSWORD -e "SELECT 1" >/dev/null 2>&1; do
    echo "testing connection..." && sleep 1
done

docker exec $CONTAINER mysql --user=$USERNAME --password=$PASSWORD -e "SELECT *"