source .env
heroku drains:add https://$OPEN_OBSERVE_USER_ID:$OPEN_OBSERVE_API_KEY@api.openobserve.ai/api/$OPEN_OBSERVE_ORG_ID/$OPEN_OBSERVE_STREAM_NAME/_json -a sleeper-service

heroku drains -a sleeper-service

