import { useEffect } from "react";
import Router from "next/router";
import { UseRequest } from "../../hooks/use-request";

export default () => {
  const { doRequest } = UseRequest({
    url: "/api/users/signout",
    method: "post",
    body: {},
    onSuccess: () => Router.push("/"),
  });

  useEffect(() => {
    doRequest();
  }, []);
  return <div>Signing out</div>;
};
