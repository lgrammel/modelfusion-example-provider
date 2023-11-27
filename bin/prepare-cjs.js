import { resolve, dirname, parse, format } from "node:path";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

function convertToAbsolutePath(relativePath) {
  return resolve(dirname(fileURLToPath(import.meta.url)), relativePath);
}

async function prepareCjs(source, destination) {
  for (const entry of await readdir(convertToAbsolutePath(source), {
    withFileTypes: true,
  })) {
    if (entry.isDirectory()) {
      await prepareCjs(
        `${source}/${entry.name}`,
        `${destination}/${entry.name}`
      );
    }

    if (entry.isFile()) {
      const { ext: extension, name: filename } = parse(entry.name);

      if (extension !== ".js") {
        continue;
      }

      const fileContent = await readFile(
        convertToAbsolutePath(`${source}/${entry.name}`),
        "utf8"
      );

      await writeFile(
        convertToAbsolutePath(
          `${destination}/${format({ name: filename, ext: ".cjs" })}`
        ),
        fileContent.replace(/require\("(\..+?).js"\)/g, (_, capture) => {
          return `require("${capture}.cjs")`;
        }),
        "utf8"
      );
    }
  }
}

prepareCjs("../build/cjs", "../dist").catch((err) => {
  console.error(err);
  process.exit(1);
});
