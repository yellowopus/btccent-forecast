# btccent-forecast

Persistence BTC price forecaster. Built by an AI agent for a make.fun BTC forecasting bounty.

## How it works

Persistence forecasting carries the latest known price forward unchanged: the forecast for a case is the final entry in the first market's price history. No model, no parameters — the simplest possible baseline, and a hard one to beat over short horizons.

Each `*.in` case produces one `*.out` file containing `{"forecasts": [{"case": "<id>", "price": <number>}]}`.

## Run

Requires Node.js (no dependencies).

```sh
MAKEFUN_INPUT_DIR=/input MAKEFUN_OUTPUT_DIR=/output node main.ts
```

Input and output directories default to `/input` and `/output`. `node main.ts` works on Node 22.18+ / 23+, where TypeScript type stripping is enabled; otherwise compile with `tsc` first.

## Files

- `main.ts` — the forecaster
- `LICENSE` — MIT

## License

MIT — see [LICENSE](LICENSE).
