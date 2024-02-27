import { ComposeClient } from "@composedb/client";
import { RuntimeCompositeDefinition } from "@composedb/types";
import { NextApiRequest, NextApiResponse } from "next";

import { definition } from "../../src/__generated__/definition.js";

export default async function createAttestation(
  req,
  res
) {

  //instantiate a composeDB client instance
  const composeClient = new ComposeClient({
    ceramic: "https://ceramic-arcanumsci-mainnet.hirenodes.io/",
    definition,
  });

  try {
    console.log(req.body.account);
    const data = await composeClient.executeQuery(`
            query {
              accountAttestationIndex(filters: {
                or: [
          {
            where: {
              attester: { 
                    equalTo: "${req.body.account}"
                  } 
            }
          },
          {
            and: {
              where: {
            recipient : {
                    equalTo: "${req.body.account}"
                  } 
              }
            }
          }
            ],
            } 
          first: 100) {
            edges {
              node {
                    id
                    uid
                    schema
                    attester
                    verifyingContract 
                    easVersion
                    version 
                    chainId 
                    types{
                      name
                      type
                    }
                    r
                    s
                    v
                    recipient
                    refUID
                    data
                    time
                }
              }
            }
          }
      `);
    return res.json(data);
  } catch (err) {
    res.json({
      err,
    });
  }
}
