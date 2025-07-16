//this is plotly chart when i slect any chart plolty chart was automatic x/y/z axies 
//create and show the chart  
import Plot from "react-plotly.js";

const PlotlyChart = ({ data, xAxis, yAxis, zAxis, plotType }) => {
  if (!data || data.length === 0 || !xAxis || !yAxis) {
    return <p className="text-yellow-300 mt-4">⚠️ Incomplete data or axes.</p>;
  }

  const x = data.map((row) => row[xAxis]);
  const y = data.map((row) => row[yAxis]);
  const z = zAxis ? data.map((row) => row[zAxis]) : [];

  if (!Array.isArray(x) || !Array.isArray(y) || x.length === 0 || y.length === 0) {
    return <p className="text-red-500"> Selected X or Y axis is invalid or empty.</p>;
  } //this is check frist data was availbale or not , x-y was selected or not 

  const reshapeZ = (flatZ) => {
    const size = Math.floor(Math.sqrt(flatZ.length)); //used for heatmap, contor and 3D surface
    const grid = [];
    for (let i = 0; i < flatZ.length; i += size) {
      grid.push(flatZ.slice(i, i + size));
    }
    return grid;
  };

  let trace; //this is define chart data and type
  let layout = {   //this is setup title, axies , plot etc.
    title: plotType,
    autosize: true,
    xaxis: { title: xAxis },
    yaxis: { title: yAxis },
  };

  switch (plotType) { //select plot type and it was matched 
    case "Scatter":
      trace = { x, y, type: "scatter", mode: "markers" };
      break;
    case "Line":
      trace = { x, y, type: "scatter", mode: "lines" };
      break;
    case "Bar":
      trace = { x, y, type: "bar" };
      break;
    case "Area":
      trace = { x, y, type: "scatter", fill: "tozeroy", mode: "none" };
      break;
    case "Pie":
      trace = { labels: x, values: y, type: "pie" };
      layout = { title: plotType };
      break;
    case "Box":
      trace = { y, type: "box" };
      break;
    case "Violin":
      trace = { y, type: "violin", box: { visible: true }, line: { color: "purple" } };
      break;
    case "Histogram":
      trace = { x, type: "histogram" };
      break;
    case "2D Histogram":
      trace = { x, y, type: "histogram2d" };
      break;
    case "2D Contour Histogram":
      trace = { x, y, type: "histogram2dcontour" };
      break;
    case "Contour":
      trace = { z: reshapeZ(z), x, y, type: "contour", colorscale: "Viridis" };
      break;
    case "Heatmap":
      if (z.length < 4) return <p className="text-red-500">❌ Not enough data for Heatmap</p>;
      trace = { z: reshapeZ(z), x, y, type: "heatmap", colorscale: "YlGnBu" };
      break;
    case "3D Scatter":
    case "3D Line":
      trace = {
        x, y, z,
        type: "scatter3d",
        mode: plotType === "3D Line" ? "lines" : "markers",
        marker: { size: 4, color: z },
      };
      layout = { scene: { xaxis: { title: xAxis }, yaxis: { title: yAxis }, zaxis: { title: zAxis } } };
      break;
    case "3D Surface":
      if (z.length < 4) return <p className="text-red-500">❌ Not enough Z data for 3D Surface</p>;
      trace = { z: reshapeZ(z), type: "surface", colorscale: "Viridis" };
      layout = { scene: { zaxis: { title: zAxis } } };
      break;
    case "3D Mesh":
      trace = { x, y, z, type: "mesh3d" };
      layout = { scene: { xaxis: { title: xAxis }, yaxis: { title: yAxis }, zaxis: { title: zAxis } } };
      break;
    case "Cone":
    case "Streamtube":
      trace = {
        type: plotType.toLowerCase(),
        x, y, z,
        u: x.map(() => 1),
        v: y.map(() => 1),
        w: z.map(() => 1),
      };
      layout = { scene: { xaxis: { title: xAxis }, yaxis: { title: yAxis }, zaxis: { title: zAxis } } };
      break;
    case "Candlestick":
    case "OHLC":
      trace = {
        x,
        open: data.map((r) => r.open || r.Open || 0),
        high: data.map((r) => r.high || r.High || 0),
        low: data.map((r) => r.low || r.Low || 0),
        close: data.map((r) => r.close || r.Close || 0),
        type: plotType.toLowerCase(),
      };
      break;
    case "Funnel":
      trace = { type: "funnel", x, y };
      break;
    case "Funnel Area":
      trace = { type: "funnelarea", labels: x, values: y };
      break;
    case "Polar Scatter":
      trace = { type: "scatterpolar", r: y, theta: x, mode: "markers" };
      layout = { polar: {}, title: plotType };
      break;
    case "Polar Bar":
      trace = { type: "barpolar", r: y, theta: x };
      layout = { polar: {}, title: plotType };
      break;
    case "Ternary Scatter":
      trace = {
        type: "scatterternary",
        a: x, b: y, c: z,
        mode: "markers",
        marker: { color: "red" },
      };
      layout = { ternary: {}, title: plotType };
      break;
    case "Sankey":
      const sources = data.map((d) => d.source);
      const targets = data.map((d) => d.target);
      const values = data.map((d) => d.value || 1);
      const allLabels = [...new Set([...sources, ...targets])];
      const idx = (label) => allLabels.indexOf(label);
      trace = {
        type: "sankey",
        orientation: "h",
        node: { label: allLabels },
        link: {
          source: sources.map(idx),
          target: targets.map(idx),
          value: values,
        },
      };
      break;
    case "Sunburst":
      trace = { type: "sunburst", labels: x, parents: y, values: z.length ? z : undefined };
      break;
    case "Treemap":
      trace = { type: "treemap", labels: x, parents: y, values: z.length ? z : undefined };
      break;
    case "Parallel Coordinates":
      trace = {
        type: "parcoords",
        dimensions: Object.keys(data[0]).map((key) => ({
          label: key,
          values: data.map((row) => parseFloat(row[key]) || 0),
        })),
      };
      break;
    case "Carpet":
      trace = { type: "carpet", a: x, b: y, y: z };
      break;
    case "Table":
      trace = {
        type: "table",
        header: {
          values: Object.keys(data[0]),
          fill: { color: "lightgray" },
        },
        cells: {
          values: Object.keys(data[0]).map((key) => data.map((row) => row[key]))
        },
      };
      layout = { title: "Table View" };
      break;
    default:
      return <p className="text-red-500 mt-4">❌ Unsupported plot type: {plotType}</p>;
  }

  return (
    <div className="mt-8 z-10 bg-white rounded p-4 shadow-lg w-full max-w-5xl text-black">
      <Plot  //this is used to render chart from react-pltly.js
        data={[trace]}
        layout={layout}
        config={{ responsive: true }}
        style={{ width: "100%" }}
      />
    </div>
  );
};

export default PlotlyChart;
