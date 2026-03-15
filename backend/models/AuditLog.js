import mongoose from "mongoose"

const AuditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    targetType: {
      type: String,
      required: true,
    },

    metadata: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
)

export default mongoose.model("AuditLog", AuditLogSchema)