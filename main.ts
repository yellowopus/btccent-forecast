import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

/**
 * The competition only needs the subset of the input schema used to locate the
 * observed BTC price series. Fields are optional so malformed data produces a
 * clear runtime error rather than a misleading `undefined` forecast.
 */
type PriceCase = {
  markets?: Array<{
    prices?: number[];
  }>;
};

/**
 * A case prediction is a `case` identifier and its finite BTC `price`. Written
 * files wrap this object as `{ "forecasts": [prediction] }` with no extra data.
 */
type Forecast = {
  case: string;
  price: number;
};

const INPUT_EXTENSION = ".in";
const OUTPUT_EXTENSION = ".out";

function configuredDirectory(variable: string, fallback: string): string {
  const value = process.env[variable]?.trim();
  return value ? value : fallback;
}

/**
 * Persistence forecasting carries the latest known price forward unchanged.
 * That input is the final entry in the first market's price history, rather
 * than the 240-minute-horizon value that remains unobserved at forecast time.
 */
function lastPrice(case_: PriceCase): number | undefined {
  return case_.markets?.[0]?.prices?.at(-1);
}

async function forecastInput(inputPath: string): Promise<Forecast> {
  const caseId = basename(inputPath, INPUT_EXTENSION);
  const case_: PriceCase = JSON.parse(await readFile(inputPath, "utf8"));
  const price = lastPrice(case_);

  if (!Number.isFinite(price)) {
    throw new Error(`${inputPath}: markets[0].prices has no final finite number`);
  }

  return { case: caseId, price };
}

const inputDir = configuredDirectory("MAKEFUN_INPUT_DIR", "/input");
const outputDir = configuredDirectory("MAKEFUN_OUTPUT_DIR", "/output");

await mkdir(outputDir, { recursive: true });

const inputFiles = (await readdir(inputDir))
  .filter((name) => name.endsWith(INPUT_EXTENSION))
  .sort();

// Process cases independently so one output can be emitted as soon as it is ready.
for (const inputName of inputFiles) {
  const inputPath = join(inputDir, inputName);
  const forecast = await forecastInput(inputPath);
  const outputPath = join(
    outputDir,
    `${forecast.case}${OUTPUT_EXTENSION}`,
  );

  await writeFile(outputPath, JSON.stringify({ forecasts: [forecast] }));
}
