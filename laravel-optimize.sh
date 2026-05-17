#!/bin/bash

echo "🔧 Optimizing Laravel Application"

# Navigate to Laravel directory (adjust path as needed)
LARAVEL_PATH="/var/www/drobotics.deltamulia.co.id"
cd $LARAVEL_PATH

echo "📁 Working in: $LARAVEL_PATH"

# Clear all Laravel caches
echo "🧹 Clearing Laravel caches..."
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan optimize:clear

# Re-optimize Laravel
echo "⚡ Re-optimizing Laravel..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Clear old sessions
echo "🗑️ Clearing old sessions..."
php artisan session:gc

# Set proper permissions
echo "🔐 Setting proper permissions..."
sudo chown -R www-data:www-data $LARAVEL_PATH
sudo chmod -R 755 $LARAVEL_PATH/storage
sudo chmod -R 755 $LARAVEL_PATH/bootstrap/cache

# Restart PHP-FPM
echo "🔄 Restarting PHP-FPM..."
sudo systemctl restart php8.3-fpm

echo ""
echo "🎉 Laravel optimization completed!"
echo "📊 Test your application now"
echo "🔍 Monitor logs with: tail -f storage/logs/laravel.log" 