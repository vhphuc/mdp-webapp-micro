## Getting Started

Follow these steps to set up and run any app in this repository on Windows (PowerShell).

### 1) Prerequisites
- Nvm install 20.19 (Angular 17/18/19/20 can use same Node v20.19.x)
- Git

Verify Node:
```bash
nvm ls
```

### 2) Install pnpm
Option A (recommended, via Corepack — included with Node 16.19+):
```bash
corepack enable
corepack prepare pnpm@latest --activate
```

Option B (global install):
```bash
npm i -g pnpm
```

Confirm pnpm:
```bash
pnpm -v
```

### 3) Clone and open the project
```bash
git clone <your-repo-url> mdp-webapp-micro
cd mdp-webapp-micro
```

### Notes
- Each app has its own `package.json` with scripts like `start`, `build`, and `test`.
- Use a different `--port` for each concurrently running app to avoid conflicts.

## Running with Docker Compose

To run multiple apps together using Docker Compose:

1. **Comment/uncomment services** in `docker-compose.yml` based on which apps you need

2. **Start the services**:
   ```bash
   docker compose up -d --build
   ```
   The `nginx_init` service automatically generates `nginx-local.conf` before the proxy starts, ensuring only enabled services are configured.

3. **Stop services**:
   ```bash
   docker compose down
   ```

4. **Access the apps**:
   - Main proxy: http://localhost:4799
   - Individual apps will be available at routes defined in nginx config (e.g., `/embroidery/`, `/dtf-hat/`)

### How It Works

- The `nginx_init` service runs automatically before the proxy service starts
- It reads `docker-compose.yml` and generates `nginx-local.conf` based on enabled (not commented out) services
- Only enabled services are configured in nginx, preventing connection errors when services are disabled
- The proxy service depends on `nginx_init` completing successfully before starting

**Note**: After modifying `docker-compose.yml` to enable/disable services, restart docker-compose for the changes to take effect:
```bash
docker compose down
docker compose up -d --build
```

