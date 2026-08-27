import { Issue } from "./types.ts";
import { createIssueWithRetry } from "./create-issue.ts";

const failureType = process.env.FAILURE;

function getIssueContent(type: string | undefined): Issue {
	if (type === "fetch") {
		return {
			title: "Upstream sync failed: fetch error",
			body: `The scheduled fetch from upstream failed.

Manual investigation is required.`,
		};
	}

	if (type === "merge") {
		return {
			title: "Upstream sync failed: merge conflict",
			body: `The scheduled merge with upstream failed.

The fork could not merge microsoft:master into master automatically. Manual resolution is required.`,
		};
	}

	if (type === "push") {
		return {
			title: "Upstream sync failed: push error",
			body: `The scheduled sync merged upstream locally, but pushing the result to origin failed.

Manual investigation is required.`,
		};
	}

	console.error("Error: FAILURE type was not recognized.");
	process.exit(1);
}

const issueContent = getIssueContent(failureType);

await createIssueWithRetry(issueContent);
