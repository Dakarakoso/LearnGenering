import Router from "next/router";
import UseRequest from "../../hooks/use-request";

const CourseShow = ({ course }) => {
  const { doRequest, errors } = UseRequest({
    url: "/api/orders",
    method: "post",
    body: {
      courseId: course.id,
    },
    onSuccess: (order) =>
      Router.push("/orders/[orderId]", `/orders/${order.id}`),
  });
  return (
    <div>
      <h1>{course.title}</h1>
      <h4>Price: {course.price}</h4>
      {errors}
      <button onClick={() => doRequest()} className="btn btn-primary">
        Purchase
      </button>
    </div>
  );
};

CourseShow.getInitialProps = async (context, client) => {
  const { courseId } = context.query;
  const { data } = await client.get(`/api/courses/${courseId}`);
  return { course: data };
};

export default CourseShow;
