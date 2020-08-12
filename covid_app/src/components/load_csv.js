export default function getCsvData(dataPath) {
  let reader = new FileReader()
  let lines = []
  reader.readAsText(dataPath)
  reader.onload = () => {
    lines = reader.result.split("\n")
    lines.shift()
  }
  console.log(lines)
  return lines
}