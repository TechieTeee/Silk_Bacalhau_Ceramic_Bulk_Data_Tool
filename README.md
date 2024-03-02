![Water_Life_Hero_Image](https://github.com/TechieTeee/Silk_Bacalhau_Ceramic_Bulk_Data_Tool/assets/100870737/872142fc-64a8-4930-9432-9efac51a592a)

![Water_Life_Hero_Image](https://github.com/TechieTeee/Water_is_Life/assets/100870737/b203e896-1f16-408d-9d54-f9a8fcf492a4)

## Project Description
The Water is Life Project is a groundbreaking initiative that combines blockchain technology, decentralized identity, and automated data processing to address the urgent global challenge of water quality. In collaboration with citizen scientists worldwide, this project aims to make a tangible impact on improving water quality for children, ultimately saving lives.

## Tools for Driving Impact
- Silk Wallet: Silk Wallet is integrated to offer an embeddable and user-friendly wallet experience. This enhances the ease with which participants interact with Ethereum-based features, fostering a seamless and inclusive user experience.
- Ethereum Attestation Service (EAS): EAS is leveraged for on-chain attestations, providing a robust mechanism to verify and validate user identities within the decentralized network.

- ComposeDB + Ceramic: Our choice of ComposeDB ensures that attestation data remains secure, tamper-proof, and readily accessible on the blockchain. This decentralized database forms the backbone of our trust network.

- Bacalhau: Bacalhau Batch is the heartbeat of the project, which allows for automating data processing tasks. By integrating with the project, it streamlines the validation and processing of water quality data.
- Languages: Pythob, JS, TS

## Social Impact
Water Quality Improvement Initiative: The Water is Life Project directly addresses the alarming statistic that approximately 400,000 children under the age of 5 die annually from water, sanitation, and hygiene-related diseases (UNICEF Triple Threat). Through decentralized attestations, a trust network among citizen scientists can be established, ensuring the credibility of data collected globally.

Citizen Scientists Decentralized Group: For this project, the vision is a decentralized group of citizen scientists collaborating to improve water quality. The project empowers individuals worldwide to contribute to a shared goal, facilitated by on-chain attestations and an embeddable Silk Wallet. This would allow the citizen scientists without formal data science and/or data engineering training to easily and quickly validate data, and minimize tech support staff for their work.

## Technical Impact
On-Chain Attestations with ComposeDB: Demonstrating the technical capability of EAS and ComposeDB, the project securely stores attestation data on the blockchain. This establishes a robust foundation for building trust in identity-related transactions within the decentralized community, and how ETL and attestation with EAS + Silk can be used for many use cases, including social impact.

Automated Data Processing with Bacalhau: The integration of Bacalhau showcases the commitment to technical innovation. This Batch Data Tool automates the processing of water quality data, ensuring efficiency, accuracy, and scalability in the mission to improve global water quality.

## Getting Started (to be updated)

1. Duplicate the existing .env.example file and rename it `.env`

2. Install your dependencies:

```bash
npm install
```

3. Create your author key (this will be your server's static seed phrase to write attestations to your ComposeDB instance). Copy-paste the resulting string into your `AUTHOR_KEY` field in your .env file:

```bash
npm run author
```

4. Generate the seed your setup script will use. Copy-paste the resulting string found in your admin_seed.txt file into your `SEED` field in your .env file:

```bash
npm run generate
```

5. Create your Orbis project and context from the command line (follow the prompts in your terminal):

```bash
npm run generateOrbis
```

After you've completed the series of prompts, you will see a log note that says "This is your parent context: ". Copy the value starting with a "k" and paste it into your `ORBCONTEXT` field in your .env file. Finally, locate your file found at /pages/_app.js and paste the same value for the corresponding constants: 

`global.orbis_context`
`global.orbis_chat_context`

6. Start your application:

```bash
nvm use 20
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Styles

Most of the colors can be updated in the `styles/global.css` file which contains CSS variables applied to the main `html` property.


