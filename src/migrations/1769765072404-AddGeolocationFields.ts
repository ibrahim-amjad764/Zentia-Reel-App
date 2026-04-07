import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddGeolocationFields1769765072404 implements MigrationInterface {
    name = 'AddGeolocationFields1769765072404'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add columns to 'users' table
        await queryRunner.addColumn("users", new TableColumn({
            name: "lat",
            type: "decimal",
            precision: 10,
            scale: 7,
            isNullable: true,
        }));
        await queryRunner.addColumn("users", new TableColumn({
            name: "lng",
            type: "decimal",
            precision: 10,
            scale: 7,
            isNullable: true,
        }));
        await queryRunner.addColumn("users", new TableColumn({
            name: "city",
            type: "varchar",
            length: "255",
            isNullable: true,
        }));
        await queryRunner.addColumn("users", new TableColumn({
            name: "country",
            type: "varchar",
            length: "255",
            isNullable: true,
        }));

        // Add columns to 'posts' table (for reel proximity)
        await queryRunner.addColumn("posts", new TableColumn({
            name: "lat",
            type: "decimal",
            precision: 10,
            scale: 7,
            isNullable: true,
        }));
        await queryRunner.addColumn("posts", new TableColumn({
            name: "lng",
            type: "decimal",
            precision: 10,
            scale: 7,
            isNullable: true,
        }));
        await queryRunner.addColumn("posts", new TableColumn({
            name: "city",
            type: "varchar",
            length: "255",
            isNullable: true,
        }));
        await queryRunner.addColumn("posts", new TableColumn({
            name: "country",
            type: "varchar",
            length: "255",
            isNullable: true,
        }));

        console.log("[Migration] Geolocation fields successfully added to users and posts.");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop columns from 'users'
        await queryRunner.dropColumn("users", "lat");
        await queryRunner.dropColumn("users", "lng");
        await queryRunner.dropColumn("users", "city");
        await queryRunner.dropColumn("users", "country");

        // Drop columns from 'posts'
        await queryRunner.dropColumn("posts", "lat");
        await queryRunner.dropColumn("posts", "lng");
        await queryRunner.dropColumn("posts", "city");
        await queryRunner.dropColumn("posts", "country");
    }

}
