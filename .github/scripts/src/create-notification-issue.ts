import { Issue } from "./types.ts";
import { createIssueWithRetry } from "./create-issue.ts";

const token = process.env.GH_TOKEN;
const oldSHA = process.env.OLD_SHA;
const newSHA = process.env.NEW_SHA;
const files = process.env.FILES;

if (!token || !oldSHA || !newSHA || !files) {
	console.error(
		"Error: Required environment variables (GH_TOKEN, OLD_SHA, NEW_SHA, FILES) are missing.",
	);
	process.exit(1);
}

const fileList = files
	.split("\n")
	.map((file) => file.trim())
	.filter(Boolean);
const fileListFormatted = fileList.map((file) => `- ${file}`).join("\n");
const fileOrFiles = fileList.length > 1 ? "files" : "file";

const issueContent: Issue = {
	title: "Upstream .tmLanguage changes detected",
	body: `Upstream changed the following .tmLanguage ${fileOrFiles}:

${fileListFormatted}

[Compare changes](https://github.com/psudo-dev/TypeScript-TmLanguage/compare/${oldSHA}...${newSHA})`,
};

await createIssueWithRetry(issueContent);
