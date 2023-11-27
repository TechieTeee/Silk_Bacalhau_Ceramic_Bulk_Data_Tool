export function getActiveProposals() {
  const apiUrl = 'https://hub.snapshot.org/graphql';
  const space = 'banklessdesi.eth';

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
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  })
    .then(res => res.json())
    .then(res => res.data);
}
