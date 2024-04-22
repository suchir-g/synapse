import React from "react";
import Dashboard from "./Dashboard";
const Home = ({ isAuth }) => {
  return <div>{isAuth && <Dashboard isAuth={isAuth} />}</div>;
};

export default Home;
