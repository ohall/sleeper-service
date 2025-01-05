#!/bin/bash
TOKEN=$(node getToken.js)
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"system": "You are a helpful assistant.", "user": "What is the point of a bee?"}' \
  http://localhost:3000/prompt