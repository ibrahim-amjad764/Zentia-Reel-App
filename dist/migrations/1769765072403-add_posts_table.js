"use strict";
// import { MigrationInterface, QueryRunner } from "typeorm";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddPostsTable1769765072403 = void 0;
class AddPostsTable1769765072403 {
    constructor() {
        this.name = 'AddPostsTable1769765072403';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE "posts" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "content" text NOT NULL, 
                "images" text array, 
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
                "userId" integer, 
                CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id")
            );
        `);
        await queryRunner.query(`
            ALTER TABLE "posts" 
            ADD CONSTRAINT "FK_ae05faaa55c866130abef6e1fee" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
        `);
        // Create the index here
        await queryRunner.query(`
            CREATE INDEX "idx_post_user" ON "posts"("userId");
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            DROP INDEX IF EXISTS "idx_post_user";
        `);
        await queryRunner.query(`
            ALTER TABLE "posts" 
            DROP CONSTRAINT "FK_ae05faaa55c866130abef6e1fee";
        `);
        await queryRunner.query(`
            DROP TABLE "posts";
        `);
    }
}
exports.AddPostsTable1769765072403 = AddPostsTable1769765072403;
