// pages/api/runCommand.js
import { exec } from 'child_process';

export default async function handler(req, res) {
  exec('bacalhau docker run ubuntu echo Hello World job-68beec6d', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing command: ${error.message}`);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    if (stderr) {
      console.error(`Command stderr: ${stderr}`);
    }

    console.log(`Command stdout: ${stdout}`);
    res.status(200).json({ message: 'Command executed successfully' });
  });
}
