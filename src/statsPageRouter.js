
import React from "react";
import { useParams } from "react-router-dom";
import StatsPage from "./statspage";

function StatsPageRouter(props) {
  const { code } = useParams();
  return <StatsPage code={code} {...props} />;
}

export default StatsPageRouter;
