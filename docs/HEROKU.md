## Managing Heroku Deployment

### Heroku Dashboard

- **Dashboard Link:** [Heroku Dashboard](https://dashboard.heroku.com/apps/sleeper-service)

### Deploying

Application is deployed on every commit pushed to the main branch on github.

### Adding Environment Variables with Heroku CLI

To add environment variables using the Heroku CLI, follow these steps:

1. **Log in to Heroku CLI:**

   ```bash
   heroku login
   ```

2. **Set a single environment variable:**

   ```bash
   heroku config:set VARIABLE_NAME=your_value -a sleeper-service
   ```

3. **Set multiple environment variables at once:**

   ```bash
   heroku config:set VAR1=value1 VAR2=value2 -a sleeper-service
   ```

4. **Verify that the environment variables have been set:**
   ```bash
   heroku config -a sleeper-service
   ```
   **Example:**

```bash
heroku config:set OPENAI_API_KEY=sk-YourAPIKey AUTH0_CLIENT_ID=yourClientId -a sleeper-service
```

### Testing deployment

```bash
./test.sh
```

### Accessing logs

```bash
heroku logs --tail -a sleeper-service
```

### Useful Resources

- [Heroku Documentation](https://devcenter.heroku.com/)
- [Managing Heroku Apps](https://devcenter.heroku.com/articles/manage-apps)
- [Heroku CLI Reference](https://devcenter.heroku.com/articles/heroku-cli-commands)
