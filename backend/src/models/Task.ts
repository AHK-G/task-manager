import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
  title: string;
  completed: boolean;
  user: mongoose.Types.ObjectId;
  order: number;
  priority: "low" | "medium" | "high";
  dueDate?: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    dueDate: {
      type: Date,
    },
  },
  { timestamps: true },
);

export default mongoose.model<ITask>("Task", taskSchema);
