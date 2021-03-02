const MARGINS = {
    top: 20,
    right: 10,
    left: 100,
    bottom: 130
}
const CHART_WIDTH = 600 - MARGINS.left - MARGINS.right;
const CHART_HEIGHT = 400 - MARGINS.top - MARGINS.bottom;

let flag = true;

// the number should be lower than the loop's delay(i.e interval delay)
let transition = d3.transition().duration(750);

const chartContainer = d3.select('#chart-area')
.append('svg')
.attr('height', CHART_HEIGHT + MARGINS.top + MARGINS.bottom)
.attr('width', CHART_WIDTH + MARGINS.left + MARGINS.right);

const g = chartContainer.append("g")
.attr("transform", `translate(${MARGINS.left}, ${MARGINS.top})`)

const xAxisGroup = g.append('g').attr('class','x axis')
.attr('transform', `translate(0, ${CHART_HEIGHT})`);

const yAxisGroup = g.append('g').attr('class','y axis');
// X label
g.append("text")
.attr("class", "x axis-label")
.attr("x", CHART_WIDTH / 2)
.attr("y", CHART_HEIGHT + 50)
.attr("font-size", "20px")
.attr("text-anchor", "middle")
.text("Month")

// Y label
let yLabel = g.append("text")
.attr("class", "y axis-label")
.attr("x", - (CHART_HEIGHT / 2))
.attr("y", -60)
.attr("font-size", "20px")
.attr("text-anchor", "middle")
.attr("transform", "rotate(-90)")
.text("Revenue ($)")
d3.csv('data/revenues.csv').then((data) => {
    
    data.forEach((d) => {
        d.revenue = Number(d.revenue);
        d.profit = +d.profit;
    });
  
    d3.interval(() => {
        let newData = flag ? data : data.slice(1);
        //updateChartWithRect(newData);
        updateChartWithScatterPlots(newData);
        flag = !flag;
    }, 1000);
    
    // updateChartWithRect(data);
    updateChartWithScatterPlots(data);
    
    
    
})

function updateChartWithRect(data) {
    let value = flag ? "revenue" : "profit";

    const xScale = d3.scaleBand().domain(data.map((dataPoint) => dataPoint.month)).rangeRound([0, CHART_WIDTH]).padding(0.1);

    const yScale = d3.scaleLinear().domain([0, d3.max(data, d => d[value] + 3000)]).range([CHART_HEIGHT, 0]);

    let xAxisCall = d3.axisBottom(xScale).tickSizeOuter(0);
    xAxisGroup.transition(transition).call(xAxisCall);

    let yAxisCall = d3.axisLeft(yScale).ticks(6).tickSizeOuter(0).tickFormat((d) => `${d}m`);
    yAxisGroup.transition(transition).call(yAxisCall);

    let rects = g.selectAll('rect')
        .data(data, (d) => {
            return d.month;
        });

    rects.exit()
        .attr('fill','red')
        .transition(transition)
        .attr('y', yScale(0))
        .attr('height',0)
        .remove();

    // rects.transition(transition).attr('y', data => yScale(data[value]))
    // .attr('x', data => xScale(data.month))
    // .attr('height', data => CHART_HEIGHT - yScale(data[value]))
    // .attr('width', xScale.bandwidth());

    //all the attr methods before the merge are applied to the enter selection, whereas all the attr methods after the merge methods are applied to both enter and update selection
    rects
        .enter()
        .append('rect')
        .attr('x', data => xScale(data.month))
        .attr('width', xScale.bandwidth())
        .attr('fill','steelblue')
        .attr('y', yScale(0))
        .attr('height', 0)
        .merge(rects)
    .transition(transition)
        .attr('y', data => yScale(data[value]))
        .attr('x', data => xScale(data.month))
        .attr('width', xScale.bandwidth())
        .attr('height', data => CHART_HEIGHT - yScale(data[value]))

    let label = flag ? "Revenue" : "Profit";
    yLabel.text(label);
}

function updateChartWithScatterPlots(data) {
    let value = flag ? "revenue" : "profit";

    const xScale = d3.scaleBand().domain(data.map((dataPoint) => dataPoint.month)).rangeRound([0, CHART_WIDTH]).padding(0.1);

    const yScale = d3.scaleLinear().domain([0, d3.max(data, d => d[value] + 3000)]).range([CHART_HEIGHT, 0]);

    let xAxisCall = d3.axisBottom(xScale).tickSizeOuter(0);
    xAxisGroup.transition(transition).call(xAxisCall);

    let yAxisCall = d3.axisLeft(yScale).ticks(6).tickSizeOuter(0).tickFormat((d) => `${d}m`);
    yAxisGroup.transition(transition).call(yAxisCall);

    let rects = g.selectAll('circle')
        .data(data, (d) => {
            return d.month;
        });

    rects.exit()
        .attr('fill','red')
        .transition(transition)
        .attr('cy', yScale(0))
        .remove();

    // rects.transition(transition).attr('cy', data => yScale(data[value]))
    // .attr('cx', data => xScale(data.month))
    // .attr('height', data => CHART_HEIGHT - yScale(data[value]))
    // .attr('width', xScale.bandwidth());

    //all the attr methods before the merge are applied to the enter selection, whereas all the attr methods after the merge methods are applied to both enter and update selection
    rects
        .enter()
        .append('circle')
        .attr('cx', data => xScale(data.month) + xScale.bandwidth()/2)
        .attr('fill','steelblue')
        .attr('cy', yScale(0))
        .attr('r', 5)
        .merge(rects)
    .transition(transition)
        .attr('cy', data => yScale(data[value]))
        .attr('cx', data => xScale(data.month) + xScale.bandwidth()/2)

    let label = flag ? "Revenue" : "Profit";
    yLabel.text(label);
}