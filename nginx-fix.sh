#!/bin/bash

echo "🔧 Fixing Nginx Configuration for Large Headers Issue"

# Backup current nginx configuration
echo "📋 Backing up current nginx configuration..."
sudo cp /etc/nginx/sites-available/drobotics.deltamulia.co.id /etc/nginx/sites-available/drobotics.deltamulia.co.id.backup

# Create a configuration snippet for large headers
echo "📝 Creating nginx configuration for large headers..."
sudo tee /etc/nginx/conf.d/large-headers.conf > /dev/null << 'EOF'
# Handle large headers from Laravel/Inertia applications
fastcgi_buffers 16 16k;
fastcgi_buffer_size 32k;
fastcgi_busy_buffers_size 64k;
fastcgi_temp_file_write_size 64k;
fastcgi_read_timeout 300;
fastcgi_connect_timeout 300;
fastcgi_send_timeout 300;

# Increase header buffer sizes
proxy_buffer_size 128k;
proxy_buffers 4 256k;
proxy_busy_buffers_size 256k;
proxy_max_temp_file_size 0;

# Additional settings for large responses
client_max_body_size 100M;
client_body_buffer_size 128k;
client_header_buffer_size 1k;
large_client_header_buffers 4 4k;
EOF

echo "✅ Nginx configuration created successfully!"

# Test nginx configuration
echo "🧪 Testing nginx configuration..."
if sudo nginx -t; then
    echo "✅ Nginx configuration is valid!"
    
    # Reload nginx
    echo "🔄 Reloading nginx..."
    sudo systemctl reload nginx
    echo "✅ Nginx reloaded successfully!"
else
    echo "❌ Nginx configuration test failed!"
    exit 1
fi

echo ""
echo "🎉 Nginx configuration fix completed!"
echo "📊 Monitor the logs with: sudo tail -f /var/log/nginx/error.log"
echo "🔍 Check if 502 errors stop with: sudo tail -f /var/log/nginx/access.log | grep ' 502 '" 