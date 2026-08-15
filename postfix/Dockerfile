FROM debian:bookworm-slim

RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y \
    postfix \
    postfix-pgsql \
    libsasl2-modules \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY main.cf /etc/postfix/main.cf
COPY master.cf /etc/postfix/master.cf

COPY sql/ /etc/postfix/sql/

CMD ["postfix", "start-fg"]
