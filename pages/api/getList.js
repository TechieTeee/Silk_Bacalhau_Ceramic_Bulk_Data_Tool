import { ComposeClient } from "@composedb/client";
import { RuntimeCompositeDefinition } from "@composedb/types";
import { NextApiRequest, NextApiResponse } from "next";
import { Orbis } from "@orbisclub/components";
import { env } from "../../env.mjs";
import { definition } from "../../src/__generated__/definition.js";


export default async function getList(req, res) {
  //instantiate a composeDB client instance
  const composeClient = new ComposeClient({
    ceramic: "https://ceramic-arcanumsci-mainnet.hirenodes.io/",
    definition,
  });

  try {
    const count = await composeClient.executeQuery(`
    query{
        attestationCount
      }
    `);
    console.log(count.data.attestationCount)
    const data = await composeClient.executeQuery(`
    query {
        accountAttestationIndex(first: ${count.data.attestationCount}) {
          edges {
            node {
              recipient
              attester
            }
          }
        }
      }
    `);
    console.log(data)
    return res.json(data);
  } catch (err) {
    res.json({
      err,
    });
  }
}
