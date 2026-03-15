#!/usr/bin/env bash
# Deploy ghost-sites to VPS via Tailscale SSH.
# Usage: ./deploy.sh [site]
# Examples:
#   ./deploy.sh              # deploy all 3 sites
#   ./deploy.sh veneers      # deploy only veneers
set -euo pipefail

VPS="root@100.69.8.125"
APPS=(
  "ghost-veneers-xjy7xq:veneersalbania.com"
  "ghost-hair-j9lqnx:hairtransplantsalbania.com"
  "ghost-implants-erzbxu:implantsalbania.com"
)

FILTER="${1:-}"

# 1. Push to GitHub
echo "Pushing to GitHub..."
git push origin main

# 2. Pull on VPS and rebuild
for entry in "${APPS[@]}"; do
  APP="${entry%%:*}"
  DIR="${entry##*:}"

  if [[ -n "$FILTER" ]] && [[ "$DIR" != *"$FILTER"* ]] && [[ "$APP" != *"$FILTER"* ]]; then
    continue
  fi

  echo ""
  echo "=== Deploying $DIR ($APP) ==="

  # Pull latest code
  ssh "$VPS" "cd /etc/dokploy/applications/$APP/code && git pull origin main"

  # Build and update
  ssh "$VPS" "cat > /tmp/Dockerfile.$APP <<'DEOF'
FROM nginx:alpine
WORKDIR /usr/share/nginx/html/
COPY . .
DEOF
docker build -t $APP:latest -f /tmp/Dockerfile.$APP /etc/dokploy/applications/$APP/code/$DIR && \
docker service update --force --image $APP:latest $APP"

  echo "Deployed $DIR"
done

echo ""
echo "=== Verifying ==="
for entry in "${APPS[@]}"; do
  DIR="${entry##*:}"
  if [[ -n "$FILTER" ]] && [[ "$DIR" != *"$FILTER"* ]]; then
    continue
  fi
  STATUS=$(curl -so /dev/null -w "%{http_code}" "https://$DIR" 2>/dev/null)
  echo "$DIR: HTTP $STATUS"
done
