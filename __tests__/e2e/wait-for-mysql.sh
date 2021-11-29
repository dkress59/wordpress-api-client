#!/bin/sh

CONTAINER="e2e_db_1"

sleep 3
while ! docker exec $CONTAINER mysqladmin ping --password=password; do
    echo "testing connection..." && mysqladmin ping --password=password && sleep 1
done
sleep 3