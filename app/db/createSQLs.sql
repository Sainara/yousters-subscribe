CREATE TABLE entersessions(id serial PRIMARY KEY, sessionID VARCHAR, code VARCHAR, tryCounter int, expiretime timestamptz, number VARCHAR);
CREATE TABLE users(id serial PRIMARY KEY, phone VARCHAR, user_name VARCHAR);


ALTER TABLE users add COLUMN created_on timestamptz;
ALTER TABLE users add COLUMN isvalidated bool default false;
ALTER TABLE users ADD COLUMN main_passport VARCHAR;
ALTER TABLE users ADD COLUMN second_passport VARCHAR;
alter table users add column video_passport varchar;
ALTER TABLE users ADD COLUMN is_on_validation bool default false;
ALTER TABLE users add COLUMN email VARCHAR;
ALTER TABLE users add COLUMN inn VARCHAR;
alter TABLE users add COLUMN validation_type VARCHAR;

create TABLE blacklist(id serial PRIMARY KEY, phone VARCHAR not null, reason VARCHAR, added_at timestamptz);

create TABLE agreements(id serial PRIMARY KEY, title VARCHAR, hash VARCHAR, link VARCHAR, created_at timestamptz, creator_id int);
ALTER TABLE agreements ADD COLUMN status_id int default 1;
ALTER TABLE agreements add COLUMN uid VARCHAR;
ALTER TABLE agreements add COLUMN unumber VARCHAR;


CREATE TABLE subscribtion(id serial PRIMARY KEY, agr_uid VARCHAR, subs_id int, created_at timestamptz);
ALTER table subscribtion add column video_url varchar;
alter tabs subscribtion add column isverified bool;
alter table subscribtion add column uid varchar;

CREATE TABLE device_tokens(id serial PRIMARY KEY, user_id int, device_type VARCHAR, token VARCHAR);

CREATE TABLE subscribesessions(id serial PRIMARY KEY, sessionID VARCHAR, code VARCHAR, tryCounter int, agr_uid VARCHAR, expiretime timestamptz,);
ALTER TABLE subscribesessions add COLUMN to_num VARCHAR;

CREATE TABLE added_agreements(id serial PRIMARY KEY, user_id int, agr_uid VARCHAR);

CREATE TABLE payments(id serial PRIMARY KEY, uid VARCHAR, user_id int, agr_uid VARCHAR, amount VARCHAR, created_at timestamptz);

alter TABLE payments add COLUMN status VARCHAR default 'created';
alter TABLE payments add COLUMN yndx_id VARCHAR;
alter table payments add column tnkf_id varchar;
alter table payments add column paket_id integer;
alter table payments add column title varchar;


CREATE TABLE sberAuthSessions(id serial PRIMARY KEY, nonce VARCHAR, state VARCHAR, scope VARCHAR);

alter table sberauthsessions add column created_at timestamptz default CURRENT_TIMESTAMP;
alter table sberauthsessions add column phone varchar;

Create table bills(id serial PRIMARY KEY, inn VARCHAR, link VARCHAR, expire VARCHAR);
alter table bills add column creator_id int;

Create table paketplans(id serial PRIMARY KEY, title VARCHAR, price VARCHAR, description VARCHAR, isActive Boolean, howMuch int, forWho varchar);

Create table userpakets(id serial PRIMARY KEY, paket_id int, user_id int, created_at timestamptz default CURRENT_TIMESTAMP, payment_uid VARCHAR, howMuch int);

Create table pakets_usage(id serial PRIMARY KEY, agr_uid varchar, user_id int, created_at timestamptz default CURRENT_TIMESTAMP);

CREATE TABLE subs_reports(id serial PRIMARY KEY, sub_uid VARCHAR, reason VARCHAR, status varchar, created_at timestamptz);


Create table dialogs(id serial PRIMARY KEY, title VARCHAR, creator_id int, created_at timestamptz default CURRENT_TIMESTAMP);
alter table dialogs add column uid varchar;
alter table dialogs add column dialog_type varchar;
alter table dialogs add column dialog_status varchar;

Create table messages(id serial PRIMARY KEY, m_content VARCHAR, m_type VARCHAR, is_read bool default false, read_at timestamptz, creator_id int, dialog_id int, created_at timestamptz default CURRENT_TIMESTAMP);

Create table offers(id serial PRIMARY KEY, title VARCHAR, price VARCHAR, description VARCHAR, status VARCHAR, uid varchar, dialog_uid varchar);
alter table offers add column creator_id int;
alter table offers add column level VARCHAR;


CREATE TABLE lawyers(id serial PRIMARY KEY, phone VARCHAR, user_name VARCHAR, level VARCHAR, password VARCHAR);

ALTER TABLE lawyers add COLUMN created_on timestamptz default CURRENT_TIMESTAMP;
ALTER TABLE lawyers add COLUMN email VARCHAR;
