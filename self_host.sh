pnpm install
pnpm run build
cd api
pnpm install
rm -rf dist
mv ../dist ./
pnpm run start
#pnpm install pm2 -g   
#pm2 start api/main.js --name "kontrol-app" --watch --max-memory-restart 300M --instances 2 --env production
