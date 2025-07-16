// External Libraries
import { useState, useEffect } from "react";
import { FaGoogle, FaFacebookF, FaTwitter } from "react-icons/fa";

// Internal Components
import { Boxes } from "../components/ui/background-boxes";
import PlotlyChart from "../components/PlotlyChart";

export default function HomePage() {
  const [modal, setModal] = useState("none");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPlotTypeModal, setShowPlotTypeModal] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState({ label: "Handpicked", icon: "💙" });
  const [showFileTypeDropdown, setShowFileTypeDropdown] = useState(false);
  const [selectedFileType, setSelectedFileType] = useState({ label: "All File Types", icon: "📂" });
  const [selectedFile, setSelectedFile] = useState(null);
  const [excelData, setExcelData] = useState([]);
  const [xAxisColumn, setXAxisColumn] = useState("");
  const [yAxisColumn, setYAxisColumn] = useState("");
  const [zAxisColumn, setZAxisColumn] = useState("");
  const [selectedPlotType, setSelectedPlotType] = useState("");
  const [stringColumns, setStringColumns] = useState([]);
  const [numericColumns, setNumericColumns] = useState([]);

  const handleUpload = async () => { //is it check out file was upload or not
    if (!selectedFile) return;         //if file was not upload  this is not working
    const formData = new FormData();  //formdata is the object it was add the excelfile with key
    formData.append("file", selectedFile);  //key "file" it was match by backend data upload "file"

    try {
      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST", //this is fetch the data fro backend api /upload and this post request kare che file sathe
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed"); //this was handle the error

      const data = await response.json(); //backend data excel to json 
      setExcelData(data);  //use exceldata and store in froentend 

      const sampleRow = data[0]; //sample row created and detect the data
      const stringCols = [];
      const numericCols = [];

      Object.keys(sampleRow).forEach((key) => { // check the data value from excel sheet row
        const val = sampleRow[key];
        if (!isNaN(parseFloat(val)) && isFinite(val)) {
          numericCols.push(key); //when is it numeric clos to store in numeric row
        } else {
          stringCols.push(key); //if this data are string cols store in string cols
        }
      });

      setStringColumns(stringCols);  //store in sepreate columns for dropdown
      setNumericColumns(numericCols);
      setXAxisColumn(stringCols[0] || numericCols[0]); // always x is not always but mostly x is string
      setYAxisColumn(numericCols[0] || ""); //y is numeric 
      setZAxisColumn(numericCols[1] || "");  //z is 2nd numeric 
    } catch (err) {
      console.error("Error uploading file:", err); //this is giving to the error
    }
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 2000); //this msg was only show 2sec
      return () => clearTimeout(timer); //if you are not leck your memory thats why im using clear timeout function
    }
  }, [successMessage]);  // file upload suceessdully show the mess successfully

  const handleSelect = (label, icon) => { //this is dropdown function for the chart dashboad file nd etc
    setSelectedOption({ label, icon });
    setOpen(false);
  };

  const chartCategories = {
    Simple: ["Scatter", "Bar", "Line", "Area", "Pie", "Table", "Contour", "Heatmap"],
    Distributions: ["Box", "Violin", "Histogram", "2D Histogram", "2D Contour Histogram"],
    "3D": ["3D Scatter", "3D Line", "3D Surface", "3D Mesh", "Cone", "Streamtube"],
    Maps: ["Tile Map", "Atlas Map", "Choropleth Tile Map", "Choropleth Atlas Map", "Density Tile Map"],
    Finance: ["Candlestick", "OHLC", "Waterfall", "Funnel", "Funnel Area"],
    Specialized: [
      "Polar Scatter", "Polar Bar", "Ternary Scatter", "Sunburst",
      "Treemap", "Sankey", "Parallel Coordinates", "Carpet"
    ]
  };

  return (
    <div className="relative flex  min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0f172a] px-4 text-white">
      <Boxes />

      {/* Navbar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between bg-opacity-50 px-8 py-4">
        <h1 className="text-xl font-bold text-white ">Excel Analytics</h1>
        <div className="space-x-4">
          <button onClick={() => setModal("signin")} className="rounded border border-white px-4 py-1 text-sm hover:bg-white hover:text-black">Sign In</button>
          <button onClick={() => setModal("signup")} className="rounded bg-blue-500 px-4 py-1 text-sm hover:bg-blue-600">Sign Up</button>
        </div>
      </div>

      {/* Success popup */}
      {successMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 rounded bg-green-100 px-6 py-3 text-green-800 shadow-md">
          {successMessage}
        </div>
      )}

      {/* Main Center Block */}
      <div className="z-10 mt-20 w-full max-w-3xl text-center">
        <h2 className="text-3xl font-bold md:text-4xl font-serif">Excel Chart Studio</h2>
        <p className="mt-2 text-gray-400 ">Any public charts by Chart Studio users</p>

        {/* <div className="mt-6 flex items-center justify-center">
          <input type="text" placeholder="Type to search" className="w-full max-w-xl rounded-l-md border border-gray-400 px-4 py-2 text-black" />
          <button className="rounded-r-md bg-gray-300 px-4 py-2 text-black">🔍</button>
        </div> */}

        <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
          {/* Handpicked Dropdown */}
          <div className="relative inline-block text-left">
            <button onClick={() => setOpen(!open)} className="bg-white px-4 py-2 rounded shadow flex items-center gap-2 text-black">
              <span>{selectedOption.icon}</span>
              <span>{selectedOption.label}</span>
              <span className="text-gray-500">▼</span>
            </button>
            {open && (
              <div className="absolute mt-2 w-64 rounded-md bg-white shadow-lg z-10">
                <ul className="py-1 text-sm text-gray-700">
                  {[
                    { label: "Handpicked", icon: "💙", desc: "Beautiful plots curated by the Plotly team" },
                    { label: "Popular", icon: "⭐", desc: "Most popular plots on Plotly" },
                    { label: "Recent", icon: "🕒", desc: "Latest user-created plots" },
                  ].map(({ label, icon, desc }) => (
                    <li key={label} onClick={() => handleSelect(label, icon)} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                      {icon} {label}<br />
                      <span className="text-xs text-gray-500">{desc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* File Types Dropdown */}
          <div className="relative inline-block text-left">
            <button onClick={() => setShowFileTypeDropdown(!showFileTypeDropdown)} className="bg-white px-4 py-2 rounded-md shadow text-sm text-black flex items-center gap-2">
              {selectedFileType.icon} {selectedFileType.label} <span className="text-gray-500">▼</span>
            </button>
            {showFileTypeDropdown && (
              <div className="absolute z-20 mt-2 w-48 rounded-md bg-white shadow-lg">
                <ul className="py-1 text-sm text-gray-700">
                  {[
                    { label: "All File Types", icon: "📂" },
                    { label: "Chart", icon: "📊" },
                    { label: "Dashboard", icon: "🧩" },
                  ].map((item) => (
                    <li key={item.label} onClick={() => { setSelectedFileType(item); setShowFileTypeDropdown(false); }} className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2">
                      {item.icon} {item.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Plot Type Button */}
          <button onClick={() => setShowPlotTypeModal(true)} className="relative rounded-md bg-white px-4 py-2 pr-8 text-sm text-black border appearance-none">
            📈 Plot Type
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">▼</span>
          </button>
        </div>

        {/* Upload Section */}
        <div className="mt-6 flex flex-col items-center gap-2">
          <input type="file" accept=".xlsx, .xls, .csv" onChange={(e) => setSelectedFile(e.target.files[0])}
            className="text-sm text-white file:bg-blue-500 file:text-black  file:border-0 file:px-4 file:py-2 file:rounded-md file:cursor-pointer"
          />
          <button onClick={handleUpload} className="bg-blue-500 text-black px-4 py-2 rounded-md hover:text-white hover:bg-blue-700">
            Upload Excel File
          </button>
        </div>
          {/* Plot Chart */}
      {excelData.length > 0 && selectedPlotType && (
        <>
          <h3 className="mt-8 text-xl font-semibold text-center"> Your Chart Preview</h3>
          <PlotlyChart
            data={excelData}
            xAxis={xAxisColumn}
            yAxis={yAxisColumn}
            zAxis={zAxisColumn}
            plotType={selectedPlotType}
          />
        </>
      )}
      </div>


      {/* Plot Type Modal */}
      {showPlotTypeModal && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-50 px-4 py-6">
          <div className="w-full max-w-4xl bg-white rounded-lg p-6 overflow-y-auto max-h-[90vh] text-black">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Select Trace Type</h3>
              <button onClick={() => setShowPlotTypeModal(false)} className="text-xl font-bold hover:text-red-600">&times;</button>
            </div>
            {Object.entries(chartCategories).map(([category, types]) => (
              <div key={category} className="mb-6">
                <h4 className="text-lg font-semibold mb-2">{category}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {types.map((type, index) => (
                    <div key={index} onClick={() => { setSelectedPlotType(type); setShowPlotTypeModal(false); }}
                      className="border rounded-md p-3 text-center bg-gray-100 hover:bg-blue-100 cursor-pointer">
                      {type}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Auth Modals */}
      {modal !== "none" && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50 px-2 py-4">
          <div className="relative flex w-full max-w-md flex-col overflow-hidden rounded-lg bg-white shadow-lg sm:max-w-2xl md:flex-row">
            {modal === "signup" && (
              <button onClick={() => setModal("none")} className="absolute right-4 top-4 z-30 text-gray-400 hover:text-black text-2xl font-bold">&times;</button>
            )}
            <div className="flex w-full items-center justify-center bg-slate-800 p-6 text-white md:w-1/2">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-semibold">Chart Studio</h3>
                <p className="mt-2 text-sm">Analyze and visualize data, together.</p>
                <p className="mt-2 text-sm">Sign in or sign up now!</p>
              </div>
            </div>
            <div className="relative w-full p-6 md:w-1/2">
              <div className="mb-4 flex justify-between border-b pb-2 text-sm">
                <button className={`${modal === "signin" ? "font-bold" : "text-gray-500"}`} onClick={() => setModal("signin")}>SIGN IN</button>
                <button className={`${modal === "signup" ? "font-bold" : "text-gray-500"}`} onClick={() => setModal("signup")}>SIGN UP</button>
              </div>
              {modal === "signin" ? (
                <div className="space-y-4">
                  <input type="text" placeholder="Username" className="w-full rounded-md border px-4 py-2 text-black" />
                  <input type="password" placeholder="Password" className="w-full rounded-md border px-4 py-2 text-black" />
                  <button onClick={() => setSuccessMessage("Signed in successfully")} className="w-full rounded-md bg-blue-600 px-4 py-2 text-white">SIGN IN</button>
                  <div className="text-center text-sm text-gray-500 mt-2">or continue with</div>
                  <div className="mt-2 flex justify-center gap-4">
                    <FaFacebookF className="text-blue-600 hover:text-blue-800 cursor-pointer" size={20} />
                    <FaTwitter className="text-blue-400 hover:text-blue-600 cursor-pointer" size={20} />
                    <FaGoogle className="text-red-500 hover:text-red-700 cursor-pointer" size={20} />
                  </div>
                  <a href="/forgot-password" className="text-center text-sm text-blue-500 hover:underline block mt-4">Forgot your password?</a>
                </div>
              ) : (
                <div className="space-y-4">
                  <input type="text" placeholder="First Name" className="w-full rounded-md border px-4 py-2 text-black" />
                  <input type="text" placeholder="Last Name" className="w-full rounded-md border px-4 py-2 text-black" />
                  {/* <input type="text" placeholder="Organization Name" className="w-full rounded-md border px-4 py-2 text-black" />
                  <input type="text" placeholder="Role" className="w-full rounded-md border px-4 py-2 text-black" /> */}
                  <input type="email" placeholder="Email" className="w-full rounded-md border px-4 py-2 text-black" />
                  <input type="text" placeholder="Username" className="w-full rounded-md border px-4 py-2 text-black" />
                  <input type="password" placeholder="Password" className="w-full rounded-md border px-4 py-2 text-black" />
                  <button onClick={() => setSuccessMessage("Signed up successfully")} className="w-full rounded-md bg-blue-600 px-4 py-2 text-white">SIGN UP</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
