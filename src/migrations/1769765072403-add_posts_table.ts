// import { MigrationInterface, QueryRunner } from "typeorm";

// export class AddPostsTable1769765072403 implements MigrationInterface {
//     name = 'AddPostsTable1769765072403'
//     public async up(queryRunner: QueryRunner): Promise<void> {
//         await queryRunner.query(`
//             CREATE TABLE "posts" (
//             "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
//             "content" text NOT NULL, 
//             "images" text array, 
//             "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
//             "userId" integer, 
//             CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))`
//         );
//         await queryRunner.query(`
//             ALTER TABLE "posts" 
//             ADD CONSTRAINT "FK_ae05faaa55c866130abef6e1fee" 
//             FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
//             `);
//     }

//     public async down(queryRunner: QueryRunner): Promise<void> {
//         await queryRunner.query(`
//             ALTER TABLE "posts" 
//             DROP CONSTRAINT "FK_ae05faaa55c866130abef6e1fee"`
//         );
//         await queryRunner.query(`
//             DROP TABLE "posts"`
//         );
//     }

// }



// src/migrations/1769765072403-AddPostsTable.ts
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPostsTable1769765072403 implements MigrationInterface {
  name = "AddPostsTable1769765072403";

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log("Running migration: AddPostsTable1769765072403");

    //  Create posts table
    await queryRunner.query(`
      CREATE TABLE "posts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
        "content" text NOT NULL, 
        "images" text array, 
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
        "userId" uuid, 
        CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id")
      );
    `);
    console.log(" Table 'posts' created");

    //  Add foreign key to users
    await queryRunner.query(`
      ALTER TABLE "posts" 
      ADD CONSTRAINT "FK_ae05faaa55c866130abef6e1fee" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
    `);
    console.log(" Foreign key 'posts.userId -> users.id' added");

    //  Add index on userId
    await queryRunner.query(`
      CREATE INDEX "idx_post_user" ON "posts"("userId");
    `);
    console.log(" Index 'idx_post_user' created");

    //  Ensure users_following_users join table exists
    await queryRunner.query(`
  CREATE TABLE IF NOT EXISTS "users_following_users" (
    "followerId" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "followingId" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    PRIMARY KEY ("followerId", "followingId")
  );
`);
console.log(" users_following_users table ensured");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log("Reverting migration: AddPostsTable1769765072403");

    // Drop index
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_post_user";`);
    console.log(" Index 'idx_post_user' dropped");

    // Drop foreign key
    await queryRunner.query(`
      ALTER TABLE "posts" 
      DROP CONSTRAINT IF EXISTS "FK_ae05faaa55c866130abef6e1fee";
    `);
    console.log(" Foreign key on 'posts.userId' dropped");

    // Drop posts table
    await queryRunner.query(`DROP TABLE IF EXISTS "posts";`);
    console.log(" Table 'posts' dropped");

    // Drop join table
    await queryRunner.query(`DROP TABLE IF EXISTS "users_following_users";`);
    console.log(" Table 'users_following_users' dropped");
  }
}