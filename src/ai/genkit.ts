import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import * as path from 'path';
import * as fs from 'fs';

// Robust runtime check for version pinning using the project's package.json, with dynamic path resolution
function verifyGoogleAIDependency() {
  try {
    // Dynamically resolve the root package.json path
    let dir = __dirname;
    let found = false;
    let projectPkgPath = '';
    for (let i = 0; i < 5; i++) { // Traverse up to 5 directories up
      const candidate = path.join(dir, 'package.json');
      if (fs.existsSync(candidate)) {
        projectPkgPath = candidate;
        found = true;
        break;
      }
      dir = path.dirname(dir);
    }
    if (!found) {
      throw new Error('Root package.json not found for dependency verification');
    }
    const projectPkg = JSON.parse(fs.readFileSync(projectPkgPath, 'utf8'));
    const expectedVersion = (projectPkg.dependencies?.['@genkit-ai/googleai'] || projectPkg.devDependencies?.['@genkit-ai/googleai']);
    if (!expectedVersion) {
      throw new Error('Expected version for @genkit-ai/googleai not found in project package.json');
    }
    const installedPkg = require('@genkit-ai/googleai/package.json');
    // Remove any leading ^, ~, etc. for direct comparison
    const expected = expectedVersion.replace(/^[^0-9]*/, '');
    if (installedPkg.version !== expected) {
      throw new Error(`@genkit-ai/googleai version mismatch: expected ${expected}, found ${installedPkg.version}`);
    }
  } catch (err) {
    throw new Error(`Dependency verification failed for @genkit-ai/googleai: ${err.message}`);
  }
}

verifyGoogleAIDependency();

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
  try {
    // Dynamically resolve the root package.json path
    let dir = __dirname;
    let found = false;
    let projectPkgPath = '';
    for (let i = 0; i < 5; i++) { // Traverse up to 5 directories up
      const candidate = path.join(dir, 'package.json');
      if (fs.existsSync(candidate)) {
        projectPkgPath = candidate;
        found = true;
        break;
      }
      dir = path.dirname(dir);
    }
    if (!found) {
      throw new Error('Root package.json not found for dependency verification');
    }
    const projectPkg = JSON.parse(fs.readFileSync(projectPkgPath, 'utf8'));
    const expectedVersion = (projectPkg.dependencies?.['@genkit-ai/googleai'] || projectPkg.devDependencies?.['@genkit-ai/googleai']);
    if (!expectedVersion) {
      throw new Error('Expected version for @genkit-ai/googleai not found in project package.json');
    }
    const installedPkg = require('@genkit-ai/googleai/package.json');
    // Remove any leading ^, ~, etc. for direct comparison
    const expected = expectedVersion.replace(/^[^0-9]*/, '');
    if (installedPkg.version !== expected) {
      throw new Error(`@genkit-ai/googleai version mismatch: expected ${expected}, found ${installedPkg.version}`);
    }
  } catch (err) {
    throw new Error(`Dependency verification failed for @genkit-ai/googleai: ${err.message}`);
  }
}

verifyGoogleAIDependency();

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
