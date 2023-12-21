import { readFileSync } from "fs";
import { Orbis } from "@orbisclub/components";
import { fromString } from "uint8arrays/from-string";

export const runSetup = async (input) => {
  let parentContext = "";
  let finalContext;
  let orbis = new Orbis({
    node: "https://node2.orbis.club",
    PINATA_GATEWAY: "https://orbis.mypinata.cloud/ipfs/",
    PINATA_API_KEY: process.env.NEXT_PUBLIC_PINATA_API_KEY,
    PINATA_SECRET_API_KEY: process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY,
  });

  const seed = readFileSync("./admin_seed.txt");
  const key = fromString(seed, "base16");

  const res = await orbis.connectWithSeed(key);
  console.log("orbis connected: ", res);

  await orbis
    .createProject({
      name: input.name || "",
      type: "other",
      website: input.website || null,
      socials: {
        twitter: input.twitter || "",
        discord: input.discord || "",
        telegram: input.telegram || "",
      },
    })
    .then(async (project) => {
      const context = await orbis
        .createContext({
          name: input.contextName || "",
          websiteUrl: input.website || "",
          imageUrl: input.image || "",
          project_id: project.doc,
          accessRules: [],
          displayName: input.contextName || "",
          integrations: {},
          context: null,
        })
        .then(async (context) => {
          parentContext = context.doc;
          finalContext = context;
          if (input.categories.length) {
            input.categories.forEach(async (category) => {
              await orbis.createContext({
                name: category.name || "",
                imageUrl: "",
                websiteUrl: "",
                context: context.doc,
                project_id: project.doc,
                accessRules: category.gated
                  ? [
                      {
                        type: "did",
                        authorizedUsers: [],
                      },
                    ]
                  : [],
                displayName: category.name,
                integrations: {},
              });
            });
          }
        });
    });
  console.log("This is your parent context: ", parentContext);
  console.log("This is your final context: ", finalContext);
};