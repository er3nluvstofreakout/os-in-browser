import ServerPeer from "./ServerPeer.js"; // doesn't matter where you put it, this always runs first, so might as well put it at the top

const { Octokit } = require("@octokit/action");
const express = require("express");
const expressWs = require("express-ws");
const basicAuth = require("express-basic-auth");
const { setTimeout } = require("node:timers/promises");
const path = require("node:path");

const {
	GITHUB_REPOSITORY,
	GITHUB_SHA,
	USERNAME,
	PASSWORD,
	GITHUB_RUN_ID,
	PORT,
	TUNNEL_URL
} = require("node:process").env;

const github = new Octokit({
	request: {
		fetch
	}
});

const [owner, repo] = GITHUB_REPOSITORY.split("/");

const server = express();
expressWs(server);

server.use(
	basicAuth({
		users: {
			[USERNAME]: PASSWORD
		},
		challenge: true
	})
);

server.use(express.static(path.join(__dirname, "public")));

server.ws("/", (ws, req) => new ServerPeer(ws));

server.listen(PORT/* , () => {
	console.log(`Server listening on port ${PORT}`);
}*/);

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

await github.rest.repos.createDeploymentStatus({
	owner,
	repo,
	environment: GITHUB_RUN_ID,
	deployment_id: deployment.id,
	state: "in_progress",
	description: "Remote desktop ready",
	environment_url: TUNNEL_URL
});

console.log(`
	
==========================
YOUR URL IS:
${TUNNEL_URL}
==========================

`);

// bring back uploading artifact for website