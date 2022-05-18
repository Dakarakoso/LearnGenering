import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { Order, OrderStatus } from "./order";

interface CourseAttrs {
  title: string;
  price: number;
  id: string;
}

export interface CourseDoc extends mongoose.Document {
  title: string;
  price: number;
  version: number;
  isReserved(): Promise<boolean>;
}

interface CourseModel extends mongoose.Model<CourseDoc> {
  build(attrs: CourseAttrs): CourseDoc;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<CourseDoc | null>;
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
      min: 0,
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

courseSchema.set("versionKey", "version");
courseSchema.plugin(updateIfCurrentPlugin);

// if the updateIfCurrentPlugin is not available use this instead
// courseSchema.pre("save", function (done) {
//   this.$where = {
//     version: this.get("version") - 1,
//   };
//   done();
// });

courseSchema.statics.findByEvent = (event: { id: string; version: number }) => {
  return Course.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};
courseSchema.statics.build = (attrs: CourseAttrs) => {
  return new Course({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price,
  });
};
courseSchema.methods.isReserved = async function () {
  // this === the ticket document that we just called 'isReserved' on
  const existingOrder = await Order.findOne({
    course: this as any,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });

  return !!existingOrder;
};

const Course = mongoose.model<CourseDoc, CourseModel>("Course", courseSchema);

export { Course };
