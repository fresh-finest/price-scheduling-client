import React from "react";
import Header from "../components/shared/Header";
import ListView from "../components/List/ListView";
import ListViewNewTable from "@/components/List/ListViewNewTable";
import ListViewBackup from "@/components/List/ListViewBackup";

function List() {
  return (
    <div>
      {/* <Header/> */}
      <ListView />
      {/* <ListViewNewTable></ListViewNewTable> */}
    </div>
  );
}

export default List;
