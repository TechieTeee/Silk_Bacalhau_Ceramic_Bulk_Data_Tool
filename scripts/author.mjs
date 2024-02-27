import { randomBytes } from "crypto";
import { toString } from "uint8arrays/to-string";

export const RunCommands = async () => {
  const generateAdminKeyDid = async () => {
    const seed = new Uint8Array(randomBytes(32));
    return {
      author_key: toString(seed, "base16"),
    };
  };
  const item = await generateAdminKeyDid();
  console.log(item);
};
RunCommands();
