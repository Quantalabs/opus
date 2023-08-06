import parse from "./parse"

import { program } from "commander"

program
    .name("opus")
    .version("0.1.0")
    .description("A fully customizable programmatic document processing system")

program
    .requiredOption("-i, --input <input>", "Input file")
    .option("-o, --output <output>", "Output file", "<input>.pdf")

program.parse()

const options = program.opts()

let parsed = parse(options.input)

console.log(parsed)
