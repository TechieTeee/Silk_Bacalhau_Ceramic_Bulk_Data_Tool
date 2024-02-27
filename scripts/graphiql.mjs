import { serveEncodedDefinition } from "@composedb/devtools-node";

/**
 * Runs GraphiQL server to view & query composites.
 */
const server = await serveEncodedDefinition({
  ceramicURL: "https://ceramic-arcanumsci-mainnet.hirenodes.io/",
  graphiql: true,
  path: "./src/__generated__/definition.json",
  port: 5005,
});

console.log(`Server started on ${server.port}`);


