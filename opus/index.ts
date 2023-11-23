import parse from "./parse"
import build from "./build"

import { program } from "commander"
import chalk from "chalk"

import fs from "fs"

function parseHrtimeToSeconds(hrtime) {
    var seconds = (hrtime[0] + hrtime[1] / 1e9).toFixed(3)
    return seconds
}

program
    .name("opus")
    .version("0.1.0")
    .description("A fully customizable programmatic document processing system")

program
    .requiredOption("-i, --input <input>", "Input file path")
    .option("-o, --output <output>", "Output file", "<input>.pdf")

program.parse()

const options = program.opts()
options.output = options.output.replace(
    "<input>",
    options.input.replace(".opus", "")
)

console.log("Building from", options.input, "\n")
const startTime = process.hrtime()

let parsed = parse(options.input)
let built = build(parsed)

built.save(options.output)

const elapsedSeconds = parseHrtimeToSeconds(process.hrtime(startTime))
console.log(
    chalk.green(
        `Build completed in ${elapsedSeconds} seconds. See output at ${options.output}`
    )
)
