export function getActiveProposals() {
  const apiUrl = "https://hub.snapshot.org/graphql";
  const space = "rh2o.eth";

  const query = `
    {
      proposals(
        first: 5,
        skip: 0,
        where: {
          space_in: ["${space}"],
          state: "active"
        },
        orderBy: "created",
        orderDirection: desc
      ) {
        id
        title
        body
        choices
        start
        end
        state
        author
        space {
          id
          name
        }
      }
    }
  `;

  return fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  })
    .then((res) => res.json())
    .then((res) => res.data);
}

export function getSingleProposal(id) {
  const apiUrl = "https://hub.snapshot.org/graphql";
  const space = "rh2o.eth";

  const query = `
  query {
    proposal(id:"${id}") {
      id
      title
      body
      choices
      type
      start
      end
      snapshot
      state
      author
      created
      scores
      scores_by_strategy
      scores_total
      scores_updated
      plugins
      network
      strategies {
        name
        network
        params
      }
      space {
        id
        name
      }
    }
  }
  `;

  return fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  })
    .then((res) => res.json())
    .then((res) => res.data);
}
