import React, { use, useEffect, useState } from "react";
import Head from "next/head";
import Editor from "../components/Editor";
import { shortAddress } from "../utils";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { useOrbis, User } from "@orbisclub/components";
import { RotatingLines } from "react-loader-spinner";
import { set } from "zod";

export default function Create() {
  const { orbis, user, setConnectModalVis } = useOrbis();
  const [create, setCreate] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [attestations, setAttestations] = useState([]);
  const [checked, setChecked] = useState(false);
  const [recieved, setReceived] = useState([]);
  const [given, setGiven] = useState([]);
  const [unique, setIsUnique] = useState(0);

  useEffect(() => {
    if (user) {
      checkHolo(user.metadata.address);
      grabAttestations();
    }
  }, []);

  async function checkHolo(address) {
    const resp = await fetch(
      `https://api.holonym.io/sybil-resistance/phone/optimism?user=${address}&action-id=123456789`
    );
    const { result: isUnique } = await resp.json();
    console.log(isUnique);
    if (isUnique) {
      await grabAttestations();
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
    const receipt = [];
    const give = [];
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
    arr.forEach((a) => {
      if (a.given) {
        give.push(a);
      } else {
        receipt.push(a);
      }
    });
    console.log(arr);
    setAttestations(arr);
    setReceived(receipt);
    setGiven(give);
    setLoaded(true);
  }

  return (
    <>
      <Head>
        {/** Title */}
        <title key="title">View Attestations | WaterDAO Hub</title>
        <meta
          property="og:title"
          content="View Attestations | WaterDAO Hub"
          key="og_title"
        />

        {/** Description */}
        <meta
          name="description"
          content="Discuss the future of WaterDAO"
          key="description"
        ></meta>
        <meta
          property="og:description"
          content="Discuss the future of WaterDAO"
          key="og_description"
        />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <div className="flex flex-col min-h-screen overflow-hidden supports-[overflow:clip]:overflow-clip bg-main">
        <div className="antialiased">
          <div className="min-h-screen flex">
            {/*  Page content */}
            <main className="grow overflow-hidden">
              <section>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-5">
                  {loaded && attestations.length ? (
                    attestations.map((a, i) => {
                      return (
                        // eslint-disable-next-line react/jsx-key
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
                                href={`https://ceramic-arcanumsci-mainnet.hirenodes.io/api/v0/streams/${a.id}`}
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
                      />{" "}
                    </div>
                  )}
                  {loaded && (
                    <p className="text-center mt-3">
                      {recieved.length} / 3 User Attestations Received
                      <br />
                      {given.length} User Attestations Given
                      <br />
                      You must recieve {3 - recieved.length} more attestations
                      to become verified
                    </p>
                  )}
                </div>
              </section>
            </main>
          </div>
        </div>

        {/*  Site footer */}
        <Footer />
      </div>
    </>
  );
}
