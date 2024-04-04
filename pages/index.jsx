// pages/index.js or pages/index.tsx
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image"; 
import Header from "../components/Header";
import Hero from "../components/Hero";
import Sidebar from "../components/Sidebar";
import PostItem from "../components/PostItem";
import Footer from "../components/Footer";
import { LoadingCircle } from "../components/Icons";
import { useOrbis } from "@orbisclub/components";
import { useRouter } from 'next/router';
import Papa from "papaparse";

function Home({ defaultPosts }) {
  const { orbis, user } = useOrbis();
  const [nav, setNav] = useState("all");
  const [page, setPage] = useState(0);
  const [posts, setPosts] = useState();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [csvData, setCsvData] = useState([]);

  const router = useRouter();

  useEffect(() => {
    if (global.orbis_context) {
      loadContexts();
    }

    async function loadContexts() {
      let { data, error } = await orbis.api
        .from("orbis_contexts")
        .select()
        .eq("context", global.orbis_context)
        .order("created_at", { ascending: false });
      setCategories(data);
    }
  }, []);

  useEffect(() => {
    setPage(0);

    if (global.orbis_context) {
      loadPosts(nav === "all" ? global.orbis_context : nav, true, 0);
    }
  }, [nav]);

  useEffect(() => {
    if (global.orbis_context) {
      loadPosts(nav === "all" ? global.orbis_context : nav, true, page);
    }
  }, [page]);

  async function loadPosts(context, include_child_contexts, _page) {
    setLoading(true);
    let { data, error } = await orbis.api
      .rpc("get_ranked_posts", { q_context: context })
      .range(_page * 25, (_page + 1) * 50 - 1);

    if (data) {
      const applyVerified = async (items) => {
        const list = [];
        for (let i = 0; i < items.length; i++) {
          const requestBody = {
            account: items[i].creator_details.metadata.address.toLowerCase(),
          };
          const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          };
          const gotAttestations = await fetch(
            "/api/getAttestationsReceived",
            requestOptions
          ).then((response) => response.json());

          if (gotAttestations.data.accountAttestationIndex.edges.length > 0) {
            items[i].verified = true;
            items[i].attestationLength =
              gotAttestations.data.accountAttestationIndex.edges.length;
          } else {
            items[i].verified = false;
          }
          list.push(items[i]);
        }
        return list;
      };

      const newData = await applyVerified(data);

      setPosts(newData);
      console.log(newData);
    }
    setLoading(false);
  }

  const readDataFromCSV = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (event) => {
        const csvData = event.target.result;

        // Parse CSV using papaparse
        Papa.parse(csvData, {
          complete: (result) => {
            // CSV has a header row, result.data contains an array of objects
            const csvDataArray = result.data;
            setCsvData(csvDataArray);
            resolve(csvDataArray);
          },
          error: (error) => {
            reject(error.message);
          },
          header: true, // True if the CSV has a header row
        });
      };

      reader.readAsText(file);
    });
  };

  const storeDataInComposeDB = async (data) => {
    // Send data to ComposeDB
    const response = await fetch("/api/storeDataInComposeDB", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });

    return response.json();
  };

  const handleUploadButtonClick = async (event) => {
    const file = event.target.files[0];
    const csvData = await readDataFromCSV(file);

    // Limiting displayed rows to top 5 after upload
    const displayedRows = csvData.slice(0, 6); // Limiting to the top 5 rows, including title row
    setCsvData(displayedRows);

    // Store data in ComposeDB
    const storeResponse = await storeDataInComposeDB(csvData);
    console.log("Data Storage Response:", storeResponse);

    // Check if data is successfully stored and set uploadStatus accordingly
    if (storeResponse.success) {
      setUploadStatus('success');
      console.log('Upload successful');
    } else {
      setUploadStatus('failed');
      console.log('Upload failed');
    }

    // Call the API route to run the terminal command
    const commandResponse = await fetch('/api/runCommand');
    const commandData = await commandResponse.json();
    console.log("Command Response:", commandData);

    // Redirect to another page or perform other actions if needed
    router.push('/success');
  };

  const CategoriesNavigation = ({ categories, nav, setNav }) => {
    return (
      <div className="border-b border-primary pb-6 mb-6">
        <div className="text-center md:text-left md:flex justify-between items-center">
          <ul className="grow inline-flex flex-wrap text-sm font-medium -mx-3 -my-1">
            <NavItem
              selected={nav}
              category={{ stream_id: "all", content: { displayName: "All" } }}
              onClick={setNav}
            />
            {categories.map((category, key) => (
              <NavItem key={key} selected={nav} category={category} onClick={setNav} />
            ))}
          </ul>
          <div className="mb-4 md:mb-0 md:order-1 md:ml-6">
            <Link href="/create" className="btn-sm py-1.5 btn-brand">
              Create Post
            </Link>
            <label
              htmlFor="upload-data-input"
              className="btn-sm py-1.5 btn-main ml-2 cursor-pointer"
            >
              Upload Data
            </label>
          </div>
        </div>
        {/* Example Data Table */}
        <div className="mt-4">
          <div className="mb-2 text-white text-lg font-bold">Recent Readings</div>
          <table className="table-auto w-full text-white">
            <thead>
              <tr>
                {csvData && csvData.length > 0 && Object.keys(csvData[0]).map((key, index) => (
                  <th className="px-4 py-2" key={index}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {csvData.map((rowData, rowIndex) => (
                <tr key={rowIndex}>
                  {Object.values(rowData).map((data, columnIndex) => (
                    <td className="border px-4 py-2" key={columnIndex}>{data}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const NavItem = ({ selected, category, onClick }) => {
    return (
      <li className="px-3 py-1">
        <span
          className={`relative transition duration-150 ease-in-out ${
            selected == category.stream_id
              ? "text-brand underline underline-offset-4"
              : "cursor-pointer text-secondary hover:underline"
          }`}
          onClick={() => onClick(category.stream_id)}
        >
          {category.content.displayName}
        </span>
      </li>
    );
  };

  return (
    <>
      <Head>
        <title key="title">Water is Life</title>
        <meta
          property="og:title"
          content="Water is Life Community Hub"
          key="og_title"
        />
        <meta
          name="description"
          content="A research collaboration tool for citizen scientists to promote global, water quality"
          key="description"
        ></meta>
        <meta
          property="og:description"
          content="A research collaboration tool for citizen scientists to promote global, water quality"
          key="og_description"
        />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <div className="flex flex-col min-h-screen overflow-hidden supports-[overflow:clip]:overflow-clip bg-main">
        <div className="antialiased">
          <div className="min-h-screen flex">
            <main className="grow overflow-hidden">
              <Header />
              {/* Hero image */}
              <div className="relative h-96">
                <Image
                  src="/Silk_Hero_Image_Redesign.png"
                  alt="Water is Life Hero Image"
                  layout="fill"
                  objectFit="contain"
                  className="rounded-md"
                />
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center">
                  <h1 className="text-white font-Figtree text-3xl lg:text-4xl xl:text-4xl animate-pulse">
                    A Silk powered community
                  </h1>
                </div>
              </div>

              <Hero
                title={
                  <span
                    style={{
                      fontFamily: "Black Han Sans, Figtree",
                      fontWeight: 400,
                      fontStyle: "normal",
                    }}
                  >
                    Water is Life Community Hub
                  </span>
                }
                description="The Water is Life project aims to revolutionize water quality enhancement by uniting global citizen scientists through blockchain technology, decentralized identity, and automated data processing. With the mission to combat water-related diseases affecting 400,000 children annually, the initiative leverages tools like Silk Wallet for seamless Ethereum interaction, EAS for on-chain attestations, ComposeDB for secure data storage, and Bacalhau for automated data processing. Empowering individuals worldwide, the project fosters a decentralized group of citizen scientists working collaboratively to improve water quality, reducing the need for formal data science training while maximizing the impact of their crucial work."
              />
              <section>
                {global.orbis_context ? (
                  <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="md:flex md:justify-between">
                      <div className="md:grow pt-3 pb-12 md:pb-20">
                        <div className="md:pr-6 lg:pr-10">
                          <CategoriesNavigation
                            categories={categories}
                            nav={nav}
                            setNav={setNav}
                          />
                          {loading ? (
                            <div className="flex w-full justify-center p-3 text-primary">
                              <LoadingCircle />
                            </div>
                          ) : (
                            <>
                              {posts && posts.length > 0 ? (
                                <>
                                  <div className="mb-12">
                                    <div className="flex flex-col space-y-6 mb-8">
                                      {posts.map((post) => (
                                        <PostItem
                                          key={post.stream_id}
                                          post={post}
                                        />
                                      ))}
                                    </div>
                                    {posts && posts.length >= 25 && (
                                      <div className="text-right">
                                        <button
                                          className="btn-sm py-1.5 h-8 btn-secondary btn-secondary-hover"
                                          onClick={() => setPage(page + 1)}
                                        >
                                          Next page{" "}
                                          <span className="tracking-normal ml-1">
                                            -&gt;
                                          </span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </>
                              ) : (
                                <div className="w-full text-center bg-white/10 rounded border border-primary bg-secondary p-6">
                                  <p className="text-sm text-secondary">
                                    There aren't any posts shared here.
                                  </p>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      <Sidebar />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col md:pr-6 lg:pr-10 items-center">
                    <p className="text-base text-primary">
                      To get started you need to create your own context using
                      our Dashboard.
                    </p>
                    <ol className="text-base list-decimal text-sm text-primary list-inside text-center justify-center mt-3 w-2/3">
                      <li className="text-base">
                        Visit our Dashboard and create your own <b>Project</b>{" "}
                        and <b>Context</b>.
                      </li>
                      <li className="text-base">
                        Create categories for your community by adding{" "}
                        <b>sub-contexts</b> to the context you just created.
                      </li>
                      <li className="text-base">
                        Go into <b>_app.js</b> and update the{" "}
                        <b>global.orbis_context</b> value.
                      </li>
                    </ol>
                    <Link
                      href="https://useorbis.com/dashboard"
                      target="_blank"
                      className="btn-sm py-1.5 btn-main mt-6"
                    >
                      Go to Dashboard
                    </Link>
                  </div>
                )}
              </section>
            </main>
          </div>
        </div>
        <Footer />
      </div>
      <input
        type="file"
        accept=".csv"
        onChange={handleUploadButtonClick}
        className="hidden"
        id="upload-data-input"
      />
      {/* Render the success message conditionally */}
      {uploadStatus === "success" && (
        <div className="fixed bottom-0 left-0 right-0 bg-green-500 text-white p-4 text-center flex justify-between items-center">
          <p>Upload successful!</p>
          <button
            className="ml-4 text-white"
            onClick={() => setUploadStatus(null)}
          >
            Close
          </button>
        </div>
      )}
      {/* Render the failure message conditionally */}
      {uploadStatus === "failed" && (
        <div className="fixed bottom-0 left-0 right-0 bg-red-500 text-white p-4 text-center flex justify-between items-center">
          <p>Upload failed!</p>
          <button
            className="ml-4 text-white"
            onClick={() => setUploadStatus(null)}
          >
            Close
          </button>
        </div>
      )}
    </>
  );
}

export default Home;
