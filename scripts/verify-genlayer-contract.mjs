import { execSync } from 'child_process';
import fs from 'fs';

const deployment = JSON.parse(fs.readFileSync('contracts/deployment.json', 'utf8'));
const address = deployment.address;

function genlayerCall(method) {
  const safeAddress = JSON.stringify(address);
  const safeMethod = JSON.stringify(method);
  return execSync(`npx genlayer call ${safeAddress} ${safeMethod}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

const project = genlayerCall('project');
const counters = genlayerCall('counters');

if (!project.includes('GenLayer Intelligent Finance Studio')) {
  throw new Error('project() verification failed');
}

if (!counters.includes('reports=0;signals=0;policy_checks=0')) {
  throw new Error('counters() verification failed');
}

console.log(`GenLayer contract verified: ${address}`);
