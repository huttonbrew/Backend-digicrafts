CREATE TABLE students (
    id serial primary key,
    name varchar (25) not null,
    age integer not null,
    phone_number integer not null,
    address varchar (100) not null,
    front_end varchar(25),
    back_end varchar (25)
    )
;

CREATE TABLE class (
    name varchar (25) not null,
    start integer not null,
    finish integer not null
    )
;

