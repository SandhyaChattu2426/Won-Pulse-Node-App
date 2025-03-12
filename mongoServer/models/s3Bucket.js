const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const crypto = require("crypto");
const path = require("path");
require("dotenv").config()


// Initialize S3 Client
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
    },
});

//  Uploads an image to the S3 bucket.

const uploadFileToS3Bucket = async (file) => {
    try {
        // Validate file input
        if (!file || !file.buffer) {
            throw new Error("No file provided or invalid file buffer.");
        }

        // Generate a unique file name
        const fileExtension = path.extname(file.originalname); // Preserve original extension
        const randomName = crypto.randomBytes(16).toString("hex");
        const key = `uploads/${randomName}${fileExtension}`;

        // Prepare S3 upload parameters
        const uploadParams = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype || "application/octet-stream", // Fallback for unknown types
            ACL: "public-read", // Optional: Change if you want private files
        };

        // Upload file to S3
        await s3Client.send(new PutObjectCommand(uploadParams));

        // Construct the file URL
        const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

        console.log("File uploaded successfully:", fileUrl);
        return fileUrl;
    } catch (err) {
        console.error("Error uploading file:", err);
        throw new Error(`File upload failed: ${err.message}`);
    }
};


//  Deletes an image from the S3 bucket.

const deleteImageFromS3Bucket = async (imageUrl) => {
    try {
        if (!imageUrl) {
            throw new Error("No image URL provided");
        }

        const bucketName = process.env.S3_BUCKET_NAME;
        const region = process.env.AWS_REGION;
        const bucketBaseUrl = `https://${bucketName}.s3.${region}.amazonaws.com/`;

        // Check if the imageUrl belongs to the correct bucket
        if (!imageUrl.startsWith(bucketBaseUrl)) {
            throw new Error("Invalid URL for this bucket");
        }

        // Extract the object key from the URL
        const objectKey = imageUrl.replace(bucketBaseUrl, "");

        console.log("Deleting object with key:", objectKey);

        // Prepare delete parameters
        const deleteParams = {
            Bucket: bucketName,
            Key: objectKey,
        };

        // Delete the object
        await s3Client.send(new DeleteObjectCommand(deleteParams));

        console.log("File deleted successfully!");
    } catch (err) {
        console.error("Error deleting image:", err);
        throw new Error(`Image deletion failed: ${err.message}`);
    }
};

module.exports = { uploadFileToS3Bucket, deleteImageFromS3Bucket };
