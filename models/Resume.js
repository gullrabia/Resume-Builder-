import mongoose from "mongoose";

const ResumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      default: "Untitled Resume",
      trim: true,
    },

    public: {
      type: Boolean,
      default: false,
    },

    template: {
      type: String,
      default: "classic",
    },

    accent_color: {
      type: String,
      default: "#3882F6",
    },

    professional_summary: {
      type: String,
      default: "",
      trim: true,
    },

    skills: [{ type: String, trim: true }],

    personal_info: {
      image: { type: String, default: "" },
      full_name: { type: String, default: "", trim: true },
      profession: { type: String, default: "", trim: true },
      email: { type: String, default: "", trim: true },
      phone: { type: String, default: "", trim: true },
      location: { type: String, default: "", trim: true },
      linkedin: { type: String, default: "", trim: true },
      website: { type: String, default: "", trim: true },
    },

    experience: [
      {
        company: { type: String, trim: true },
        position: { type: String, trim: true },
        start_date: { type: String },
        end_date: { type: String },
        description: { type: String, trim: true },
        is_current: { type: Boolean, default: false },
      },
    ],

    // renamed project → projects (better practice)
    projects: [
      {
        name: { type: String, trim: true },
        type: { type: String, trim: true },
        description: { type: String, trim: true },
      },
    ],

    education: [
      {
        institution: { type: String, trim: true },
        degree: { type: String, trim: true },
        field: { type: String, trim: true },
        graduation_date: { type: String },
        gpa: { type: String },
      },
    ],
  },
  { timestamps: true, minimize: false }
);

const Resume = mongoose.model("Resume", ResumeSchema);
export default Resume;