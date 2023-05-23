const promisify = require('util').promisify;
const { exec } = require('child_process');
const fs = require('fs');

const execAsync = promisify(exec);
const readFileAsync = promisify(fs.readFile);

const args = process.argv.slice(2);

const GITLAB_TOKEN = args[0];
const NPM_TOKEN = args[1];

(async () => {
	await execAsync('cd ./src/components && npm version patch');

	const packageJson = await readFileAsync('./src/components/package.json', 'utf8');
	const { version } = JSON.parse(packageJson);

	await execAsync('npm run build');

	await execAsync(`git config --global user.email "noc-bot@stary.ltd"`);

	await execAsync(`git config --global user.name "Noc Bot"`);

	await execAsync(`git add . && git commit -m "build(noc): release ${version}"`);

	await execAsync(`git push http://gitlab-ci-token:${GITLAB_TOKEN}@localhost/root/noc.git master`);

	await execAsync(`cd ./src/components/dist && echo "//localhost:4873/:_authToken=${NPM_TOKEN}" >> .npmrc && npm publish --access public`)
})();