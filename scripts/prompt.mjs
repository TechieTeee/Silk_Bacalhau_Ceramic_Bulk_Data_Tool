import inquirer from "inquirer";
import { runSetup } from "./setup.mjs";

export const prompt = async (questions) => {
  setTimeout(async () => {
    const answers = await inquirer.prompt(questions);
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
];
prompt(projectQ);
