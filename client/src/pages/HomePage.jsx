import { Boxes } from "../components/ui/background-boxes";
import { useState, useEffect } from "react";
import { FaGoogle, FaFacebookF, FaTwitter } from "react-icons/fa";

import PlotlyChart from "../components/PlotlyChart";

export default function HomePage() {
  const [modal, setModal] = useState("none");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPlotTypeModal, setShowPlotTypeModal] = useState(false);
  const [selectedChartType, setSelectedChartType] = useState("Bar"); // default chart
  const [selectedFile, setSelectedFile] = useState(null);
  const [excelData, setExcelData] = useState([]);
  const [xAxisColumn, setXAxisColumn] = useState("");
  const [yAxisColumn, setYAxisColumn] = useState("");
  const [stringColumns, setStringColumns] = useState([]);
  const [numericColumns, setNumericColumns] = useState([]);

  const [selectedPlotType, setSelectedPlotType] = useState(""); // Add this
  const [zAxisColumn, setZAxisColumn] = useState("");
  const [authData, setAuthData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    const savedData = localStorage.getItem("excelData");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setExcelData(parsed);

      const columns = Object.keys(parsed[0] || {});
      setXAxisColumn(columns[0]);
      setYAxisColumn(columns[1] || columns[0]);

      const sampleRow = parsed[0];
      const strings = columns.filter(
        (col) => typeof sampleRow[col] === "string"
      );
      const numbers = columns.filter(
        (col) => typeof sampleRow[col] === "number"
      );
      setStringColumns(strings);
      setNumericColumns(numbers);
    }
  }, [currentUser]); 

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 2000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("excelFile", selectedFile);

    try {
      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json().catch(() => {
        throw new Error("Server response is not valid JSON");
      });

      if (response.ok) {
        setSuccessMessage("✅ Upload successful!");
        // 🧼 Clean column names (trim extra spaces)
        const cleanedData = result.data.map((row) => {
          const cleanedRow = {};
          Object.keys(row).forEach((key) => {
            cleanedRow[key.trim()] = row[key];
          });
          return cleanedRow;
        });

        setExcelData(cleanedData);
        localStorage.setItem("excelData", JSON.stringify(cleanedData)); 

        // Extract and set axis columns
        const columns = Object.keys(cleanedData[0] || {});
        setXAxisColumn(columns[0]);
        setYAxisColumn(columns[1] || columns[0]);

        const sampleRow = result.data[0] || {};

        // Separate columns by type
        const stringColumns = columns.filter(
          (col) => typeof sampleRow[col] === "string"
        );
        const numericColumns = columns.filter(
          (col) => typeof sampleRow[col] === "number"
        );

        // Save for dropdowns
        setStringColumns(stringColumns);
        setNumericColumns(numericColumns);

        setXAxisColumn(columns[0]);
        setYAxisColumn(columns[1] || columns[0]);
      } else {
        alert("❌ Upload failed: " + result.msg);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("❌ Network or server error. " + error.message);
    }
  };

  const chartCategories = {
    Simple: [
      "Scatter",
      "Bar",
      "Line",
      "Area",
      "Pie",
      "Table",
      "Contour",
      "Heatmap",
    ],
    Distributions: [
      "Box",
      "Violin",
      "Histogram",
      "2D Histogram",
      "2D Contour Histogram",
    ],
    "3D": [
      "3D Scatter",
      "3D Line",
      "3D Surface",
      "3D Mesh",
      "Cone",
      "Streamtube",
    ],
    Maps: [
      "Tile Map",
      "Atlas Map",
      "Choropleth Tile Map",
      "Choropleth Atlas Map",
      "Density Tile Map",
    ],
    Finance: ["Candlestick", "OHLC", "Waterfall", "Funnel", "Funnel Area"],
    Specialized: [
      "Polar Scatter",
      "Polar Bar",
      "Ternary Scatter",
      "Sunburst",
      "Treemap",
      "Sankey",
      "Parallel Coordinates",
      "Carpet",
    ],
  };

  const handleSignUp = async () => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authData),
      });

      const result = await res.json();
      if (res.ok) {
        setSuccessMessage("✅ Signed up successfully");
        setModal("none");
        setAuthData({ username: "", email: "", password: "" });
      } else {
        alert("❌ Sign up failed: " + result.msg);
      }
    } catch (err) {
      alert("❌ Network error: " + err.message);
    }
  };

  const handleSignIn = async () => {
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: authData.email,
          password: authData.password,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        setSuccessMessage("✅ Signed in successfully");
        localStorage.setItem("token", result.token); // Save token for later use
        setCurrentUser(result.user); // Save logged-in user
        setModal("none");
      } else {
        alert("❌ Sign in failed: " + result.msg);
      }
    } catch (err) {
      alert("❌ Network error: " + err.message);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0f172a] px-4 text-white">
      <Boxes className="z-0 absolute top-0 left-0 w-full h-full" />

      <div className="absolute top-0 left-0 right-0 flex items-center justify-between bg-opacity-50 px-8 py-4">
        <h1 className="text-xl font-bold text-white">📊 Excel Analytics</h1>

        {currentUser ? (
          <div className="flex items-center space-x-4">
            <span className="text-white text-sm">
              👤 {currentUser.username}
            </span>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("excelData"); // clear saved Excel data too
                setCurrentUser(null);
                setExcelData([]); // clear from memory
                setSuccessMessage("🚪 Logged out successfully");
              }}
              className="rounded bg-red-500 px-4 py-1 text-sm hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="space-x-4">
            <button
              onClick={() => setModal("signin")}
              className="rounded border border-white px-4 py-1 text-sm hover:bg-white hover:text-black"
            >
              Sign In
            </button>
            <button
              onClick={() => setModal("signup")}
              className="rounded bg-blue-500 px-4 py-1 text-sm hover:bg-blue-600"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>

      {successMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 rounded bg-green-100 px-6 py-3 text-green-800 shadow-md">
          {successMessage}
        </div>
      )}

      <div className="z-10 mt-24 w-full max-w-3xl text-center">
        <h2 className="text-3xl font-bold md:text-4xl">Excel Chart Studio</h2>
        <p className="mt-2 text-gray-300">
          Search public charts by Chart Studio users
        </p>

        <div className="mt-6 flex items-center justify-center">
          <input
            type="text"
            placeholder="Type to search"
            className="w-full max-w-xl rounded-l-md border border-gray-400 px-4 py-2 text-black"
          />
          <button className="rounded-r-md bg-gray-300 px-4 py-2 text-black">
            🔍
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
          <select className="rounded-md bg-white px-4 py-2 text-sm text-black">
            <option>💙 Handpicked</option>
          </select>
          <select className="rounded-md bg-white px-4 py-2 text-sm text-black">
            <option>📂 All File Types</option>
          </select>
          <button
            onClick={() => setShowPlotTypeModal(true)}
            className="relative rounded-md bg-white px-4 py-2 pr-8 text-sm text-black border appearance-none"
          >
            📈 Plot Type
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
              ▼
            </span>
          </button>
        </div>

        <div className="mt-6 flex flex-col items-center">
          <input
            type="file"
            accept=".xlsx"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            className="text-sm text-white mb-2"
          />
          <button
            onClick={handleUpload}
            disabled={!selectedFile}
            className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:bg-gray-400"
          >
            Upload Excel File
          </button>
        </div>
      </div>

      {excelData && excelData.length > 0 && excelData[0] && (
        <div className="mt-8 w-full max-w-4xl overflow-x-auto bg-white text-black rounded p-4 shadow-lg z-10 relative">
          <h3 className="mb-2 text-lg font-semibold">📄 Uploaded Excel Data</h3>
          <table className="min-w-full border border-gray-300 bg-white text-black rounded">
            <thead>
              <tr className="bg-gray-200">
                {Object.keys(excelData[0] || {}).map((header, idx) => (
                  <th key={idx} className="px-4 py-2 border">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {excelData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-100">
                  {Object.values(row).map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-2 border">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {excelData.length > 0 && (
        <div className="mt-6 w-full max-w-4xl bg-white text-black rounded-lg p-4 shadow z-10">
          <h3 className="text-lg font-semibold mb-4">📌 Select Axes</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* X-Axis Selector */}
            <div>
              <label className="block font-medium mb-1">X-Axis:</label>
              <select
                className="w-full text-black rounded px-3 py-2 border border-gray-300"
                value={xAxisColumn}
                onChange={(e) => setXAxisColumn(e.target.value)}
              >
                {[...stringColumns, ...numericColumns].map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            {/* Y-Axis Selector */}
            <div>
              <label className="block font-medium mb-1">Y-Axis:</label>
              <select
                className="w-full text-black rounded px-3 py-2 border border-gray-300"
                value={yAxisColumn}
                onChange={(e) => setYAxisColumn(e.target.value)}
              >
                {numericColumns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            {/* Z-Axis Selector (only for 3D) */}
            {[
              "3D Scatter",
              "3D Line",
              "3D Surface",
              "3D Mesh",
              "Cone",
              "Streamtube",
            ].includes(selectedPlotType) && (
              <div>
                <label className="block font-medium mb-1">Z-Axis:</label>
                <select
                  className="w-full text-black rounded px-3 py-2 border border-gray-300"
                  value={zAxisColumn}
                  onChange={(e) => setZAxisColumn(e.target.value)}
                >
                  {numericColumns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {excelData.length > 0 && selectedPlotType && (
        <PlotlyChart
          data={excelData}
          xAxis={xAxisColumn}
          yAxis={yAxisColumn}
          zAxis={zAxisColumn} 
          plotType={selectedPlotType}
        />
      )}

      {showPlotTypeModal && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-50 px-4 py-6">
          <div className="w-full max-w-4xl bg-white rounded-lg p-6 overflow-y-auto max-h-[90vh] text-black">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Select Trace Type</h3>
              <button
                onClick={() => setShowPlotTypeModal(false)}
                className="text-xl font-bold hover:text-red-600"
              >
                &times;
              </button>
            </div>
            {Object.entries(chartCategories).map(([category, types]) => (
              <div key={category} className="mb-6">
                <h4 className="text-lg font-semibold mb-2">{category}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {types.map((type, index) => (
                    <div
                      key={index}
                      className="border rounded-md p-3 text-center bg-gray-100 hover:bg-blue-100 cursor-pointer"
                      onClick={() => {
                        setSelectedPlotType(type);
                        setShowPlotTypeModal(false); // Close modal
                      }}
                    >
                      {type}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {modal !== "none" && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50 px-2 py-4">
          <div className="relative flex w-full max-w-md flex-col overflow-hidden rounded-lg bg-white shadow-lg sm:max-w-2xl md:flex-row">
            <button
              onClick={() => setModal("none")}
              className="absolute right-4 top-4 z-30 text-gray-400 hover:text-black text-2xl font-bold"
            >
              &times;
            </button>

            {/* Left Side Panel */}
            <div className="flex w-full items-center justify-center bg-slate-800 p-6 text-white md:w-1/2">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-semibold">📊 Chart Studio</h3>
                <p className="mt-2 text-sm">
                  Analyze and visualize data, together.
                </p>
              </div>
            </div>

            {/* Right Form Panel */}
            <div className="relative w-full p-6 md:w-1/2">
              <div className="mb-4 flex justify-between border-b pb-2 text-sm">
                <button
                  className={`${
                    modal === "signin" ? "font-bold" : "text-gray-500"
                  }`}
                  onClick={() => setModal("signin")}
                >
                  SIGN IN
                </button>
                <button
                  className={`${
                    modal === "signup" ? "font-bold" : "text-gray-500"
                  }`}
                  onClick={() => setModal("signup")}
                >
                  SIGN UP
                </button>
              </div>

              {modal === "signin" ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Email"
                    value={authData.email}
                    onChange={(e) =>
                      setAuthData({ ...authData, email: e.target.value })
                    }
                    className="w-full rounded-md border px-4 py-2 text-black"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={authData.password}
                    onChange={(e) =>
                      setAuthData({ ...authData, password: e.target.value })
                    }
                    className="w-full rounded-md border px-4 py-2 text-black"
                  />
                  <button
                    onClick={handleSignIn}
                    className="w-full rounded-md bg-blue-600 px-4 py-2 text-white"
                  >
                    SIGN IN
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Username"
                    value={authData.username}
                    onChange={(e) =>
                      setAuthData({ ...authData, username: e.target.value })
                    }
                    className="w-full rounded-md border px-4 py-2 text-black"
                  />
                  <input
                    type="text"
                    placeholder="Email"
                    value={authData.email}
                    onChange={(e) =>
                      setAuthData({ ...authData, email: e.target.value })
                    }
                    className="w-full rounded-md border px-4 py-2 text-black"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={authData.password}
                    onChange={(e) =>
                      setAuthData({ ...authData, password: e.target.value })
                    }
                    className="w-full rounded-md border px-4 py-2 text-black"
                  />
                  <button
                    onClick={handleSignUp}
                    className="w-full rounded-md bg-blue-600 px-4 py-2 text-white"
                  >
                    SIGN UP
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
