import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { prod } from "./config";
import { Post } from "./entities/Post";

export default {
  dbName: 'redditlike',
  type: 'postgresql',
  user: 'postgres',
  password: 'postgres',
  debug: !prod,
  entities: [Post],
  migrations: {
    path: path.join(__dirname, './migrations'), // path to the folder with migrations
    pattern: /^[\w-]+\d+\.[tj]s$/, // regex pattern for the migration files
  }
} as Parameters<typeof MikroORM.init>[0];