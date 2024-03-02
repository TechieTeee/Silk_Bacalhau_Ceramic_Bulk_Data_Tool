import React, { useState, useRef, useEffect } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { useOrbis } from "@orbisclub/components";
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { EASContractAddress, CUSTOM_SCHEMAS } from "../utils/utils";
import { ethers } from "ethers";
import { shortAddress } from "../utils";
import { RotatingLines } from "react-loader-spinner";
import { initSilk } from "@silk-wallet/silk-wallet-sdk";
import { Alchemy, Network } from "alchemy-sdk";
import { env } from "../env.mjs";
import { CeramicClient } from "@ceramicnetwork/http-client";

const { NEXT_PUBLIC_ALCHEMY_API_KEY } = env;

const AttestEditor = ({ context }) => {
  const eas = new EAS(EASContractAddress);
  const { orbis, user, credentials } = useOrbis();
  const [unique, setIsUnique] = useState(0);
  const [checked, setChecked] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [attestations, setAttestations] = useState([]);
  const textareaRef = useRef();
  const config = {
    apiKey: NEXT_PUBLIC_ALCHEMY_API_KEY,
    network: Network.ETH_MAINNET,
  };
  const alchemy = new Alchemy(config);

  const ceramic = new CeramicClient("https://ceramic-clay.3boxlabs.com");

  /** Will load the details of the context and check if the user has access to it  */
  useEffect(() => {
    if (user) {
      checkHolo(user.metadata.address);
    }
    setChecked(true);
    grabAttestations();
  }, []);

  const switchNetwork = async () => {
    if (window.ethereum) {
      try {
        // Try to switch to the Mumbai testnet
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x1" }],
        });
      } catch (error) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (error.code === 4902) {
          try {
            // Try to have the user add the chain
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x1",
                  rpcUrls: ["https://mainnet.infura.io/v3/"],
                },
              ],
            });
          } catch (addError) {
            // handle "add" error
          }
        }
      }
    }
  };

  async function checkHolo(address) {
    const resp = await fetch(
      `https://api.holonym.io/sybil-resistance/phone/optimism?user=${address}&action-id=123456789`
    );
    const { result: isUnique } = await resp.json();
    if (isUnique) {
      setIsUnique(1);
    } else {
      setIsUnique(2);
    }
  }

  async function grabAttestations() {
    const requestBody = {
      account: user.metadata.address.toLowerCase(),
    };
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    };
    const gotAttestations = await fetch(
      "/api/getattestations",
      requestOptions
    ).then((response) => response.json());
    if (gotAttestations.data.accountAttestationIndex === null) {
      console.log(gotAttestations.data);
      return;
    }
    console.log(gotAttestations.data.accountAttestationIndex.edges.length);
    const arr = [];
    for (
      let i = 0;
      i < gotAttestations.data.accountAttestationIndex.edges.length;
      i++
    ) {
      const obj = {
        given:
          gotAttestations.data.accountAttestationIndex.edges[i].node
            .attester === user.metadata.address.toLowerCase()
            ? true
            : false,
        attester:
          gotAttestations.data.accountAttestationIndex.edges[i].node.attester,
        recipient:
          gotAttestations.data.accountAttestationIndex.edges[i].node.recipient,
        id: gotAttestations.data.accountAttestationIndex.edges[i].node.id,
      };

      arr.push(obj);
    }
    setAttestations(arr);
    setLoaded(true);
  }

  async function attest(address) {
    const network = await ethereum.request({ method: "eth_chainId" });
    if (network !== "0x1") {
      await switchNetwork();
    }
    if (!address) {
      alert("Please enter a recipient address");
      setRecipient("");
      return;
    }
    if (address.includes(".eth")) {
      if (NEXT_PUBLIC_ALCHEMY_API_KEY) {
        const resolved = await alchemy.core.resolveName(address);
        address = resolved;
      } else {
        alert("ENS names not yet supported");
        setRecipient("");
        return;
      }
    }
    if (address.toLowerCase() === user.metadata.address.toLowerCase()) {
      alert("You cannot attest to yourself");
      setRecipient("");
      return;
    }

    const schemaEncoder = new SchemaEncoder("address account");
    const encoded = schemaEncoder.encodeData([
      { name: "account", type: "address", value: address },
    ]);

    const offchain = await eas.getOffchain();
    const time = Math.floor(Date.now() / 1000);
    const offchainAttestation = await offchain.signOffchainAttestation(
      {
        recipient: address.toLowerCase(),
        expirationTime: 0,
        time,
        revocable: true,
        version: 1,
        nonce: 0,
        schema: CUSTOM_SCHEMAS.ACCOUNT_SCHEMA,
        refUID:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        data: encoded,
      },
      signer
    );

    const requestBody = {
      ...offchainAttestation,
      account: user.metadata.address.toLowerCase(),
    };
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    };

    // Call attest API endpoint to store attestation on CeramicDB
    await ceramic.createDocument("tile", {
      content: {
        ...offchainAttestation,
        account: user.metadata.address.toLowerCase(),
      },
    });

    // You may need to handle the response from the Ceramic createDocument method
    // to ensure the document has been created successfully.

    setRecipient("");
    grabAttestations();
  }

  const handleAddressChange = (e) => {
    setRecipient(e.target.value);
  };

  return (
    <div className="container mx-auto text-gray-900">
      {checked && (
        <div className="w-full">
          {unique === 1 && (
            <div>
              <TextareaAutosize
                ref={textareaRef}
                className="resize-none w-full h-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                placeholder="Recipient Eth address here"
                value={recipient}
                onChange={handleAddressChange}
              />
              <button
                className="btn-sm py-1.5 btn-brand"
                onClick={() => attest(recipient)}
              >
                Attest
              </button>
              <div className="w-full text-center bg-white/10 rounded border border-[#619575] p-6 mt-5">
                <p className="text-base text-secondary mb-2">
                  Current Attestations:
                </p>
                {loaded && attestations.length ? (
                  attestations.map((a, i) => {
                    return (
                      <div key={i} className="flex flex-row justify-between">
                        <div className="flex flex-row">
                          <p className="text-base text-secondary mb-2">
                            {shortAddress(a.attester)}&nbsp;
                          </p>
                          <p className="text-base text-secondary mb-2">
                            {a.given ? "gave to " : "received from "}&nbsp;
                          </p>
                          <p className="text-base text-secondary mb-2">
                            {shortAddress(a.recipient)}
                          </p>
                        </div>
                        <div className="flex flex-row">
                          <p className="text-base text-secondary mb-2 text-right">
                            <a
                              href={`https://ceramic-clay.3boxlabs.com/${a.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-500"
                            >
                              Proof
                            </a>
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : loaded && !attestations.length ? (
                  <p className="text-base text-secondary mb-2">
                    No attestations yet
                  </p>
                ) : (
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <RotatingLines
                      strokeColor="grey"
                      strokeWidth="5"
                      animationDuration="0.75"
                      width="96"
                      visible={true}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          {unique === 2 && (
            <div className="w-full text-center bg-white/10 rounded border border-[#619575] p-6">
              <p className="text-base text-secondary mb-2">
                You can't create attestations yet. Click the button below and
                create a unique identity using your phone number to become a
                verified user.
              </p>
              <button
                className="btn-sm py-1.5 btn-brand"
                onClick={() =>
                  window.open("https://silksecure.net/holonym/silk")
                }
              >
                Visit Silk by Holonym
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AttestEditor;