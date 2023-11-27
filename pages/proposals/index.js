import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import snapshot from '@snapshot-labs/snapshot.js';
import { Web3Provider } from '@ethersproject/providers';

import Header from '../../components/Header';
import Hero from '../../components/Hero';
import Sidebar from '../../components/Sidebar';
import PostItem from '../../components/PostItem';
import Footer from '../../components/Footer';
import { LoadingCircle } from "../../components/Icons";
import { Orbis, useOrbis } from "@orbisclub/components";
import useDidToAddress from "../../hooks/useDidToAddress";
import { getActiveProposals } from '../../utils/snapshot';

function ProposalsHome() {
  const { orbis, user } = useOrbis();

  return (
    <>
      <Head>
        {/** Title */}
        <title key="title">BanklessDeSci Community Hub | Orbis</title>
        <meta property="og:title" content="BanklessDeSci Community Hub | BanklessDAO" key="og_title" />

        {/** Description */}
        <meta name="description" content="An open and decentralized social application. Built using Ceramic and Orbis Protocol." key="description"></meta>
        <meta property="og:description" content="An open and decentralized social application. Built using Ceramic and Orbis Protocol." key="og_description"/>
        <link rel="icon" href="/favicon.png" />
      </Head>
      <div className="flex flex-col min-h-screen overflow-hidden supports-[overflow:clip]:overflow-clip bg-main">
        <div className="antialiased">
          <div className="min-h-screen flex">

            {/*  Page content */}
            <main className="grow overflow-hidden">

              {/*  Site header */}
              <Header />

              {/* Hero section with main title and description */}
              <Hero title="BanklessDeSci Community Hub" description="Doing science without permission" />

              {/* Page content */}
              <section>

                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                  <div className="md:flex md:justify-between">

                    {/* Main content */}
                    <div className="md:grow pt-3 pb-12 md:pb-20">
                      <div className="md:pr-6 lg:pr-10">
                        <CreateProposal />

                        <Proposals />
                      </div>
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

const CreateProposal = () => {
  return(
    <div className="border-b border-primary pb-6 mb-6">
      <div className="text-center md:text-left md:flex justify-between items-center">

        <div className="mb-4 md:mb-0 md:order-1 md:ml-6">
          {/* <Link className="btn-sm py-1.5 btn-brand" href="/create-post">Create Post</Link> */}
          <button 
            className="btn-sm py-1.5 btn-brand" 
            onClick={async () => {
              const web3 = new Web3Provider(window.ethereum);
              const [account] = await web3.listAccounts();

              const hub = 'https://hub.snapshot.org'; // or https://testnet.hub.snapshot.org for testnet
              const client = new snapshot.Client712(hub);

              // TODO: Likely, these values will come from user input
              const type = 'single-choice';
              const title = 'Test proposal using Snapshot.js';
              const body = 'This is the content of the proposal';
              const choices = ['Alice', 'Bob', 'Carol'];
              const start = Math.floor(Date.now() / 1000); // Start now
              const end = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 5; // End 5 days from now
              const snapshot = 13620822;

              const receipt = await client.proposal(web3, account, {
                space: 'banklessdesci.eth', // TODO: Replace with your space name
                type,
                title,
                body,
                choices,
                start,
                end,
                snapshot,
                network: '1',
                plugins: JSON.stringify({}),
                app: 'my-app' // TODO: Replace with the name of your project which is using this snapshot.js integration
              });

              console.log('receipt', receipt)

              alert('Proposal created! Check the console for the receipt.')
            }}
          >
            Create Proposal
          </button>
        </div>

      </div>
    </div>
  )
}


/**
 * @typedef {Object} Proposal
 * @property {string} id
 * @property {string} title
 * @property {string} body
 * @property {string[]} choices
 * @property {number} start
 * @property {number} end
 * @property {string} state
 * @property {string} author
 * @property {Object} space
 * @property {string} space.id
 * @property {string} space.name
 */

const Proposals = () => {
  const [proposals, setProposals] = useState([]);

  useEffect(() => {
    getActiveProposals()
      .then((data) => {
        if (data?.proposals) {
          setProposals(data.proposals);
        } else {
          console.error('No proposals found');
        }
      })
      .catch(console.error)
  }, []);

  return (
    <>
      <p className="text-2xl text-white font-bold mb-4">Active Proposals</p>

      {proposals.length === 0 && (
        <div className="flex justify-center items-center h-32">
          <LoadingCircle className="animate-spin h-8 w-8 text-white" />
        </div>
      )}

      {proposals.map((proposal) => (
        <div className="mb-4 text-white" key={proposal.id}>
          <div className="flex justify-between items-center">
            <h2>{proposal.title}</h2>
            <button
              className="btn-sm py-1.5 btn-brand"
              onClick={async () => {
                const web3 = new Web3Provider(window.ethereum);
                const [account] = await web3.listAccounts();

                const hub = 'https://hub.snapshot.org'; // or https://testnet.hub.snapshot.org for testnet
                const client = new snapshot.Client712(hub);
                
                // TODO: Likely, these values will come from user input
                const choice = 0 // Replace with the choice index
                const space = 'banklessdesci.eth'; // TODO: Replace with your space name

                const receipt = await client.vote(web3, account, {
                  proposal: proposal.id,
                  choice,
                  space,
                  network: '1',
                  plugins: JSON.stringify({}),
                  app: 'my-app' // TODO: Replace with the name of your project which is using this snapshot.js integration
                });

                console.log('receipt', receipt)

                alert('Vote submitted! Check the console for the receipt.')
              }}
            >
              Vote
            </button>
          </div>
        </div>
      ))}
    </>
  )
}

export default ProposalsHome;
