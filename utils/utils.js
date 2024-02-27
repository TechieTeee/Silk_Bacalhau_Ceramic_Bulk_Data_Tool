import axios from 'axios'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import invariant from 'tiny-invariant'


export const alchemyApiKey = process.env.REACT_APP_ALCHEMY_API_KEY


export const CUSTOM_SCHEMAS = {
  ACCOUNT_SCHEMA: '0x2672dcb6a3ae08d74d4fe943c6d1f2df40a714687e48ea8d3d7d91624df50e13'
}

dayjs.extend(duration)
dayjs.extend(relativeTime)

function getChainId() {
  return Number('1')
}

export const CHAINID = getChainId()
invariant(CHAINID, 'No chain ID env found')

export const EAS_CHAIN_CONFIGS = [
  {
    chainId: 1,
    chainName: 'Ethereum',
    subdomain: 'mainnet',
    version: '0.26',
    contractAddress: '0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587',
    schemaRegistryAddress: '0xA7b39296258348C78294F95B872b282326A97BDF',
    etherscanURL: 'https://etherscan.io/',
    contractStartBlock: 2958570,
    rpcProvider: `https://eth.meowrpc.com`,
  },
]

export const activeChainConfig = EAS_CHAIN_CONFIGS.find((config) => config.chainId === CHAINID)

// export const baseURL = `https://${activeChainConfig.subdomain}easscan.org`

invariant(activeChainConfig, 'No chain config found for chain ID')
export const EASContractAddress = activeChainConfig.contractAddress

export const EASVersion = activeChainConfig.version

export const EAS_CONFIG = {
  address: EASContractAddress,
  version: EASVersion,
  chainId: CHAINID,
}

export const timeFormatString = 'MM/DD/YYYY h:mm:ss a'

export async function getAttestation(uid) {
  const response = await axios.post<AttestationResult>(
    `${baseURL}/graphql`,
    {
      query:
        'query Query($where: AttestationWhereUniqueInput!) {\n  attestation(where: $where) {\n    id\n    attester\n    recipient\n    revocationTime\n    expirationTime\n    time\n    txid\n    data\n  }\n}',
      variables: {
        where: {
          id: uid,
        },
      },
    },
    {
      headers: {
        'content-type': 'application/json',
      },
    }
  )
  return response.data.data.attestation
}
export async function getAttestationsForAddress(address) {
  const response = await axios.post<MyAttestationResult>(
    `${baseURL}/graphql`,
    {
      query:
        'query Attestations($where: AttestationWhereInput, $orderBy: [AttestationOrderByWithRelationInput!]) {\n  attestations(where: $where, orderBy: $orderBy) {\n    attester\n    revocationTime\n    expirationTime\n    time\n    recipient\n    id\n    data\n  }\n}',

      variables: {
        where: {
          schemaId: {
            equals: CUSTOM_SCHEMAS.MET_IRL_SCHEMA,
          },
          OR: [
            {
              attester: {
                equals: address,
              },
            },
            {
              recipient: {
                equals: address,
              },
            },
          ],
        },
        orderBy: [
          {
            time: 'desc',
          },
        ],
      },
    },
    {
      headers: {
        'content-type': 'application/json',
      },
    }
  )
  return response.data.data.attestations
}
export async function getConfirmationAttestationsForUIDs(refUids) {
  const response = await axios.post<MyAttestationResult>(
    `${baseURL}/graphql`,
    {
      query:
        'query Attestations($where: AttestationWhereInput, $orderBy: [AttestationOrderByWithRelationInput!]) {\n  attestations(where: $where, orderBy: $orderBy) {\n    attester\n    revocationTime\n    expirationTime\n    time\n    recipient\n    id\n    data\n  refUID\n  }\n}',

      variables: {
        where: {
          schemaId: {
            equals: CUSTOM_SCHEMAS.CONFIRM_SCHEMA,
          },
          refUID: {
            in: refUids,
          },
        },
        orderBy: [
          {
            time: 'desc',
          },
        ],
      },
    },
    {
      headers: {
        'content-type': 'application/json',
      },
    }
  )
  return response.data.data.attestations
}
export async function getENSNames(addresses) {
  const response = await axios.post<EnsNamesResult>(
    `${baseURL}/graphql`,
    {
      query: 'query Query($where: EnsNameWhereInput) {\n  ensNames(where: $where) {\n    id\n    name\n  }\n}',
      variables: {
        where: {
          id: {
            in: addresses,
            mode: 'insensitive',
          },
        },
      },
    },
    {
      headers: {
        'content-type': 'application/json',
      },
    }
  )
  return response.data.data.ensNames
}
