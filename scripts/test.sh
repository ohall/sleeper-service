#!/bin/bash
if [ "$1" == "local" ]; then
    HOST="http://localhost:3000"
else
    HOST="$APP_URL"
fi

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
TOKEN=$(node "$DIR/getToken.js")
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"system": "You are a helpful assistant.", "user": "What is the point of a bee?"}' \
  $HOST/prompt