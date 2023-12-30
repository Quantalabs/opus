import chalk from "chalk"
import { jsPDF } from "jspdf"
import funcs from "./funcs"
import { toMM } from "./utils"

function createDocument(element: Object): Object {
    if (element["content"] != "") {
        console.warn(
            chalk.yellow(
                "Warning: document content is not empty. This content will be ignored."
            )
        )
    }

    element["options"]["numberPages"] =
        element["numberPages"] == "true" ? true : false

    if (
        !element["options"]["numberPages"] &&
        (element["options"]["numXPos"] != null ||
            element["options"]["numYPos"] != null)
    ) {
        console.warn(
            chalk.yellow(
                "Warning: numberPages is set to false in document options, but numXPos and/or numYPos is set. Page numbers will not be shown unless specified in page-specific options."
            )
        )
    }

    if (
        element["options"]["color"] &&
        !element["options"]["color"].startsWith("#")
    ) {
        console.warn(
            chalk.yellow(
                "Warning: document color is not a valid hex color. It will be set to default (#FFFFFF)."
            )
        )
        element["options"]["color"] = "#FFFFFF"
    }

    if (
        !["portrait", "landscape", "p", "l"].includes(
            element["options"]["orientation"]
        )
    ) {
        console.log(element)
        console.warn(
            chalk.yellow(
                "Warning: document orientation is not valid. It will be set to default (portrait)."
            )
        )
        element["options"]["orientation"] = "portrait"
    }
    return element
}

function generatePDF(input: Object[]): jsPDF {
    let meta: {
        name: string
        description: string
        author: string
        subject: string
        keywords: string[]
        copyStatus: "unknown" | "copyrighted" | "publicDomain"
        notice: string
        copyURL: string
    } = {
        name: "",
        description: "",
        author: "",
        subject: "",
        keywords: [],
        copyStatus: "unknown",
        notice: "",
        copyURL: ""
    }
    let document: {
        width: string
        length: string
        orientation: "portrait" | "landscape" | "p" | "l"
        color: string
        numberPages: boolean
        numXPos: number
        numYPos: number
    } = {
        width: "297mm",
        length: "210mm",
        orientation: "portrait",
        color: "#FFFFFF",
        numberPages: false,
        numXPos: null,
        numYPos: null
    }
    let currentPage: {
        options: {
            width: string
            length: string
            orientation: "portrait" | "landscape" | "p" | "l"
            color: string
            numberPage: boolean
            numXPos: number
            numYPos: number
        }
        content: string[]
    } = {
        options: {
            width: "297mm",
            length: "210mm",
            orientation: "portrait",
            color: "#FFFFFF",
            numberPage: false,
            numXPos: null,
            numYPos: null
        },
        content: []
    }
    let pages: {
        options: {
            width: string
            length: string
            orientation: "portrait" | "landscape" | "p" | "l"
            color: string
            numberPage: boolean
            numXPos: number
            numYPos: number
        }
        content: string[]
    }[] = []

    const docOptions = createDocument(input[0])["options"]
    for (let key in docOptions) {
        document[key] = docOptions[key]
    }

    const doc = new jsPDF({
        orientation: document["orientation"],
        unit: "mm",
        format: [toMM(document["width"]), toMM(document["length"])]
    })

    for (let i = 1; i < input.length; i++) {
        const element = input[i]
        const tagName = element["tagName"]
        switch (tagName) {
            case "document":
                console.error(
                    chalk.red(
                        "Error: document tag should be the first tag in the document."
                    )
                )
                process.exit(1)
                break
            case "meta":
                try {
                    element["options"]["keywords"] =
                        element["options"]["keywords"].split(",")
                } catch (e) {}
                if (
                    !["unknown", "copyrighted", "publicDomain"].includes(
                        element["options"]["copyStatus"]
                    )
                ) {
                    console.error(
                        chalk.red(
                            "Error: Option copyStatus in tag meta must be one of 'unknown', 'copyrighted', or 'publicDomain'."
                        )
                    )
                    process.exit(1)
                }
                for (let key in element["options"]) {
                    meta[key] = element["options"][key]
                }
                if (element["content"] != "") {
                    console.warn(
                        chalk.yellow(
                            "Warning: meta content is not empty. This content will be ignored."
                        )
                    )
                }
                break
            case "page":
                if (element["content"] != "") {
                    console.warn(
                        chalk.yellow(
                            "Warning: page content is not empty. This content will be ignored."
                        )
                    )
                }
                let firstPage = pages.length > 0 ? false : true
                for (let key in document) {
                    if (key == "numberPages") key = "numberPage"
                    currentPage["options"][key] = element["options"][key]
                        ? element["options"][key]
                        : document[key]
                }
                pages.push(currentPage)

                if (!firstPage) {
                    doc.addPage(
                        [
                            toMM(currentPage["options"]["width"]),
                            toMM(currentPage["options"]["length"])
                        ],
                        currentPage["options"]["orientation"]
                    )
                }
                // Draw rectangle over page with specified color
                doc.setFillColor(currentPage["options"]["color"])
                doc.rect(
                    0,
                    0,
                    toMM(currentPage["options"]["width"]),
                    toMM(currentPage["options"]["length"]),
                    "F"
                )
                break
            case "image":
                funcs.image(doc, element)
                break
            case "text":
                funcs.text(doc, element)
                break
            case "font":
                funcs.font(doc, element)
                break
        }
    }
    return doc
}

export default generatePDF
