docker build --build-arg OPENAI_API_KEY=$(grep OPENAI_API_KEY .env | cut -d '=' -f2) -t sleeper-service .
docker run -p 3000:3000 sleeper-service