import React, { useEffect, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Sidebar from "../components/Sidebar";
import PostItem from "../components/PostItem";
import Footer from "../components/Footer";
import { LoadingCircle } from "../components/Icons";
import { useOrbis } from "@orbisclub/components";

function Home({ defaultPosts }) {
  const { orbis, user } = useOrbis();
  const [nav, setNav] = useState("all");
  const [page, setPage] = useState(0);
  const [posts, setPosts] = useState();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

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
      if (nav == "all") {
        loadPosts(global.orbis_context, true, 0);
      } else {
        loadPosts(nav, true, 0);
      }
    }
  }, [nav]);

  useEffect(() => {
    if (global.orbis_context) {
      if (nav == "all") {
        loadPosts(global.orbis_context, true, page);
      } else {
        loadPosts(nav, true, page);
      }
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
            // If each CSV has a header row, result.data contains an array of objects
            const csvDataArray = result.data;

            // Each row is an object with columns as keys
            const formattedData = csvDataArray.map((row) => {
              return {
                ph: parseFloat(row.ph),
                Hardness: parseFloat(row.Hardness),
                Solids: parseFloat(row.Solids),
                Chloramines: parseFloat(row.Chloramines),
                Sulfate: parseFloat(row.Sulfate),
                Conductivity: parseFloat(row.Conductivity),
                Organic_carbon: parseFloat(row.Organic_carbon),
                Trihalomethanes: parseFloat(row.Trihalomethanes),
                Turbidity: parseFloat(row.Turbidity),
                Potability: parseInt(row.Potability),
              };
            });

            resolve(formattedData);
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

  const handleUploadButtonClick = async (event) => {
    const file = event.target.files[0];
    const data = await readDataFromCSV(file);

    // Further processing can be added or storing can be done as needed
    console.log("Uploaded Data:", data);

    // Example: Store data using CeramicDB or ComposeDB
    const ceramicApiUrl = "http://localhost:7007";
  };

  return (
    <>
      <Head>
        <title key="title">WaterLab | WaterLab</title>
        <meta
          property="og:title"
          content="WaterLab Community Hub | WaterLab"
          key="og_title"
        />
        <meta
          name="description"
          content="An open and decentralized social application for the WaterLab community"
          key="description"
        ></meta>
        <meta
          property="og:description"
          content="An open and decentralized social application for the WaterLab community"
          key="og_description"
        />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <div className="flex flex-col min-h-screen overflow-hidden supports-[overflow:clip]:overflow-clip bg-main">
        <div className="antialiased">
          <div className="min-h-screen flex">
            <main className="grow overflow-hidden">
              <Header />
              <Hero
                title="WaterLab Community Hub"
                description="A decentralized research community"
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
                                    There aren&apos;t any posts shared here.
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
      <label
        htmlFor="upload-data-input"
        className="btn-sm py-1.5 btn-main ml-2 cursor-pointer"
      >
        Upload Data
      </label>
    </>
  );
}

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

export default Home;
