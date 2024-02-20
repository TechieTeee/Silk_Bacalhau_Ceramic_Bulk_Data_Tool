import { CeramicClient } from "@ceramicnetwork/http-client";
import { ComposeClient } from "@composedb/client";
import { DID } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import KeyResolver from "key-did-resolver";
import { fromString } from "uint8arrays/from-string";

import { env } from "../../env.mjs";

import { definition } from "../../src/__generated__/definition.js";

const uniqueKey = process.env.AUTHOR_KEY;

export default async function handler(req, res) {
  const { message, uid, account, domain, types, signature } = req.body;
  console.log(env.AUTHOR_KEY);
  //instantiate a ceramic client instance
  const ceramic = new CeramicClient("https://ceramic-arcanumsci-mainnet.hirenodes.io/");

  //instantiate a composeDB client instance
  const composeClient = new ComposeClient({
    ceramic: "https://ceramic-arcanumsci-mainnet.hirenodes.io/",
    definition,
  });

  //authenticate developer DID in order to create a write transaction
  const authenticateDID = async (seed) => {
    const key = fromString(seed, "base16");
    const provider = new Ed25519Provider(key);
    const staticDid = new DID({
      // @ts-expect-error: Ignore type error
      resolver: KeyResolver.getResolver(),
      provider,
    });
    await staticDid.authenticate();
    //@ts-ignore
    ceramic.did = staticDid;
    return staticDid;
  };

  try {
    if (uniqueKey) {
      const did = await authenticateDID(uniqueKey);
      composeClient.setDID(did);
      const checkIfExists = await composeClient.executeQuery(`
      query {
        accountAttestationIndex(filters: {
        and: [
          { where: { attester: { equalTo: "${req.body.account}" } } }
          { and: { where: { recipient: { equalTo: "${message.recipient}" } } } }
        ]
      } 
    first: 1) {
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
      console.log(checkIfExists.data.accountAttestationIndex.edges.length);
      if(checkIfExists.data.accountAttestationIndex.edges.length !== 0){
        console.log("This account has already been attested")
        return res.json({
          error: "This account has already been attested",
        });
      } else {
        const data = await composeClient.executeQuery(`
        mutation {
          createAccountAttestation(input: {
            content: {
              uid: "${uid}"
              schema: "${message.schema}"
              attester: "${account}"
              verifyingContract: "${domain.verifyingContract}"
              easVersion: "${domain.version}"
              version: ${message.version}
              chainId: ${domain.chainId}
              r: "${signature.r}"
              s: "${signature.s}"
              v: ${signature.v}
              types: ${JSON.stringify(types.Attest)
                .replaceAll('"name"', "name")
                .replaceAll('"type"', "type")}
              recipient: "${message.recipient}"
              refUID: "${message.refUID}"
              data: "${message.data}"
              time: ${message.time}
            }
          }) 
          {
            document {
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
      `);
        console.log(data);
        return res.json({
          data,
        });
      }
    }
  } catch (err) {
    return res.json({
      err,
    });
  }
}
