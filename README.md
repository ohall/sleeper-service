# sleeper-service

## Dev Setup

### Install dependencies
```bash
npm install
```

### Start the server

```bash
npm run dev
```

### Set up environment variables

```bash
cp .env.example .env
```
Add your Auth0 credentials and OpenAI API key to the `.env` file.

### Get a token

```bash
npm run get-token
```

### Test the server

```bash
./test.sh
```
