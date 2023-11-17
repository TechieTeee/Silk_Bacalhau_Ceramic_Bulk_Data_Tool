import React, { useState, useRef, useEffect } from "react";
import TextareaAutosize from "react-textarea-autosize";
import {
  useOrbis,
  User,
  AccessRulesModal,
  checkContextAccess,
} from "@orbisclub/components";
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import {
  EASContractAddress,
  getAddressForENS,
  CUSTOM_SCHEMAS,
} from "../utils/utils";
import { ethers } from "ethers";
import ReactTimeAgo from "react-time-ago";
import Link from "next/link";
import { shortAddress, getIpfsLink, getTimestamp, sleep } from "../utils";
import { useRouter } from "next/router";
import { ExternalLinkIcon, LinkIcon, CodeIcon, LoadingCircle } from "./Icons";
import ArticleContent from "./ArticleContent";

const AttestEditor = () => {
  const eas = new EAS(EASContractAddress);
  const { orbis, user, credentials } = useOrbis();
  const router = useRouter();
  const [categoryAccessRules, setCategoryAccessRules] = useState([]);
  const [accessRulesLoading, setAccessRulesLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [unique, setIsUnique] = useState(0);
  const [checked, setChecked] = useState(false);
  const [accessRulesModalVis, setAccessRulesModalVis] = useState(false);
  const [status, setStatus] = useState(0);
  const [recipient, setRecipient] = useState("");
  const [attestations, setAttestations] = useState([]);
  const [toolbarStyle, setToolbarStyle] = useState({});
  const [storedSelectionStart, setStoredSelectionStart] = useState(0);
  const [storedSelectionEnd, setStoredSelectionEnd] = useState(0);
  const [view, setView] = useState(0);
  const textareaRef = useRef();

  /** Will load the details of the context and check if user has access to it  */
  useEffect(() => {
    if (user) {
      checkHolo(user.metadata.address);
    }
    setChecked(true);
    grabAttestations();
  }, []);

  async function checkHolo(address) {
    const resp = await fetch(
      `https://api.holonym.io/sybil-resistance/phone/optimism?user=${address}&action-id=123456789`
    );
    const { result: isUnique } = await resp.json();
    console.log(isUnique);
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
    const attestations = await fetch(
      "/api/getattestations",
      requestOptions
    ).then((response) => response.json());
    console.log(attestations);
    for (
      let i = 0;
      i < attestations.data.accountAttestationIndex.edges.length;
      i++
    ) {
      const obj = {
        given:
          attestations.data.accountAttestationIndex.edges[i].node.attester ===
          user.metadata.address.toLowerCase()
            ? true
            : false,
        attester:
          attestations.data.accountAttestationIndex.edges[i].node.attester,
        recipient:
          attestations.data.accountAttestationIndex.edges[i].node.recipient,
      };
      setAttestations((attestations) => [...attestations, obj]);
    }
  }

  async function attest(address) {
    if (!address) {
      alert("Please enter a recipient address");
      return;
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    eas.connect(signer);

    const schemaEncoder = new SchemaEncoder("address account");
    const encoded = schemaEncoder.encodeData([
      { name: "account", type: "address", value: address },
    ]);
    console.log(window.ethereum);
    const offchain = await eas.getOffchain();
    console.log(offchain);
    const time = Math.floor(Date.now() / 1000);
    const offchainAttestation = await offchain.signOffchainAttestation(
      {
        recipient: address.toLowerCase(),
        // Unix timestamp of when attestation expires. (0 for no expiration)
        expirationTime: 0,
        // Unix timestamp of current time
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
    // un-comment the below to process an on-chain timestamp
    // const transaction = await eas.timestamp(offchainAttestation.uid);
    // // Optional: Wait for the transaction to be validated
    // await transaction.wait();
    console.log(offchainAttestation);
    const requestBody = {
      ...offchainAttestation,
      account: user.metadata.address.toLowerCase(),
    };
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    };
    // call attest api endpoint to store attestation on ComposeDB
    await fetch("/api/attest", requestOptions)
      .then((response) => response.json())
      .then((data) => console.log(data));
    setRecipient("");
  }

  /** Will update title field */
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
                {attestations.map((a) => {
                  return (
                    // eslint-disable-next-line react/jsx-key
                    <div className="flex flex-row justify-between items-center">
                      <div className="flex flex-row items-center">
                        <p className="text-base text-secondary mb-2">
                          {a.given ? "Given to " : "Received from "}
                        </p>
                        <p className="text-base text-secondary mb-2">
                          {a.given
                            ? shortAddress(a.recipient)
                            : shortAddress(a.attester)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {unique === 2 && (
            <div className="w-full text-center bg-white/10 rounded border border-[#619575] p-6">
              <p className="text-base text-secondary mb-2">
                {/* eslint-disable-next-line react/no-unescaped-entities */}
                You can't create attestations yet. Click the button below and
                create a unique identity using your phone number to get started.
              </p>
              <button
                className="btn-sm py-1.5 btn-brand"
                onClick={() => window.open("https://app.holonym.id/issuance")}
              >
                Visit Holonym
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default AttestEditor;
