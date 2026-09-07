import ServerPeer from "./ServerPeer.js"; // doesn't matter where you put it, this always runs first, so might as well put it at the top

const { Octokit } = require("@octokit/action");
const express = require("express");
const expressWs = require("express-ws");
const basicAuth = require("express-basic-auth");
const { setTimeout } = require("node:timers/promises");
const path = require("node:path");
const process = require("node:process");
const app = require("electron");

const {
	GITHUB_REPOSITORY,
	GITHUB_SHA,
	USERNAME,
	PASSWORD,
	GITHUB_RUN_ID
} = process.env;

const cloudflaredPath = path.join(
    app.getAppPath(),
    process.platform === "win32"
        ? "cloudflared.exe"
        : "cloudflared"
);

const port = 8080;
const metricsPort = 8081;

spawn(cloudflaredPath, [
	`--metrics=localhost:${metricsPort}`,
	`--url=localhost:${port}`
])

const github = new Octokit();

const [owner, repo] = GITHUB_REPOSITORY.split("/");

const app = express();
expressWs(app);

app.use(
	basicAuth({
		users: {
			[USERNAME]: PASSWORD
		},
		challenge: true
	})
);

app.use(express.static("./public"));

app.ws("/", (ws, req) => new ServerPeer(ws));

app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});

const [deployment] = await github.paginate(
	github.rest.repos.listDeployments,
	{
		owner,
		repo,
		environment: GITHUB_RUN_ID,
		sha: GITHUB_SHA
	}
);

if (!deployment)
	throw new Error("Deployment not found");

const { hostname } = await waitForJSONEndpoint(`http://localhost:${metricsPort}`);
const tunnelUrl = `https://${hostname}`;

await github.rest.repos.createDeploymentStatus({
	owner,
	repo,
	environment: GITHUB_RUN_ID,
	deployment_id: deployment.id,
	state: "in_progress",
	description: "Remote desktop ready",
	environment_url: tunnelUrl
});

console.log(`=====================
YOUR URL IS:
${tunnelUrl}
=====================`)

// bring back uploading artifact for website

async function waitForJSONEndpoint(url, interval = 1000) {
	while (true) {
		try {
			const response = await fetch(url);

			if (response.ok) return response.json();
		} catch {}

		await setTimeout(interval);
	}
}