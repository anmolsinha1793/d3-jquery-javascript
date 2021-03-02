const MARGINS = {
    top: 20,
    right: 10,
    left: 100,
    bottom: 130
}
const CHART_WIDTH = 600 - MARGINS.left - MARGINS.right;
const CHART_HEIGHT = 400 - MARGINS.top - MARGINS.bottom;

let flag = true;
let interval;
let formattedData;
// the number should be lower than the loop's delay(i.e interval delay)
let transition = d3.transition().duration(750);

const chartContainer = d3.select('#chart-area')
.append('svg')
.attr('height', CHART_HEIGHT + MARGINS.top + MARGINS.bottom)
.attr('width', CHART_WIDTH + MARGINS.left + MARGINS.right);

const g = chartContainer.append("g")
.attr("transform", `translate(${MARGINS.left}, ${MARGINS.top})`)

let time = 0

let tip = d3.tip().attr('class', 'd3-tip')
	.html((d) => {
		let text = `<strong>Country:</strong> <span style='color:red'>${d.country}</span><br>`;
		text += `<strong>Continent:</strong> <span style='color:yellow; text-transform:capitalize'>${d.continent}</span><br>`;
		text += `<strong>Life Expectancy:</strong> <span style='color:lightgreen'>${d3.format('.2f')(d.life_exp)}</span><br>`
		text += `<strong>GDP Per Capita:</strong> <span style='color:orange'>${d3.format('$,.0f')(d.income)}</span><br>`
		text += `<strong>Population:</strong> <span style='color:violet'>${d3.format(',.0f')(d.population)}</span><br>`
		return text;
	});

g.call(tip);
// Scales
const xScale = d3.scaleLog()
	.base(10)
	.range([0, CHART_WIDTH])
	.domain([142, 150000])
const yScale = d3.scaleLinear()
	.range([CHART_HEIGHT, 0])
	.domain([0, 90])
const area = d3.scaleLinear()
	.range([25*Math.PI, 1500*Math.PI])
	.domain([2000, 1400000000])
const continentColor = d3.scaleOrdinal(d3.schemePastel1)

// Labels
const xLabel = g.append("text")
	.attr("y", CHART_HEIGHT + 50)
	.attr("x", CHART_WIDTH / 2)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.text("GDP Per Capita ($)")
const yLabel = g.append("text")
	.attr("transform", "rotate(-90)")
	.attr("y", -40)
	.attr("x", -170)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.text("Life Expectancy (Years)")
const timeLabel = g.append("text")
	.attr("y", CHART_HEIGHT - 10)
	.attr("x", CHART_WIDTH - 40)
	.attr("font-size", "40px")
	.attr("opacity", "0.4")
	.attr("text-anchor", "middle")
	.text("1800")

    // X Axis
const xAxisCall = d3.axisBottom(xScale)
.tickValues([400, 4000, 40000])
.tickFormat(d3.format("$"));
g.append("g")
.attr("class", "x axis")
.attr("transform", `translate(0, ${CHART_HEIGHT})`)
.call(xAxisCall);

// Y Axis
const yAxisCall = d3.axisLeft(yScale)
g.append("g")
.attr("class", "y axis")
.call(yAxisCall);

let continents = ['europe','asia','americas','africa'];

let legend = g.append('g')
	.attr('transform', `translate(${CHART_WIDTH -10}, ${CHART_HEIGHT - 125})`);

continents.forEach((continent, i) => {
	let legendRow = legend.append('g')
				.attr('transform', `translate(0, ${i*20})`);
	legendRow.append('rect')
		.attr('width',10)
		.attr('height', 10)
		.attr('fill', continentColor(continent));
	
		legendRow.append('text')
			.attr('x', -10)
			.attr('y', 10)
			.attr('text-anchor','end')
			.style('text-transform','capitalize')
			.text(continent);
})
d3.json('data/data.json').then((data) => {
    formattedData = data.map(year => {
		return year["countries"].filter(country => {
			const dataExists = (country.income && country.life_exp)
			return dataExists
		}).map(country => {
			country.income = Number(country.income)
			country.life_exp = Number(country.life_exp)
			return country
		})
	})

	// first run of the visualization
	updateChartWithScatterPlots(formattedData[0])
})

$('#play-button').on('click',() => {
	let button = $('#play-button');
	console.log($('#play-button').text())
	if(button.text() == 'Play'){
		button.text('Pause');
	interval = setInterval(step, 100);
	} else {
		button.text('Play');
	clearInterval(interval);
	}
	
});
$('#continent-select').on('change', () => {
	updateChartWithScatterPlots(formattedData[time])
})
$('#reset-button').on('click',() => {
	time = 0;
	updateChartWithScatterPlots(formattedData[0]);
	
});
function step() {
	time = (time < 214) ? time + 1 : 0
	updateChartWithScatterPlots(formattedData[time]);
}

function updateChartWithScatterPlots(data) {
   // standard transition time for the visualization
	const t = d3.transition()
    .duration(100)

	let continent = $('#continent-select').val();

	data = data.filter((d) => {
		if(continent === 'all') {
			return true;
		} else {
			return d.continent === continent;
		}
	})
// JOIN new data with old elements.
const circles = g.selectAll("circle")
    .data(data, d => d.country)

// EXIT old elements not present in new data.
circles.exit().remove()

// ENTER new elements present in new data.
circles.enter().append("circle")
    .attr("fill", d => continentColor(d.continent))
	.on('mouseover', tip.show)
	.on('mouseout', tip.hide)
    .merge(circles)
    .transition(t)
        .attr("cy", d => yScale(d.life_exp))
        .attr("cx", d => xScale(d.income))
        .attr("r", d => Math.sqrt(area(d.population) / Math.PI))

// update the time label
timeLabel.text(String(time + 1800))
}