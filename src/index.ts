const Ffmpeg = require("fluent-ffmpeg");
const { createWorker } = require("tesseract.js");

const inputVideo = "video/input.mp4";
const outputImagePattern = "pic/frame-%03d.png";

Ffmpeg(inputVideo)
  .output(outputImagePattern)
  .outputOptions(["-vf", "fps=1", "-q:v", "1"])
  .on("end", () => {
    recognizeImage("pic/frame-003.png").then((result) => {
      console.log("识别结果:", result);
    });
  })
  .on("error", (e: any) => {
    console.log("Error in extracting frames:", e);
  })
  .run();

async function recognizeImage(imagePath: string) {
  const worker = await createWorker("chi_sim"); // 中文识别用 chi_sim，英文用 eng
  const {
    data: { text },
  } = await worker.recognize(imagePath);
  await worker.terminate();
  return text;
}
