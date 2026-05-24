import ImageKit from "@imagekit/nodejs";
import Resume from "../models/Resume.js";
import fs from "fs";

//  ImageKit config (IMPORTANT)
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
 
});

// CREATE RESUME
export const createResume = async (req, res) => {
  try {
    const userId = req.userId;
    const { title } = req.body;

    const newResume = await Resume.create({
      userId,
      title: title || "Untitled Resume",
    });

    return res.status(201).json({
      message: "Resume Created Successfully",
      resume: newResume,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// DELETE RESUME
export const deleteResume = async (req, res) => {
  try {
    const userId = req.userId;
    const { resumeId } = req.params;

    const deleted = await Resume.findOneAndDelete({
      userId,
      _id: resumeId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Resume not found" });
    }

    return res.status(200).json({
      message: "Resume Deleted Successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET RESUME BY ID
export const getResumeById = async (req, res) => {
  try {
    const userId = req.userId;
    const { resumeId } = req.params;

    const resume = await Resume.findOne({
      userId,
      _id: resumeId,
    }).select("-__v -createdAt -updatedAt");

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    return res.status(200).json({ resume });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET PUBLIC RESUME
export const getPublicResumeById = async (req, res) => {
  try {
    const { resumeId } = req.params;

    const resume = await Resume.findOne({
      _id: resumeId,
      public: true,
    });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    return res.status(200).json({ resume });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// UPDATE RESUME
export const updateResume = async (req, res) => {
  try {
    const userId = req.userId;
    const { resumeId, resumeData, removeBackground } = req.body;
    const image = req.file;

    let resumeDataCopy = JSON.parse(JSON.stringify(resumeData));

    // upload image if exists
    if (image) {
      const fileBuffer = fs.readFileSync(image.path);

      const response = await imagekit.upload({
        file: fileBuffer,
        fileName: "resume.png",
        folder: "user-resume",
        transformation: {
          pre:
            "w-300,h-300,fo-face,z-0.75" +
            (removeBackground ? ",e-bgremove" : ""),
        },
      });

      resumeDataCopy.personal_info.image = response.url;

      // delete temp file
      fs.unlinkSync(image.path);
    }

    const resume = await Resume.findOneAndUpdate(
      { userId, _id: resumeId },
      resumeDataCopy,
      { new: true }
    );

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    return res.status(200).json({
      message: "Saved successfully",
      resume,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};