import { context, getOctokit } from "@actions/github";
import { Issue } from "./types.ts";

const token = process.env.GH_TOKEN;

if (!token) {
	console.error("Error: GH_TOKEN was not provided.");
	process.exit(1);
}

const octokit = getOctokit(token);

export async function createIssueWithRetry(issueContent: Issue) {
	const { title, body } = issueContent;
	const { owner, repo } = context.repo;
	const delays = [5000, 15000, 45000, 90000, 300000];

	let attempt = 0;

	while (attempt < delays.length) {
		try {
			console.log(`Attempt ${attempt + 1} to create issue...`);

			const response = await octokit.rest.issues.create({
				owner,
				repo,
				title,
				body,
			});

			console.log(
				`Issue created successfully: ${response.data.html_url}`,
			);
			return;
		} catch (error: unknown) {
			const status = (error as { status?: number })?.status;
			const message =
				error instanceof Error ? error.message : String(error);

			if (status && status >= 400 && status < 500 && status !== 429) {
				console.error(
					`Definitive client error (HTTP ${status}): ${message}`,
				);
				process.exit(1);
			}

			attempt++;

			if (attempt >= delays.length) {
				console.error(
					`Failed to create issue after ${attempt} attempts. Final error: ${message}`,
				);
				process.exit(1);
			}

			const waitTime = delays[attempt - 1];
			console.log(
				`Error detected (${message}). Waiting ${waitTime / 1000}s before attempt ${attempt + 1}...`,
			);
			await new Promise((resolve) => setTimeout(resolve, waitTime));
		}
	}
}
