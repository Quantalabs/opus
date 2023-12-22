import convert from "convert-units"

export function toMM(length: string): number {
    let value = parseFloat(length)
    let unit = length.replace(value.toString(), "")
    return convert(value).from(unit).to("mm")
}
