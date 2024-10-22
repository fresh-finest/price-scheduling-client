import priceoboIcon from "../../../assets/images/pricebo-icon.png";
const Loading = () => {
  return (
    <div className=" ">
      <div className="flex justify-center items-center ">
        <img
          style={{ width: "40px", marginRight: "6px" }}
          className="animate-pulse"
          src={priceoboIcon}
          alt="Priceobo Icon"
        />
        <br />

        <div className="block">
          <p className="text-xl"> Loading...</p>
        </div>
      </div>
    </div>
  );
};

export default Loading;
