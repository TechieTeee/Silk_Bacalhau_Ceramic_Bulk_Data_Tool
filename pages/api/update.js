import { Orbis } from "@orbisclub/components";
import { fromString } from "uint8arrays/from-string";

const CONTEXT = process.env.ORBCONTEXT;
const SEED = process.env.SEED;

export default async function updateContext(req, res) {
  let orbis = new Orbis({
    node: "https://node2.orbis.club",
    PINATA_GATEWAY: "https://orbis.mypinata.cloud/ipfs/",
    PINATA_API_KEY: process.env.NEXT_PUBLIC_PINATA_API_KEY,
    PINATA_SECRET_API_KEY: process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY,
  });

  const key = fromString(SEED, "base16");
  const connected = await orbis.connectWithSeed(key);
  console.log(connected, "connected");
  const whiteList = req.body;
  
  try {
    // wait 2 seconds before continuing with the below
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log(whiteList, "whiteList");
    console.log(CONTEXT, "context");
    const currContext = await orbis.getContext(CONTEXT);
    console.log(currContext, "currContext");
    console.log(currContext.data.content);
    const currAccessRules = currContext.data.content.accessRules.filter(
      (item) => item.type === "did"
    );
    const currWhiteList = currAccessRules[0].authorizedUsers;
    console.log(
      currWhiteList.length === whiteList.length,
      "currWhiteList === whiteList"
    );
    if (currWhiteList.length === whiteList.length) {
      return res.json({
        message: "No changes required",
      });
    }
    const mapped = whiteList.map((item) => {
      return { did: item };
    });
    const update = await orbis.updateContext(CONTEXT, {
      ...currContext.data.content,
      accessRules: [
        {
          type: "did",
          authorizedUsers: mapped,
        },
      ],
    });
    console.log(update);
    return res.json(update);
  } catch (err) {
    res.json({
      err,
    });
  }
}
