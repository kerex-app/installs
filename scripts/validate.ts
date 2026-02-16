import { z } from "zod";
import { readdir, readFile } from "node:fs/promises";
import { join, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const InstallStepConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  action: z.enum(["clone_repo", "git", "npx", "push", "create_pr", "write_file"]),
  params: z.union([z.array(z.string()), z.record(z.string())]).optional(),
});

const InstallOutputConfigSchema = z.object({
  type: z.enum(["text", "link"]),
  value: z.string().optional(),
  href: z.string().optional(),
  text: z.string().optional(),
});

const InstallConfigSchema = z.object({
  id: z.string().regex(/^[a-z0-9][a-z0-9-]{0,48}[a-z0-9]$/),
  name: z.string().min(1),
  description: z.string().min(1),
  variables: z.record(z.string()),
  steps: z.array(InstallStepConfigSchema).min(1),
  outputs: z.array(InstallOutputConfigSchema),
});

async function main() {
  const configDir = join(__dirname, "..", "configs");
  const files = await readdir(configDir);
  const jsonFiles = files.filter((f) => f.endsWith(".json"));

  if (jsonFiles.length === 0) {
    console.error("No config files found in configs/");
    process.exit(1);
  }

  let hasErrors = false;

  for (const file of jsonFiles) {
    const filePath = join(configDir, file);
    const content = await readFile(filePath, "utf-8");
    const expectedId = basename(file, ".json");

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error(`FAIL ${file}: Invalid JSON`);
      hasErrors = true;
      continue;
    }

    const result = InstallConfigSchema.safeParse(parsed);
    if (!result.success) {
      console.error(`FAIL ${file}:`);
      for (const issue of result.error.issues) {
        console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
      }
      hasErrors = true;
      continue;
    }

    // Check id matches filename
    if (result.data.id !== expectedId) {
      console.error(`FAIL ${file}: id "${result.data.id}" does not match filename "${expectedId}"`);
      hasErrors = true;
      continue;
    }

    // Check unique step IDs
    const stepIds = result.data.steps.map((s) => s.id);
    const dupes = stepIds.filter((id, i) => stepIds.indexOf(id) !== i);
    if (dupes.length > 0) {
      console.error(`FAIL ${file}: Duplicate step IDs: ${[...new Set(dupes)].join(", ")}`);
      hasErrors = true;
      continue;
    }

    console.log(`PASS ${file}`);
  }

  if (hasErrors) {
    console.error("\nValidation failed");
    process.exit(1);
  }

  console.log(`\nAll ${jsonFiles.length} configs valid`);
}

main();
