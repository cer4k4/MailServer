FROM debian:bookworm-slim

RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y \
    dovecot-core \
    dovecot-imapd \
    dovecot-lmtpd \
    dovecot-pgsql \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd -g 5000 vmail && \
    useradd -u 5000 -g vmail -d /var/mail -s /usr/sbin/nologin vmail

RUN mkdir -p /var/mail && \
    chown -R vmail:vmail /var/mail

RUN mkdir -p /etc/dovecot/certs

COPY dovecot.conf /etc/dovecot/dovecot.conf
COPY dovecot-sql.conf.ext /etc/dovecot/dovecot-sql.conf.ext

CMD ["dovecot", "-F"]
