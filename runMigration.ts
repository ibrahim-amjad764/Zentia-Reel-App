import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./src/entities/user";
import { Post } from "./src/entities/post";
import { Like } from "./src/entities/like";
import { Comment } from "./src/entities/comment";
import { AppDataSource } from "./src/db/data-source"; // Make sure this path is correct!

async function run() {
  await AppDataSource!.initialize();
  await AppDataSource!.runMigrations();
  console.log("Migrations have been run successfully!");
}

run().catch((error) => {
  console.error("Error during migration:", error);
});
