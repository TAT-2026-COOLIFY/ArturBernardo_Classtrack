#!/bin/sh
# Executado toda vez que o container do backend inicia.
set -e
cd /var/www/html

if [ -z "$APP_KEY" ]; then
  echo "ERRO: a variavel APP_KEY nao foi definida. Gere uma com: php artisan key:generate --show"
  exit 1
fi

# Aguarda o banco e aplica as migrations (desative com RUN_MIGRATIONS=false)
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  tentativas=0
  until php artisan migrate --force; do
    tentativas=$((tentativas + 1))
    if [ "$tentativas" -ge 20 ]; then
      echo "ERRO: banco de dados indisponivel apos 20 tentativas."
      exit 1
    fi
    echo "Banco ainda nao disponivel. Nova tentativa em 3s... ($tentativas/20)"
    sleep 3
  done
fi

# Popula o banco com dados de exemplo (DatabaseSeeder) apenas se ele estiver vazio,
# para nao duplicar dados a cada deploy. Desative com RUN_SEEDER=false.
if [ "${RUN_SEEDER:-true}" = "true" ]; then
  if php -r 'require "vendor/autoload.php"; $app = require "bootstrap/app.php"; $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap(); exit(App\Models\User::count() === 0 ? 0 : 1);'; then
    echo "Banco vazio: executando o seeder..."
    php artisan db:seed --force
  else
    echo "Banco ja possui usuarios: seeder ignorado."
  fi
fi

# Caches de producao
php artisan config:cache
php artisan route:cache
php artisan view:cache

chown -R www-data:www-data storage bootstrap/cache

exec "$@"
