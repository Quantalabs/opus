import fs from "fs"

function processEscapeSequences(contentBlock: string): string {
    // Replace escape sequences with corresponding characters
    const nonUnicodeEscapeSequences = {
        "\\n": "\n",
        "\\r": "\r",
        "\\t": "\t",
        "\\f": "\f",
        "\\b": "\b",
        "\\v": "\v"
    }

    for (const escapeSequence in nonUnicodeEscapeSequences) {
        contentBlock = contentBlock.replace(
            escapeSequence,
            nonUnicodeEscapeSequences[escapeSequence]
        )
    }

    let replacedContentBlock = contentBlock.replace(
        /\\(.+?)/g,
        (match, escapeSequence) => {
            if (escapeSequence === "\\") return "\\"
            return String.fromCharCode(parseInt(escapeSequence, 16))
        }
    )

    return replacedContentBlock
}

function parse(input: string): Object[] {
    let inputString = fs.readFileSync(input, "utf-8")

    // Initialize the final output array
    const output: {
        tagName: string
        options: { [key: string]: string }
        content: string
    }[] = []

    // Use regular expressions to find all tags in the input string
    const tagRegex = /--(\w+)\(([^)]*)\)\s*{([\s\S]*?)}/g
    let tagMatch

    while ((tagMatch = tagRegex.exec(inputString)) !== null) {
        const tagName = tagMatch[1]
        const optionsBlock = tagMatch[2].trim()
        let contentBlock = tagMatch[3].trim()

        // Parse the options block and convert it into a dictionary
        const optionsDict: { [key: string]: string } = {}
        const optionsLines = optionsBlock.split(/\r?\n/)
        for (const line of optionsLines) {
            const [option, value] = line.split(":", 2)
            if (option && value) {
                optionsDict[option.trim()] = value.trim()
            }
        }

        // Process escape sequences in the content block
        contentBlock = processEscapeSequences(contentBlock)

        // Create a new tag object with tagName, options, and content
        const tagObject = {
            tagName: tagName,
            options: optionsDict,
            content: contentBlock
        }

        // Add the tag object to the output array
        output.push(tagObject)
    }

    return output
}

export default parse
