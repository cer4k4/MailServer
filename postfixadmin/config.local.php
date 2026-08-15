<?php

$CONF['database_type'] = 'pgsql';
$CONF['database_host'] = 'postgres';
$CONF['database_port'] = '5432';
$CONF['database_user'] = 'postgres';
$CONF['database_password'] = 'postgres';
$CONF['database_name'] = 'postfixadmin';

$CONF['setup_password'] = 'Qtlsd@k47';

$CONF['encrypt'] = 'dovecot:SHA512-CRYPT';

$CONF['domain_path'] = 'YES';
$CONF['domain_in_mailbox'] = 'NO';

$CONF['quota'] = 'YES';
$CONF['used_quotas'] = 'YES';

$CONF['aliases'] = 'YES';
$CONF['mailboxes'] = 'YES';

$CONF['configured'] = true;

$CONF['smtp_server'] = 'postfix';
$CONF['smtp_port'] = '25';

$CONF['admin_email'] = 'postmaster@lab.ir';
