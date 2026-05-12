'use client';

import React from "react";

function BoardsLoader() {
  const boardsLoaderClass = "bg-gray-800 flex rounded-r-3xl relative h-[39px] mr-7";
  return (
    <>
      <div className={boardsLoaderClass}></div>
      <div className={boardsLoaderClass}></div>
      <div className={boardsLoaderClass}></div>
      <div className={boardsLoaderClass}></div>
      <div className={boardsLoaderClass}></div>
      <div className={boardsLoaderClass}></div>
    </>
  );
}

export default BoardsLoader;
