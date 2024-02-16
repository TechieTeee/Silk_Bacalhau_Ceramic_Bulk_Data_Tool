import React, { use, useEffect, useState } from "react";
import Head from "next/head";
import Editor from "../components/Editor";
import Person from "../components/User";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { useOrbis, User } from "@orbisclub/components";

export default function Create() {
  const { orbis, user, setConnectModalVis } = useOrbis();
  const [create, setCreate] = useState(false);

  useEffect(() => {
    if (user) {
    }
  }, []);

  return (
    <>
      <Head>
        {/** Title */}
        <title key="title">View your attestations | WaterLab Hub</title>
        <meta
          property="og:title"
          content="View Attestations | WaterLab Hub"
          key="og_title"
        />

        {/** Description */}
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
                title="View Attestations You've Created or Recieved"
                description=""
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
                          <Person />
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
