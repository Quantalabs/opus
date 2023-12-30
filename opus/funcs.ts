import { jsPDF } from "jspdf"
import { toMM } from "./utils"
import fs from "fs"
import http from "http"

function text(doc: jsPDF, element: Object): jsPDF {
    // Add text to the page at the specified position
    let color = element["options"]["color"]
        ? element["options"]["color"]
        : "#000000"

    // Convert color into RGB
    let ch1 = parseInt(color.slice(1, 3), 16)
    let ch2 = parseInt(color.slice(3, 5), 16)
    let ch3 = parseInt(color.slice(5, 7), 16)

    doc.setTextColor(ch1, ch2, ch3)

    let fontSize = element["options"]["fontSize"]
        ? element["options"]["fontSize"]
        : 12
    let font = element["options"]["font"]
        ? element["options"]["font"]
        : "helvetica"
    let width = element["options"]["width"]
        ? toMM(element["options"]["width"])
        : 0
    let lineHeight = element["options"]["lineHeight"]
        ? Number(element["options"]["lineHeight"])
        : 1.15

    doc.setFontSize(fontSize)
    doc.setFont(font)
    return doc.text(
        element["content"],
        toMM(element["options"]["x"]),
        toMM(element["options"]["y"]),
        {
            maxWidth: width,
            lineHeightFactor: lineHeight
        }
    )
}

function image(doc: jsPDF, element: Object): jsPDF {
    const dim = [
        toMM(element["options"]["width"]),
        toMM(element["options"]["height"])
    ]

    return doc.addImage(
        fs.readFileSync(element["options"]["path"]),
        element["options"]["path"].split(".").pop(),
        toMM(element["options"]["x"]),
        toMM(element["options"]["y"]),
        dim[0],
        dim[1],
        String(Math.random() * 1000),
        "NONE",
        element["options"]["rotation"]
            ? Number(element["options"]["rotation"])
            : 0
    )
}

function font(doc: jsPDF, element: Object): jsPDF {
    // Load the *.ttf file as a base64 string
    const fontData = fs.readFileSync(element["options"]["source"], "base64")

    doc.addFileToVFS(element["options"]["source"], fontData)
    doc.addFont(
        element["options"]["source"],
        element["options"]["name"],
        "normal"
    )
    return doc
}

export default {
    text,
    image,
    font
}
