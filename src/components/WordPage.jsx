import React, { useEffect, useRef } from "react";

const WordPage = ({ html }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = html;
  }, [html]);

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        height: "100%",
        padding: 20,
        boxSizing: "border-box",
        overflow: "hidden",
        background: "white"
      }}
    />
  );
};

export default WordPage;
