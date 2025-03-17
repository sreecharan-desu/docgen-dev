import { exec } from "child_process";
import path from "path";
import fs from "fs";

// Recursively find all .tsx files in a directory
function getAllTSXFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      results = results.concat(getAllTSXFiles(filePath));
    } else if (file.endsWith(".tsx")) {
      results.push(filePath);
    }
  });

  return results;
}

// Get all .tsx files
const tsxFiles = getAllTSXFiles("./");

if (tsxFiles.length === 0) {
  console.log("No .tsx files found!");
  process.exit(0);
}

// Ensure Prettier is installed
exec("npm list prettier || npm install prettier", (err) => {
  if (err) {
    console.error("Failed to install Prettier:", err);
    return;
  }

  console.log("✅ Prettier installed! Formatting files...");

  // Format all files in one command for better performance
  const filesString = tsxFiles.map((file) => `"${file}"`).join(" ");
  exec(`npx prettier --write ${filesString}`, (error, stdout, stderr) => {
    if (error) {
      console.error("Error formatting files:", error.message);
      return;
    }

    console.log(stdout);
    if (stderr) console.warn(stderr);

    console.log("✨ All .tsx files formatted successfully!");
  });
});
