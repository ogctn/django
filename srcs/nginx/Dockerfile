FROM nginx:1.27.3-alpine-slim

RUN apk add --no-cache openssl bash

# SSL Sertifikası oluşturma (Mevcutsa yeniden oluşturulmaz)
RUN mkdir -p /etc/nginx/ssl && \
    if [ ! -f /etc/nginx/ssl/myself-sign.key ]; then \
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/myself-sign.key \
        -out /etc/nginx/ssl/myself-sign.crt \
        -subj "/C=TR/ST=Istanbul/L=Istanbul/O=mtu/OU=Development/CN=localhost"; \
    fi

COPY ./nginx.conf.template /etc/nginx/nginx.conf.template

# nginx.conf dosyasında envsubst kullanılmadan nginx başlat
CMD cp /etc/nginx/nginx.conf.template /etc/nginx/nginx.conf && nginx -g 'daemon off;'

# Statik dosyalar ve dizinlerin doğru izinlerle oluşturulması
RUN mkdir -p /usr/share/nginx/html/frontend_static && \
    mkdir -p /usr/share/nginx/html/bstatic && \
    touch /usr/share/nginx/html/index.html && \
    touch /usr/share/nginx/html/403.html /usr/share/nginx/html/404.html && \
    chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    curl -o /usr/share/nginx/html/favicon.ico https://upload.wikimedia.org/wikipedia/commons/3/37/Favicon.ico && \
    chmod 644 /usr/share/nginx/html/favicon.ico


EXPOSE 80 443
