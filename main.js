// 1: SET GLOBAL VARIABLES
const margin = { top: 50, right: 30, bottom: 60, left: 70 };
const width = 900 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create SVG containers for both charts
const svg1_RENAME = d3.select("#lineChart1") // If you change this ID, you must change it in index.html too
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// (If applicable) Tooltip element for interactivity
// const tooltip = ...

// 2.a: LOAD...
d3.csv("/weather.csv").then(data => {
    const parseDate = d3.timeParse("%m/%d/%Y");

    data.forEach(d => {
        d.date = parseDate(d.date.trim());
        d.year = d.date.getFullYear();
        d.month = d.date.getMonth() + 1;
        d.avgPrecip = +d.average_precipitation;
    });

    console.log(data);

    const globalMinY = 0;  // Start from 0
    const globalMaxY = d3.max(data, d => d.avgPrecip);

    const uniqueCities = [...new Set(data.map(d => d.city))];

    const dropdown = d3.select("#cityDropdown");
    dropdown.selectAll("option")
        .data(uniqueCities)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);

    let selectedCity = uniqueCities[0];

    function updateChart(city) {
        // Filter Data for Selected City
        const filteredData = data.filter(d => d.city === city && !isNaN(d.avgPrecip));

        // 3.a: GROUP AND AGGREGATE DATA
        // "For each [MONTH], I want the {average of} [AVERAGE PRECIPITATION]."
        const groupedData = d3.groups(filteredData, d => `${d.year}-${d.month}`)
            .map(([yearMonth, entries]) => {
                const [year, month] = yearMonth.split('-').map(Number);
                return {
                    year,
                    month,
                    avgPrecip: d3.mean(entries, e => e.avgPrecip)
                };
            });

        // Handle empty data
        if (groupedData.length === 0) {
            console.warn(`No data available for city: ${city}`);
            svg1_RENAME.selectAll("*").remove();
            return;
        }

        console.log("Grouped Data:", groupedData);

        // 3.b: SET SCALES FOR CHART 1
        const xScale = d3.scaleTime()
            .domain(d3.extent(groupedData, d => new Date(d.year, d.month - 1)))
            .range([0, width]);

            const yScale = d3.scaleLinear()
            .domain([globalMinY, globalMaxY])
            .range([height, 0]);

        // 4.a: PLOT DATA FOR CHART 1
        const line = d3.line()
            .x(d => xScale(new Date(d.year, d.month - 1)))
            .y(d => yScale(d.avgPrecip))
            .curve(d3.curveMonotoneX);

        // 5.a: CLEAR PREVIOUS ELEMENTS
        svg1_RENAME.selectAll("*").remove();

        // 6.a: ADD AXES FOR CHART 1
        svg1_RENAME.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b %Y")));

        svg1_RENAME.append("g").call(d3.axisLeft(yScale));

        // 7.a: ADD LABELS FOR CHART 1
        svg1_RENAME.append("text")
            .attr("x", width / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .text(`Average Precipitation Per Month (${city})`);

        svg1_RENAME.append("text")
            .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
            .style("text-anchor", "middle")
            .text("Date");

        svg1_RENAME.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 15)
            .attr("x", -height / 2)
            .style("text-anchor", "middle")
            .text("Avg Precipitation (inches)");


        // 9.a: ADD LINE PATH
        svg1_RENAME.append("path")
            .datum(groupedData)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("d", line);
    }

    // 10.a: INITIAL CHART RENDERING
    updateChart(selectedCity);

    // 11.a: UPDATE CHART WHEN CITY IS SELECTED
    dropdown.on("change", function () {
        selectedCity = this.value;
        updateChart(selectedCity);
    });
});