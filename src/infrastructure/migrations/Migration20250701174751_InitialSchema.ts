import { Migration } from '@mikro-orm/migrations';

export class Migration20250701174751_InitialSchema extends Migration {

  async up(): Promise<void> {
    // Create users table
    this.addSql(`create table "user" ("id" varchar(255) not null, "username" varchar(255) not null, "password_hash" varchar(255) not null, constraint "user_pkey" primary key ("id"));`);
    this.addSql(`create unique index "user_username_unique" on "user" ("username");`);

    // Create todos table
    this.addSql(`create table "todo" ("id" serial primary key, "content" varchar(500) not null, "completed" boolean not null default false, "user_id" varchar(255) not null);`);
    this.addSql(`create index "todo_user_id_index" on "todo" ("user_id");`);

    // Create sessions table  
    this.addSql(`create table "session" ("id" varchar(255) not null, "user_id" varchar(255) not null, "expires_at" timestamptz not null, constraint "session_pkey" primary key ("id"));`);
    this.addSql(`create index "session_user_id_index" on "session" ("user_id");`);
    this.addSql(`create index "session_expires_at_index" on "session" ("expires_at");`);

    // Add foreign key constraints
    this.addSql(`alter table "todo" add constraint "todo_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "session" add constraint "session_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;`);
  }

  async down(): Promise<void> {
    // Drop foreign key constraints first
    this.addSql(`alter table "todo" drop constraint "todo_user_id_foreign";`);
    this.addSql(`alter table "session" drop constraint "session_user_id_foreign";`);

    // Drop tables
    this.addSql(`drop table if exists "session" cascade;`);
    this.addSql(`drop table if exists "todo" cascade;`);
    this.addSql(`drop table if exists "user" cascade;`);
  }

}
