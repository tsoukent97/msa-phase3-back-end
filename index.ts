import { ApolloServer, gql } from 'apollo-server-express';
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
} from 'apollo-server-core';
import express from 'express';
import http from 'http';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient()

const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type aircraft_data {
    model: String
    range: String
  }

  type airport_data {
    airport_name: String
    timezone: String
  }
  
  type nba_data {
    player_name: String
    player_team: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    aircrafts_data: [aircraft_data]
    airplanes_data: [airport_data]
    nba_data: [nba_data]
  }
`;

const resolvers = {
    Query: {
        aircrafts_data: async () => await prisma.aircrafts_data.findMany(),
        airplanes_data: async () => await prisma.airports_data.findMany(),
        nba_data: async () => await prisma.nba_data.findMany()
      },
  };
async function startApolloServer(typeDefs:any, resolvers:any) {
  const app = express();
  const httpServer = http.createServer(app);
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    csrfPrevention: true,
    cache: 'bounded',
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
  });
  await server.start();
  server.applyMiddleware({
    app,
    path: '/'
  });
  await new Promise<void>(resolve => httpServer.listen({ port: 4000 }, resolve));
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
}

startApolloServer(typeDefs, resolvers);