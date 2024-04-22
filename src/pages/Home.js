import React from "react";
import Dashboard from "./Dashboard";
import LandingPage from "./LandingPage";
const Home = ({ isAuth }) => {
  return <div>{isAuth ? <Dashboard isAuth={true} /> : <LandingPage />}</div>;
};

export default Home;
