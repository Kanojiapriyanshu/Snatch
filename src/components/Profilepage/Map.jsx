import React, { useEffect, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";

countries.registerLocale(en); // Register English locale

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const SimpleWorldMap = ({ apiEndpoint }) => {
  const [highlightedCountries, setHighlightedCountries] = useState([]);
  const [topCountries, setTopCountries] = useState([]);
  useEffect(() => {
    const fetchCountryData = async () => {
      try {
        const response = await fetch(apiEndpoint);
        const data = await response.json();
        if (data.success) {
          // Convert country codes to full country names and store with percentage
          const formattedCountries = data.countryDistribution
            .map(entry => ({
              name: countries.getName(entry.country, "en") || entry.country, // Get full name
              percentage: entry.percentage,
            }))
            .filter(entry => entry.name); // Remove invalid entries

          // Sort by percentage and take the top 4
          const sortedTop = formattedCountries
            .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage))
            .slice(0, 4);
          setHighlightedCountries(sortedTop.map(c => c.name)); // Only names for map
          setTopCountries(sortedTop);
        }

      } catch (error) {
        console.error("Error fetching country data:", error);
      }
    };

    fetchCountryData();
  }, []);


  const blueShades = [
    "rgba(0, 55, 235, 1)", // 65%
    "rgba(0, 55, 235, 0.85)", // 55%
    "rgba(0, 55, 235, 0.65)", // 45%
    "rgba(0, 55, 235, 0.45)", // 35%
  ];


  const countryDataMap = Object.fromEntries(
    topCountries.map((c, index) => [
      c.name,
      { percentage: c.percentage, rank: index }
    ])
  );


  const getCountryFill = (countryName) => {
    const country = countryDataMap[countryName];

    if (!country) {
      return "#E3E3E3"; // default gray
    }

    return blueShades[
      country.rank % blueShades.length
    ];
  };




  return (
    <div className="flex flex-col items-center justify-between w-full h-full mt-6  border-red">
      <ComposableMap projection="geoMercator" projectionConfig={{ scale: 100 }} width={700} height={400} style={{ width: "100%", height: "auto" }}>
        {/* borderWidth: "2px", borderColor: "violet" */}
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const countryName = geo.properties.name;
              const isHighlighted = highlightedCountries.includes(countryName);

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={getCountryFill(countryName)}
                  stroke="#D6D6DA"
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none" },
                    pressed: { outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      <div className="w-full mx-auto max-w-[360px] mt-8 font-apfel-grotezk-regular   border-green">
        {topCountries.map((country, index) => (
          <div key={index} className="flex justify-between items-center text-xs min-[1300px]:text-base border-b border-gray-300 last:border-b-0 max-[1280px]:px-2 py-3 min-[1300px]:py-5 font-apfel-grotezk-regular ">
            <span className="flex gap-5 ">
              <span className="text-gray-500 flex items-center">0{index + 1}</span>
              <span className=" font-medium  font-apfel-grotezk-regular"
                style={{ color: '#444A6D' }}
              >{country.name}</span>
            </span>
            <span className="text-electric-blue">{country.percentage}%</span>
          </div>
        ))}
      </div>


    </div>
  );
};

export default SimpleWorldMap;
