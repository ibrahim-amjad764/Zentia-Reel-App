// import { DataSource } from "typeorm";
// import { User } from "../entities/user";
// import { Post } from "../entities/post";

// export const NhostDataSource = new DataSource({
//   type: "postgres",
//   host: process.env.NHOST_DB_HOST,
//   port: Number(process.env.NHOST_DB_PORT),
//   username: process.env.NHOST_DB_USER,
//   password: process.env.NHOST_DB_PASSWORD,
//   database: process.env.NHOST_DB_NAME,
//   entities: [User, Post],
//   synchronize: true, // only for dev
// });