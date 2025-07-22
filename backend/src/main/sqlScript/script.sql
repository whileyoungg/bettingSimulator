create table users(
                      username varchar(60) unique not null,
                      email varchar(60) not null,
                      isVerified boolean default false,
                      balance float not null default 0.0,
                      password varchar(60),
                      primary key(username)
);
create table events(
                       event varchar(60) not null,
                       eventId serial primary key,
                       budget float not null,
                       stakeLimit float not null,
                       playerLimit int not null,
                       isOpen boolean not null,
                       isFinished boolean not null,
                       isPublic boolean not NULL,
                       creator text REFERENCES users(username),
                       password text default '',
                       initialbudget float not null,
                       timeCreated timestamp default now(),
                       timeFinished timestamp
);

create table actions(
                        actionId serial primary key,
                        action text not null,
                        coefficient float not null,
                        eventId int references events(eventId),
                        unique(action,eventId)
);

create table participations(
                               actionId int not null,
                               username varchar(60) not null,
                               stake float not null,
                               potentialWin float not null,
                               hasWon boolean,
                               primary key(actionId,username),
                               constraint fk_id foreign key(actionId) references actions(actionId),
                               constraint fk_un foreign key(username) references users(username)
);

CREATE TABLE verification(
                             username text references users(username) PRIMARY KEY unique,
                             firstname text NOT NULL,
                             lastname text NOT NULL,
                             bsn text NOT NULL,
                             iban text NOT NULL,
                             address text NOT NULL,
                             postalcode text NOT NULL,
                             phonenumber text NOT null,
                             datesubmitted timestamp default now(),
                             dateverified timestamp default null,
                             verified boolean default false
);

create or replace function dateverifiedf()
returns trigger as $$
begin
	if new.verified =true then
update verification set dateverified = now() where username = new.username;
update users set isVerified = true where username = new.username;
end if;
return new;
end;
$$ language plpgsql;

create or replace trigger dateverifiedt
after update on verification
                    for each row WHEN (pg_trigger_depth() < 1) execute function dff()





drop table verification


create or replace function tff()
returns trigger as $$
begin
	if new.isFinished =true then
update events set timeFinished = now() where eventId = new.eventId;
end if;
return new;
end;
$$ language plpgsql;

create or replace trigger tft
after update on events
                    for each row WHEN (pg_trigger_depth() < 1) execute function tff()

create or replace function ibf()
returns trigger as $$
begin
    new.initialbudget := new.budget;
return new;
end;
$$ language plpgsql;

create or replace trigger ibt
before insert on events
for each row execute function ibf()

create or replace view eventsview as (select * from events)



