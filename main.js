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

const svg2_RENAME = d3.select("#lineChart2")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// (If applicable) Tooltip element for interactivity
// const tooltip = ...

// 2.a: LOAD...
d3.csv("/weather.csv").then(data => {
    // 2.b: ... AND TRANSFORM DATA
    // - X: Date
    // - Y: Average Precipitation
    // - Category: City
    data.forEach(d => {
        d.year = new Date(d.date).getFullYear();
        d.avgPrecip = +d.average_precipitation;
    });


    console.log(transformedData);

    const uniqueCities = [...new Set(data.map(d => d.city))];
    const dropdown = d3.select("#cityDropdown"); // Ensure you have a <select id="cityDropdown"> in index.html
    dropdown.selectAll("option")
        .data(uniqueCities)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);

    let selectedCity = uniqueCities[0];

    function updateChart(city) {
        // Filter Data for Selected City
        const filteredData = data.filter(d => d.city === city);
    // 3.a: SET SCALES FOR CHART 1
        const xScale = d3.scaleTime()
        .domain(d3.extent(filteredData, d => d.date))
        .range([0, width]);

        const yScale = d3.scaleLinear()
        .domain([0, d3.max(filteredData, d => d.avgPrecip)])
        .range([height, 0]);


    // 4.a: PLOT DATA FOR CHART 1
        const line = d3.line()
                .x(d => xScale(d.date))
                .y(d => yScale(d.avgPrecip))
                .curve(d3.curveMonotoneX);

        svg1.selectAll("*").remove();


    // 5.a: ADD AXES FOR CHART 1
        svg1.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b %Y")));

        svg1.append("g").call(d3.axisLeft(yScale));


    // 6.a: ADD LABELS FOR CHART 1
        svg1.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text(`Average Precipitation Over Time (${city})`);

    svg1.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
        .style("text-anchor", "middle")
        .text("Date");

    svg1.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 15)
        .attr("x", -height / 2)
        .style("text-anchor", "middle")
        .text("Avg Precipitation (inches)");

    // 7.a: ADD INTERACTIVITY FOR CHART 1 (Hover Tooltip)
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background", "#f9f9f9")
        .style("border", "1px solid #ccc")
        .style("padding", "5px")
        .style("border-radius", "5px");

    svg1.selectAll("circle")
        .data(filteredData)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.date))
        .attr("cy", d => yScale(d.avgPrecip))
        .attr("r", 4)
        .style("fill", "steelblue")
        .on("mouseover", (event, d) => {
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`Date: ${d3.timeFormat("%b %d, %Y")(d.date)}<br>Avg Precip: ${d.avgPrecip.toFixed(2)} inches`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 30) + "px");
        })
        .on("mouseout", () => {
            tooltip.transition().duration(500).style("opacity", 0);
        });

    // Add Line Path
    svg1.append("path")
        .datum(filteredData)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line);
}

    // Initial Chart Rendering (Default City)
    updateChart(selectedCity);

    // Update Chart When City is Selected
    dropdown.on("change", function () {
        selectedCity = this.value;
        updateChart(selectedCity);
    });


});