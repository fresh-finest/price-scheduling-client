import { Button } from "react-bootstrap";
import { Form } from "react-bootstrap";
import { FiTrash } from "react-icons/fi";

const ManageUsersLoadingSkeleton = () => {
  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div className="px-4 py-3  bg-gray-800/20 animate-pulse rounded-md"></div>
      </div>
      <table
        style={{
          tableLayout: "fixed",
          marginTop: "6px",
          boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
        }}
        className=" userCustomTable table"
      >
        <thead
          style={{
            backgroundColor: "#f0f0f0",
            color: "#333",
            fontFamily: "Arial, sans-serif",
            fontSize: "14px",
          }}
        >
          <tr>
            <th
              style={{
                textAlign: "center",
                verticalAlign: "middle",

                borderRight: "2px solid #C3C6D4",
              }}
            >
              <p className=" bg-gray-800/20 animate-pulse w-24 h-4 mx-auto"></p>
            </th>
            <th
              style={{
                textAlign: "center",
                verticalAlign: "middle",
                borderRight: "2px solid #C3C6D4",
              }}
            >
              <p className=" bg-gray-800/20 animate-pulse w-24 h-4 mx-auto"></p>
            </th>
            <th
              style={{
                textAlign: "center",
                verticalAlign: "middle",
                borderRight: "2px solid #C3C6D4",
              }}
            >
              <p className=" bg-gray-800/20 animate-pulse w-24 h-4 mx-auto"></p>
            </th>
            <th
              style={{
                textAlign: "center",
                verticalAlign: "middle",
                borderRight: "2px solid #C3C6D4",
              }}
            >
              <p className=" bg-gray-800/20 animate-pulse w-24 h-4 mx-auto"></p>
            </th>
            <th
              style={{
                textAlign: "center",
                verticalAlign: "middle",
              }}
            >
              <p className=" bg-gray-800/20 animate-pulse w-24 h-4 mx-auto"></p>
            </th>
          </tr>
        </thead>
        <tbody>
          {Array(10)
            .fill(null)
            .map((user, index) => (
              <tr key={index}>
                {/* <td><img src={user.avatar} alt="avatar" style={{ width: '50px', height: '50px', borderRadius: '50%' }} /></td>
                 */}
                <td
                  style={{
                    textAlign: "center",
                    verticalAlign: "middle",
                    // cursor: "pointer",
                    height: "40px",
                  }}
                >
                  <p className=" bg-gray-800/20 animate-pulse w-32 h-4 mx-auto"></p>
                </td>
                <td
                  style={{
                    textAlign: "center",
                    verticalAlign: "middle",
                    // cursor: "pointer",
                    height: "40px",
                  }}
                >
                  <p className=" bg-gray-800/20 animate-pulse w-32 h-4 mx-auto "></p>
                </td>
                <td
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    textAlign: "center",
                    verticalAlign: "middle",
                    // cursor: "pointer",
                    height: "40px",
                  }}
                >
                  <p className=" bg-gray-800/20 animate-pulse w-full h-8 mx-auto rounded-md"></p>
                </td>
                <td
                  style={{
                    textAlign: "center",
                    verticalAlign: "middle",
                    // cursor: "pointer",
                    height: "40px",
                  }}
                >
                  <p className=" bg-gray-800/20 animate-pulse w-24 h-4 mx-auto"></p>
                </td>
                <td
                  style={{
                    textAlign: "center",
                    verticalAlign: "middle",
                    // cursor: "pointer",
                    height: "40px",
                  }}
                >
                  <p className=" bg-gray-800/20 animate-pulse w-10 h-7 rounded-md mx-auto"></p>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            onClick={() => handleShowModal()}
            // style={{ width: "8%", backgroundColor: "black" }}
            className="px-3 py-2  bg-[#0662BB] text-white"
          >
            <FaUserPlus />
          </Button>
        </div> */}
    </>
  );
};

export default ManageUsersLoadingSkeleton;