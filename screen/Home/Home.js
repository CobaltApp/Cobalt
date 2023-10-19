import React, { useRef } from "react";
import Header from "./Header";
import Actions from "./Actions";
import Transactions from "./Transactinos";
//import Popular from "../../components/Popular";
//import News from "../../components/News";

const Home = () => {
  const scrollToRef = useRef(null);

  return (
    <>
      <Header/>
      <Actions/>
      <Transactions/>
      {/* <Steps scrollToRef={scrollToRef}/> */}
      {/* <Learn scrollToRef={scrollToRef}/> */}
      //<Popular classSection="section-bg section-mb0" />
      {/* <Trend /> */}
      {/* <Download /> */}
      {/* <News classSection="section-bg" /> */}
    </>
  );
};

export default Home;