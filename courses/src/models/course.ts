import mongoose from "mongoose";

interface CourseAttrs {
  title: string;
  price: number;
  userId: string;
}

interface CourseDoc extends mongoose.Document {
  title: string;
  price: number;
  userId: string;
}

interface CourseModel extends mongoose.Model<CourseDoc> {
  build(attrs: CourseAttrs): CourseDoc;
}

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

courseSchema.statics.build = (attrs: CourseAttrs) => {
  return new Course(attrs);
};

const Course = mongoose.model<CourseDoc, CourseModel>("Course", courseSchema);

export { Course };
