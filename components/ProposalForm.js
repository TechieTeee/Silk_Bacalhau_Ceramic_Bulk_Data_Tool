// components/ProposalForm.js
import React, { useState } from 'react';
import { Survey } from 'survey-react';
import Web3Provider from 'web3-provider';
import snapshot from '@snapshot-labs/snapshot.js';

const ProposalForm = ({ onClick }) => {
  const [proposalData, setProposalData] = useState({
    type: 'single-choice',
    title: '',
    body: '',
    choices: [],
    start: Math.floor(Date.now() / 1000),
    end: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 5,
    snapshot: 13620822
  });

  const onComplete = async (survey) => {
    // Extract parameters from survey results
    const { values } = survey.data;
    const { title, body, choices } = values;

    // Update proposalData state
    setProposalData((prevData) => ({
      ...prevData,
      title,
      body,
      choices: choices ? choices.split(',').map((choice) => choice.trim()) : []
    }));

    // Call existing onClick function
    onClick(proposalData);
  };

  return (
    <Survey
      json={{
        questions: [
          // Customize your survey questions based on your needs
          {
            type: 'text',
            name: 'title',
            title: 'Title:'
          },
          {
            type: 'text',
            name: 'body',
            title: 'Body:'
          },
          {
            type: 'text',
            name: 'choices',
            title: 'Choices (comma-separated):'
          }
          // Add more questions as needed
        ]
      }}
      onComplete={onComplete}
    />
  );
};

export default ProposalForm;
