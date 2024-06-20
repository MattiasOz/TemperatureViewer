#!/usr/bin/env bash

host="$1"
shift
port="$1"
shift
cmd="$@"

while ! nc -z $host $port; do
  >&2 echo "Waiting for $host:$port..."
  sleep 1
done

>&2 echo "$host:$port is available. Executing command."
exec $cmd
