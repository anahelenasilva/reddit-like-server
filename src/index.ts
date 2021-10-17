import { MikroORM } from '@mikro-orm/core'
import mikroOrmConfig from './mikro-orm.config'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import HelloResolver from './resolvers/hello'
import PostResolver from './resolvers/post'
import UserResolver from './resolvers/user'

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig)
  orm.getMigrator().up()

  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver], //[__dirname + '/src/resolvers/*.ts'],
      validate: false
    }),
    context: () => ({ em: orm.em })
  })

  await apolloServer.start()
  apolloServer.applyMiddleware({ app })

  app.listen(4000, () => {
    console.log('Listening on port 4000')
  })
}

main().catch(err => console.error(err))