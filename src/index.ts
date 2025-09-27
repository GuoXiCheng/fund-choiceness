const path = require("path");
const Ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const { createWorker } = require("tesseract.js");
const cliProgress = require("cli-progress");

const inputVideo = "video/input.mp4";
const outputImagePattern = "pic/frame-%03d.png";

Ffmpeg(inputVideo)
  .output(outputImagePattern)
  .outputOptions(["-vf", "fps=1", "-q:v", "1"])
  .on("end", async () => {
    const picDir = "pic";
    const files = fs.readdirSync(picDir).filter((file: any) => file.endsWith(".png"));
    const hashSet = new Set();
    const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    bar.start(files.length, 0);

    for (const file of files) {
      const imagePath = path.join(picDir, file);
      const result = await recognizeImage(imagePath);
      const match = result.match(/\d{6}/g) as string[];
      if (match && match.length > 0) {
        match.forEach((num) => hashSet.add(num));
      }
      bar.increment();
    }
    bar.stop();
    fs.writeFileSync("output.json", JSON.stringify(Array.from(hashSet)), "utf-8");
  })
  .on("error", (e: any) => {
    console.log("Error in extracting frames:", e);
  })
  .run();

async function recognizeImage(imagePath: string) {
  const worker = await createWorker("eng"); // 中文识别用 chi_sim，英文用 eng
  const {
    data: { text },
  } = await worker.recognize(imagePath);
  await worker.terminate();
  return text;
}
