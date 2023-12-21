import inquirer from "inquirer";
import { runSetup } from "./setup.mjs";

export const prompt = async (questions) => {
  setTimeout(async () => {
    const answers = await inquirer.prompt(questions);
    const categories = [];
    if (answers.number) {
    //   const catNumber = await inquirer.prompt([
    //     {
    //       type: "input",
    //       name: "number",
    //       message: "How many categories do you want to add?",
    //     },
    //   ]);
      for (let i = 0; i < answers.number; i++) {
        const cat = await inquirer.prompt([
          {
            type: "input",
            name: "name",
            message: `Enter a name for category ${i + 1}: `,
          },
          {
            type: "confirm",
            name: "gated",
            message: "Do you want this category to be gated?",
          },
        ]);
        categories.push(cat);
      }
    }
    answers.categories = categories;
    console.log(answers);
    await runSetup(answers);
  }, 1000);
};

export const projectQ = [
  {
    type: "input",
    name: "name",
    message: "What is your project name?",
  },
  {
    type: "input",
    name: "description",
    message: "What is your project description",
  },
  {
    type: "input",
    name: "image",
    message: "Enter an optional image URL for your project: ",
  },
  {
    type: "input",
    name: "website",
    message: "Enter an optional website URL for your project: ",
  },
  {
    type: "input",
    name: "twitter",
    message: "Enter an optional twitter link for your project: ",
  },
  {
    type: "input",
    name: "discord",
    message: "Enter an optional discord link for your project: ",
  },
  {
    type: "input",
    name: "telegram",
    message: "Enter an optional telegram link for your project: ",
  },
  {
    type: "input",
    name: "contextName",
    message: "Enter a name for the primary context your project will use: ",
  },
//   {
//     type: "confirm",
//     name: "contextGate",
//     message:
//       "Do you want your primary context to be gated? (you will have the option in the next few questions to gate based on post category - gating at this level automatically gates all categories) ",
//   },
{
    type: "input",
    name: "number",
    message: "How many categories do you want to add?",
  },
];
prompt(projectQ);
