import { jsPDF } from "jspdf"
import { toMM } from "./utils"

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

    doc.setFontSize(fontSize)
    return doc.text(
        element["content"],
        toMM(element["options"]["x"]),
        toMM(element["options"]["y"])
    )
}

export default {
    text
}
