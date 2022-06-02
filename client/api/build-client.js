import axios from "axios";

const buildClient = ({ req }) => {
  if (typeof window === "undefined") {
    // On Server
    return axios.create({
      baseURL: "http://learngenering-prod-dakarakoso.click",
      headers: req.headers,
    });
  } else {
    // On Browser
    return axios.create({
      baseURL: "/",
    });
  }
};

export default buildClient;
