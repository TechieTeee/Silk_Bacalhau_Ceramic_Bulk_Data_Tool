import React, { use, useEffect, useState, useRef } from "react";
import Head from "next/head";
import { Survey } from "survey-react-ui";
import TextareaAutosize from "react-textarea-autosize";
import { Model } from "survey-core";
import snapshot from "@snapshot-labs/snapshot.js";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { useOrbis, User } from "@orbisclub/components";
import { Web3Provider } from "@ethersproject/providers";
import { getActiveProposals, getSingleProposal } from "../utils/snapshot";
import { set } from "zod";

const surveyJson = {
  elements: [
    {
      name: "title",
      title: "Title:",
      type: "text",
    },
    {
      name: "body",
      title: "Body:",
      type: "text",
    },
    {
      name: "choices",
      title: "Choices (comma-separated):",
      type: "text",
    },
  ],
};

export default function Create() {
  const { orbis, user, setConnectModalVis } = useOrbis();
  const [create, setCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState(0);
  const [surv, setSurv] = useState();
  const [choices, setChoices] = useState([]);
  const [choice, setChoice] = useState("");
  const [reason, setReason] = useState("");
  const [toolbarStyle, setToolbarStyle] = useState({});
  const [type, setType] = useState("single-choice");
  const [voting, setVoting] = useState(false);
  const [proposal, setProposal] = useState({});
  const [proposals, setProposals] = useState([]);
  const [vote, setVote] = useState("");
  const textareaRef = useRef();
  const survey = new Model(surveyJson);
  survey.onComplete.add(onCompleteProposal);

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

      const hub = "https://hub.snapshot.org"; // or https://testnet.hub.snapshot.org for testnet
      const client = new snapshot.Client712(hub);

      // TODO: Likely, these values will come from user input
      const type = "single-choice";
      // const title = 'Test proposal using Snapshot.js';
      // const body = 'This is the content of the proposal';
      // const choices = ['Alice', 'Bob', 'Carol'];
      const start = Math.floor(Date.now() / 1000); // Start now
      const end = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 5; // End 5 days from now
      const blockNumberSnapshot = 13620822;

      const receipt = await client.proposal(web3, account, {
        space: "test space", // TODO: Replace with your space name
        type,
        title,
        body,
        choices,
        start,
        end,
        snapshot: blockNumberSnapshot,
        network: "1",
        plugins: JSON.stringify({}),
        app: "my-app", // TODO: Replace with the name of your project which is using this snapshot.js integration
      });

      console.log("receipt", receipt);

      alert("Proposal created! Check the console for the receipt.");
    } catch (err) {
      // Temporary error handling
      console.error(err);
      alert("Error creating proposal. Check the console for details.");
    }
  }

  const completeProposal = async () => {
    try {
      const provider = window.selectedEthereumProvider ?? window.ethereum;
      const web3 = new Web3Provider(provider);
      const [account] = await web3.listAccounts();

      const hub = "https://hub.snapshot.org"; // or https://testnet.hub.snapshot.org for testnet
      const client = new snapshot.Client712(hub);
      const start = Math.floor(Date.now() / 1000); // Start now
      const end = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 5; // End 5 days from now
      const blockNumberSnapshot = 13620822;
      const prop = {
        space: "rh2o.eth", // TODO: Replace with your space name
        type,
        title,
        body,
        choices,
        start,
        end,
        snapshot: blockNumberSnapshot,
        network: "1",
        plugins: JSON.stringify({}),
        app: "WaterLab", // TODO: Replace with the name of your project which is using this snapshot.js integration
      };
      console.log("prop", prop);

      const receipt = await client.proposal(web3, account, {
        space: "rh2o.eth", // TODO: Replace with your space name
        type,
        title,
        body,
        choices,
        start,
        end,
        snapshot: blockNumberSnapshot,
        network: "1",
        plugins: JSON.stringify({}),
        app: "WaterLab", // TODO: Replace with the name of your project which is using this snapshot.js integration
      });

      console.log("receipt", receipt);
      if (receipt.id) {
        setTitle("");
        setBody("");
        setChoices([]);
        setChoice("");
        setType("single-choice");
      }
      setCreate(false)
    } catch (err) {
      // Temporary error handling
      console.error(err);
      alert("Error creating proposal. Check the console for details.");
      setCreate(false)
    }
  };

  const completeVote = async (proposal) => {
    if (!reason) {
      alert("Please provide a reason for your vote.");
      return;
    }
    try {
      const provider = window.selectedEthereumProvider ?? window.ethereum;
      const web3 = new Web3Provider(provider);
      const [account] = await web3.listAccounts();

      const hub = "https://hub.snapshot.org"; // or https://testnet.hub.snapshot.org for testnet
      const client = new snapshot.Client712(hub);

      const prop = {
        space: "rh2o.eth",
        proposal,
        type: "single-choice",
        choice: 1,
        reason,
        app: "my-app",
      };
      console.log("prop", prop);

      const receipt = await client.vote(web3, account, prop);

      console.log("receipt", receipt);
      if (receipt.id) {
        alert("Vote submitted!");
        setTitle("");
        setBody("");
        setChoices([]);
        setChoice("");
        setReason("");
        setType("single-choice");
        setVoting(false);
      }
    } catch (err) {
      // Temporary error handling
      console.error(err);
      alert("Error creating proposal. Check the console for details.");
    }
  };

  const getProposal = async (id) => {
    setVoting(true);
    const prop = await getSingleProposal(id);
    const arr = prop.proposal.choices;
    const choices = arr.map((choice) => {
      return { value: choice, text: choice };
    });
    console.log("choices", choices);
    const json = {
      showCompletedPage: "false",
      showQuestionNumbers: false,
      focusFirstQuestionAutomatic: false,
      completeText: "Submit",
      title: "Snapshot Voting",
      description: prop.proposal.body,
      elements: [
        {
          type: "radiogroup",
          isRequired: true,
          name: "feature",
          title: prop.proposal.title,
          showOtherItem: false,
          choices,
        },
      ],
    };
    const survey = new Model(json);
    // survey.onComplete.add(onCompleteProposal);
    setSurv(survey);

    const provider = window.selectedEthereumProvider ?? window.ethereum;
    const web3 = new Web3Provider(provider);
    const ens = await web3.lookupAddress(prop.proposal.author);
    console.log("ens", ens);
    if (ens !== null) {
      prop.proposal.author = ens;
    }
    console.log("prop", prop.proposal);
    setProposal({ ...prop.proposal });
    console.log("proposal", proposal);
  };

  useEffect(() => {
    if (global.orbis_context) {
      console.log(global.orbis_context);
    }
    if (user) {
    }
    getActiveProposals()
      .then((data) => {
        if (data?.proposals) {
          setProposals(data.proposals);
        } else {
          console.error("No proposals found");
        }
      })
      .catch(console.error);
  }, []);

  return (
    <>
      <Head>
        {/** Title */}
        <title key="title">Create a New Proposal | WaterDAO </title>
        <meta
          property="og:title"
          content="Create a New Proposal | WaterDAO Hub"
          key="og_title"
        />

        {/** Description */}
        <meta
          name="description"
          content="Create a New Proposal"
          key="description"
        ></meta>
        <meta
          property="og:description"
          content="Create a New Proposal"
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
                title="Create a New Proposal on the WaterDAO Hub"
                description="You are about to share a new proposal. Make sure to read our rules before doing so."
                image
              />

              {/* Page content */}
              <section>
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                  <div className="md:flex md:justify-between">
                    {/* Show post editor or connect button */}
                    <div className="md:grow pt-0 pb-12 pr-10">
                      {user && !voting ? (
                        <>
                          {create ? (
                            <>
                              <>
                                {/** Title */}
                                <TextareaAutosize
                                  className="resize-none w-full h-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                  placeholder="Type your proposal title here"
                                  value={title}
                                  onChange={(e) => setTitle(e.target.value)}
                                />

                                {/** Formatting toolbar container */}
                                <div
                                  className="flex -mb-px mt-4 space-x-2 items-center z-10 bg-gray-50 rounded-t-md border border-gray-300 p-1"
                                  style={toolbarStyle}
                                ></div>

                                {/** Actual content of the blog post */}
                                <TextareaAutosize
                                  ref={textareaRef}
                                  className="resize-none w-full h-full p-3 border border-gray-300 rounded-b-md min-height-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                  placeholder="Write your proposal content here..."
                                  value={body}
                                  onChange={(e) => setBody(e.target.value)}
                                />
                                <div>Select Voting Type</div>
                                <form className="px-4 py-3 m-3">
                                  <select
                                    className="text-center text-black"
                                    onChange={(e) => setType(e.target.value)}
                                    value={type}
                                  >
                                    <option value="single-choice">
                                      Single Choice
                                    </option>
                                  </select>
                                </form>
                                {type !== "basic" && (
                                  <TextareaAutosize
                                    ref={textareaRef}
                                    className="resize-none w-full h-full p-3 border border-gray-300 rounded-b-md min-height-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                    placeholder="Enter comma-separated choices here..."
                                    value={choice}
                                    onChange={(e) => {
                                      if (e.target.value.includes(",")) {
                                        setChoices([
                                          ...choices,
                                          e.target.value.slice(
                                            0,
                                            e.target.value.indexOf(",")
                                          ),
                                        ]);
                                        setChoice("");
                                      } else {
                                        setChoice(e.target.value);
                                      }
                                    }}
                                  />
                                )}
                                <div className="flex flex-row space-x-2">
                                  {choices.map((choice, index) => (
                                    <div key={index}>{choice}</div>
                                  ))}
                                </div>
                                <button
                                  className="btn-sm py-1.5 btn-main mr-2"
                                  onClick={() => completeProposal()}
                                >
                                  Create Proposal
                                </button>

                                {status == 1 && (
                                  <button className="btn-sm w-full bg-brand bg-brand-hover mt-2">
                                    Loading...
                                  </button>
                                )}

                                {/** success status */}
                                {status == 2 && (
                                  <button className="btn-sm w-full text-slate-100 bg-green-500 mt-2">
                                    Success
                                  </button>
                                )}
                              </>
                              <button
                                className="btn-sm py-1.5 btn-secondary mt-3"
                                onClick={() => setCreate(false)}
                              >
                                Back
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="btn-sm py-1.5 btn-main"
                                onClick={() => setCreate(true)}
                              >
                                Create a Proposal
                              </button>
                            </>
                          )}
                        </>
                      ) : user && voting ? (
                        <>
                          <div className="">
                            <h2 className="text-1xl text-secondary mb-2">
                              Proposal Title: <br />
                              <span className="text-2xl">{proposal.title}</span>
                            </h2>
                            <p className="text-base text-secondary mb-2">
                              Created By: <br />
                              <span className="text-xl">{proposal.author}</span>
                            </p>
                            <p className="text-base text-secondary mb-2">
                              Description: <br />
                              <span className="">{proposal.body}</span>
                            </p>

                            {proposal.choices &&
                              proposal.choices.length > 0 && (
                                <div className="flex flex-col">
                                  <h3 className="text-lg text-secondary">
                                    Choices
                                  </h3>
                            
                                    <select
                                      className="text-center text-black mt-2 mb-2 w-1/2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                      onChange={(e) => setVote(e.target.value)}
                                    >
                                      {proposal.choices.map((choice, index) => (
                                        <option key={index} value={choice}>
                                          {choice}
                                        </option>
                                      ))}
                                    </select>
                               
                                  <TextareaAutosize
                                    className="resize-none w-full h-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                    placeholder="Reason for your choice"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                  />
                                </div>
                              )}
                            {/* {surv && <Survey model={surv} className='sa-poll-table'/>} */}
                          </div>
                          <button
                            className="btn-sm py-1.5 btn-main mt-2 mr-2"
                            onClick={() => {
                              completeVote(proposal.id);
                            }}
                          >
                            Vote
                          </button>
                          <button
                            className="btn-sm py-1.5 btn-secondary mt-2"
                            onClick={() => setVoting(false)}
                          >
                            Back
                          </button>
                        </>
                      ) : (
                        <div className="w-full text-center bg-slate-50 rounded border border-primary bg-secondary p-6">
                          <p className="text-base text-secondary mb-2">
                            You must be connected to share a proposal in this
                            forum.
                          </p>
                          <button
                            className="btn-sm py-1.5 btn-main"
                            onClick={() => setConnectModalVis(true)}
                          >
                            Connect
                          </button>
                        </div>
                      )}

                      {!voting &&
                        proposals.map((proposal) => (
                          <div className="mt-8 text-white" key={proposal.id}>
                            <div className="flex justify-between items-center">
                              <h2>{proposal.title}</h2>
                              <button
                                className="btn-sm py-1.5 btn-brand"
                                onClick={async () => {
                                  // window.open(
                                  //   `https://snapshot.org/#/rh2o.eth/proposal/${proposal.id}`
                                  // );
                                  await getProposal(proposal.id);
                                }}
                              >
                                Vote
                              </button>
                            </div>
                          </div>
                        ))}
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
