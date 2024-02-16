import React, { use, useEffect, useState } from "react";
import Head from "next/head";
import Editor from "../components/Editor";
import AttestEditor from "../components/AttestEdit";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { useOrbis, User } from "@orbisclub/components";

export default function Create() {
  const { orbis, user, setConnectModalVis } = useOrbis();
  const [create, setCreate] = useState(false);

  useEffect(() => {
    if(global.orbis_context){
      console.log(global.orbis_context);
    }
    if (user) {
    }
  }, []);

  return (
    <>
      <Head>
        {/** Title */}
        <title key="title">Share a new post | WaterDO Hub</title>
        <meta
          property="og:title"
          content="Share a new post | WaterLab Hub"
          key="og_title"
        />

        {/** Description */}
        <meta
          name="description"
          content="Discuss the future of WaterLab"
          key="description"
        ></meta>
        <meta
          property="og:description"
          content="Discuss the future of WaterLab"
          key="og_description"
        />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <div className="flex flex-col min-h-screen overflow-hidden supports-[overflow:clip]:overflow-clip bg-main">
        <div className="antialiased">
          <div className="min-h-screen flex">
            {/*  Page content */}
            <main className="grow overflow-hidden">
              {/*  Site header */}
              <Header />
              <Hero
                title="Sharing a new post on the WaterLab Hub"
                description="You are about to share a new post. Make sure to read our rules before doing so."
                image
              />

              {/* Page content */}
              <section>
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                  <div className="md:flex md:justify-between">
                    {/* Show post editor or connect button */}
                    <div className="md:grow pt-0 pb-12 pr-10">
                      {user ? (
                        <>
                          
                          {create ? (
                            <>
                            <AttestEditor context={global.orbis_context}/>
                            <button
                                className="btn-sm py-1.5 btn-secondary mt-3"
                                onClick={() => setCreate(false)}
                              >
                                Back
                              </button>
                            </>
                          ) : (
                            <>
                            <Editor />
                            <div className="w-full text-center bg-slate-50 rounded border border-primary bg-stone-300	 p-6">
                              <button
                                className="btn-sm py-1.5 btn-secondary"
                                onClick={() => setCreate(true)}
                              >
                                Create an Attestation
                              </button>
                            </div>
                            </>
                          )}
                        </>
                      ) : (
                        <div className="w-full text-center bg-slate-50 rounded border border-primary bg-secondary p-6">
                          <p className="text-base text-secondary mb-2">
                            You must be connected to share a post in this forum.
                          </p>
                          <button
                            className="btn-sm py-1.5 btn-main"
                            onClick={() => setConnectModalVis(true)}
                          >
                            Connect
                          </button>
                        </div>
                      )}
                    </div>
                    <Sidebar />
                  </div>
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
