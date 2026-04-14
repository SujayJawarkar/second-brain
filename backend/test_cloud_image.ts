import "dotenv/config";
import { cloudinary } from "./src/config/cloudinary";

async function testUploadAsImage() {
  const dummyPdf = Buffer.from("dummy pdf content %PDF-1.4");
  try {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "test_folder",
        public_id: "example3.pdf", // Important: must have .pdf
        resource_type: "image", // Test as image
      },
      (error, result) => {
        if (error) console.error(error);
        if (result) {
          console.log("Uploaded as image!", result.secure_url);
        }
      }
    );
    
    uploadStream.end(dummyPdf);
  } catch (err) {
    console.error("Upload failed", err);
  }
}
testUploadAsImage();
