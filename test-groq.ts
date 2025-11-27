import { analyzeCode } from "@/lib/ai/code-analyzer";

const testCode = `
function getUserData(userId) {
  const query = "SELECT * FROM users WHERE id = " + userId;
  return db.query(query);
}

const apiKey = "sk-1234567890abcdef";
`;

async function test() {
  try {
    console.log("Analyzing code...");
    const result = await analyzeCode(testCode, "javascript");
    console.log("Analysis complete!");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

test();
