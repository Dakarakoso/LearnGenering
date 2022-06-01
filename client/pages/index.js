import Link from "next/link";
const LandingPage = ({ currentUser, courses }) => {
  const courseList = courses.map((course) => {
    return (
      <tr key={course.id}>
        <td>{course.title}</td>
        <td>{course.price}</td>
        <td>
          <Link href="/courses/[courseId]" as={`/courses/${course.id}`}>
            <a>View</a>
          </Link>
        </td>
      </tr>
    );
  });
  return (
    <div>
      <h1> Courses </h1>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>{courseList}</tbody>
      </table>
    </div>
  );
};

LandingPage.getInitialProps = async (context, client, currentUser) => {
  const { data } = await client.get("/api/courses");
  return { courses: data };
};
export default LandingPage;
