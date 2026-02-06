import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = ({ apiEndpoint }) => {
  const [chartData, setChartData] = useState(null);
  const [totalFollowers, setTotalFollowers] = useState(0);
  const [displayText, setDisplayText] = useState("");

  const [defaultCenter, setDefaultCenter] = useState({
    value: 0,
    label: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(apiEndpoint);
        const data = await response.json();

        if (!data.demographics) throw new Error("Invalid API Response");

        const { male, female, unknown } = data.demographics;
        const high = Math.max(male, female, unknown);

        if (high === Number(male)) {
          setDefaultCenter({
            value: male,
            label: "Men",
          });
          setTotalFollowers(male);
          setDisplayText("Men");
        } else if (high === Number(female)) {
          setDefaultCenter({
            value: female,
            label: "Women",
          });
          setTotalFollowers(female);
          setDisplayText("Women");
        }
        else {
          setDefaultCenter({
            value: unknown,
            label: "Unspecified",
          });
          setTotalFollowers(unknown);
          setDisplayText("Unspecified");
        }




        setChartData({
          labels: ["Male", "Female", "Unspecified"],
          datasets: [
            {
              data: [parseFloat(male), parseFloat(female), parseFloat(unknown)],
              backgroundColor: ["#0037EB", "rgba(0, 55, 235, 0.3)", "rgba(0,55,235,0.15)"],
              borderColor: ["#0037EB", "rgba(0, 55, 235, 0.3)", "rgba(0,55,235,0.15)"],
              borderWidth: 0,
              circumference: 360,
              rotation: -90,
              borderRadius: 50,
              spacing: 6,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching demographics:", error.message);
      }
    };

    fetchData();
  }, []);

  // Plugin to add center text
  const centerTextPlugin = {
    id: "centerText",
    beforeDraw: (chart) => {
      const { width, height, ctx } = chart;
      ctx.save(); // 🔑 VERY IMPORTANT

      ctx.font = "bold 28px sans-serif"
      ctx.fillStyle = "#0037EB";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(totalFollowers.toLocaleString(), width / 2, height / 2 - 10);

      ctx.font = "15px sans-serif"
      ctx.fillStyle = "#666";
      ctx.fillText(displayText, width / 2, height / 2 + 20);
      ctx.restore();
    },
  };



  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    cutout: "78%",
    onHover: (event, elements, chart) => {
      if (elements.length > 0) {
        const index = elements[0].index;

        const value = chart.data.datasets[0].data[index];
        const label = chart.data.labels[index];

        setTotalFollowers(value);
        setDisplayText(label);
        chart.draw(); // 🔑 FORCE redraw
      } else {
        // mouse leave → restore default center text
        setTotalFollowers(defaultCenter.value);
        setDisplayText(defaultCenter.label);
        chart.draw(); // 🔑 FORCE redraw
      }
    },

  };

  return (
    <>
      {chartData ? (
        <div className="flex flex-col items-center justify-between w-full h-full   border-red">
          {/* Doughnut Chart */}
          <div className="relative w-[200px] h-[200px] font-apfel-grotezk-regular">
            <Doughnut data={chartData} options={options} plugins={[centerTextPlugin]} />
          </div>

          {/* Gender Legend */}
          {/* Labels */}
          <div className="w-full mx-auto max-w-[360px] flex flex-col justify-between text-xs min-[1300px]:text-base font-apfel-grotezk-regular   border-green-600">
            {/* <div className="flex justify-between gap-14 w-full  border-green"> */}
            <div className="flex flex-row justify-between items-center border-b border-gray-300 last:border-b-0 max-[1280px]:px-2 py-3 min-[1300px]:py-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#0037EB] rounded-full"></span>
                <span className="text-[#444A6D]">Men</span>
              </div>
              <span className="text-[#0037EB] items-center border-green">
                {chartData.datasets[0].data[0].toFixed(1)}%
              </span>
            </div>

            <div className="flex flex-row  justify-between  items-center border-b border-gray-300 last:border-b-0 max-[1280px]:px-2 py-3 min-[1300px]:py-6">
              <div className="flex items-center gap-2  border-red">
                <span className="w-2 h-2 bg-[rgba(0,55,235,0.3)] rounded-full"></span>
                <span className="text-[#444A6D]">Women</span>
              </div>
              <div className="text-[#0037EB] items-center ">
                {chartData.datasets[0].data[1].toFixed(1)}%
              </div>
            </div>
            {/* </div> */}

            <div className="flex flex-row  justify-between  items-center border-b border-gray-300 last:border-b-0 max-[1280px]:px-2 py-3 min-[1300px]:py-6">
              <div className="flex items-center gap-2  border-red">
                <span className="w-2 h-2 bg-[rgba(0,55,235,0.15)] rounded-full"></span>
                <span className="text-[#444A6D]">Unspecified</span>
              </div>
              <div className="text-[#0037EB] items-center border-green">
                {chartData.datasets[0].data[2].toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

      ) : (
        <p className="text-gray-600 text-sm text-center">Loading...</p>
      )}
    </>
  );
};

export default DoughnutChart;