import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import 'survey-core/defaultV2.min.css';
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
        <title key="title">WaterLab Community Hub | Orbis</title>
        <meta property="og:title" content="WaterLab Community Hub | WaterLab" key="og_title" />

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
              <Hero title="WaterLab Community Hub" description="A decentralized research organization" />

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

const surveyJson = {
  elements: [{
    name: "title",
    title: "Title:",
    type: "text"
  }, {
    name: "body",
    title: "Body:",
    type: "text"
  }, {
    name: "choices",
    title: "Choices (comma-separated):",
    type: "text"
  }]
};

async function onCompleteProposal(survey) {
  try {
    const values = survey.data;
    const { title, body, choices } = values;

    // TODO: Validate title, body, and choices. For example, make sure they aren't empty.

    // Using selectedEthereumProvider on window is a hack so that we can
    // access the provider that was selected elsewhere in the app. For some
    // reason, orbis doesn't seem to expose the provider on the orbis object.
    const provider = window.selectedEthereumProvider ?? window.ethereum;

    const web3 = new Web3Provider(provider);
    const [account] = await web3.listAccounts();

    const hub = 'https://hub.snapshot.org'; // or https://testnet.hub.snapshot.org for testnet
    const client = new snapshot.Client712(hub);

    // TODO: Likely, these values will come from user input
    const type = 'single-choice';
    // const title = 'Test proposal using Snapshot.js';
    // const body = 'This is the content of the proposal';
    // const choices = ['Alice', 'Bob', 'Carol'];
    const start = Math.floor(Date.now() / 1000); // Start now
    const end = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 5; // End 5 days from now
    const blockNumberSnapshot = 13620822;

    const receipt = await client.proposal(web3, account, {
      space: 'rh2o.eth', // TODO: Replace with your space name
      type,
      title,
      body,
      choices: choices.split(',').map((choice) => choice.trim()),
      start,
      end,
      snapshot: blockNumberSnapshot,
      network: '1',
      plugins: JSON.stringify({}),
      app: 'WaterLab' // TODO: Replace with the name of your project which is using this snapshot.js integration
    });

    console.log('receipt', receipt)

    alert('Proposal created! Check the console for the receipt.')
  } catch (err) {
    // Temporary error handling
    console.error(err)
    alert('Error creating proposal. Check the console for details.');
  }
}

const CreateProposal = () => {
  const { user } = useOrbis();

  const survey = new Model(surveyJson);
  survey.onComplete.add(onCompleteProposal);
  
  return(
    <>
      {user ? (
        <Survey
          model={survey}
        />
      ) : (
        <p className='text-white'>Please connect wallet to create a proposal</p>
      )}
    </>
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
                const space = 'rh2o.eth'; // TODO: Replace with your space name

                const receipt = await client.vote(web3, account, {
                  proposal: proposal.id,
                  choice,
                  space,
                  network: '1',
                  plugins: JSON.stringify({}),
                  app: 'WaterLab' // TODO: Replace with the name of your project which is using this snapshot.js integration
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
