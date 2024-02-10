import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

export default class BubbleChart extends Component {
	constructor(props) {
		super(props);

		this.renderChart = this.renderChart.bind(this);
		this.renderBubbles = this.renderBubbles.bind(this);
		this.renderLegend = this.renderLegend.bind(this);
	}

	componentDidMount() {
		this.svg = ReactDOM.findDOMNode(this);
		this.renderChart();
	}

	componentDidUpdate() {
		const { width, height } = this.props;
		if (width !== 0 && height !== 0) {
			this.renderChart();
		}
	}
	numberFormatter(value) {
		return (
			'+' +
			new Intl.NumberFormat('en-US', {
				notation: 'compact',
				compactDisplay: 'short',
				maximumFractionDigits: 1,
			}).format(value)
		);
	}
	render() {
		const { width, height } = this.props;
		return <svg width={width} height={height} />;
	}
	firstLabel(node, svg) {
		node
			.append('text')
			.attr('class', 'first-label')
			.attr('dy', '.2em')
			.text(function (d) {
				return d.data.label;
			})
			.attr('font-family', 'Roboto')
			.attr('font-size', function (d) {
				return d.r / 5;
			})
			.attr('fill', 'white')
			.style('text-anchor', 'middle');
		svg
			.selectAll('.node')
			.select('.first-label')
			.transition()
			.duration(2000)
			.attr('dy', '.2em')
			.style('text-anchor', 'middle')
			.text(function (d) {
				return d.data.symbol;
			})
			.attr('font-size', function (d) {
				return d.r / 5;
			})
			.attr('fill', 'white')
			.attr('font-family', 'Roboto');
	}
	renderChart() {
		const {
			overflow,
			graph,
			data,
			height,
			width,
			padding,
			showLegend,
			legendPercentage,
		} = this.props;
		// Reset the svg element to a empty state.
		this.svg.innerHTML = '';
		// Allow bubbles overflowing its SVG container in visual aspect if props(overflow) is true.
		if (overflow) this.svg.style.overflow = 'visible';

		const bubblesWidth = showLegend
			? width * (1 - legendPercentage / 100)
			: width;
		const legendWidth = width - bubblesWidth;
		const color = d3.scaleOrdinal(d3.schemeCategory20c);

		const pack = d3
			.pack()
			.size([bubblesWidth * graph.zoom, bubblesWidth * graph.zoom])
			.padding(padding);

		// Process the data to have a hierarchy structure;
		const root = d3
			.hierarchy({ children: data })
			.sum(function (d) {
				return d.value;
			})
			.sort(function (a, b) {
				return b.value - a.value;
			})
			.each((d) => {
				if (d.data.label) {
					d.label = d.data.label;
					d.id = d.data.label.toLowerCase().replace(/ |\//g, '-');
				}
			});

		// Pass the data to the pack layout to calculate the distribution.
		const nodes = pack(root).leaves();
		// Call to the function that draw the bubbles.
		this.renderBubbles(nodes, data, color);
		// Call to the function that draw the legend.
		if (showLegend) {
			this.renderLegend(legendWidth, height, bubblesWidth, nodes, color);
		}
	}

	renderBubbles(nodes, data) {
		const width = 1000;
		const height = 600;
		const svg = d3
			.select(this.svg)
      .attr("class", "bubble-chart")
			.attr('viewBox', [0, 0, width, height])
			.attr('font-size', 10)
			.attr('font-family', 'Roboto')
			.attr('text-anchor', 'middle');

		const node = svg
			.selectAll('.node')
			.data(nodes)
			.enter()
			.append('g')
			.attr('class', 'node')
			.attr('transform', function (d) {
				return 'translate(' + d.x + ',' + d.y + ')';
			});

		const circle = node
			.append('circle')
			.data(nodes)
			.attr('id', function (d) {
				return d.id;
			})
			.attr('r', function (d) {
				return d.r;
			})
			.style('filter', 'url(#drop-shadow)')
			.attr('fill', '#12141C')
			.on('mouseover', function (d) {
				d3.select(this).attr('r', d.r * 1.04);
			})
			.on('mouseout', function (d) {
				const r = d.r - d.r * 0.04;
				d3.select(this).attr('r', r);
			});

		const shadowDef = circle.append('defs');
		const filter = shadowDef
			.append('filter')
			.attr('id', 'drop-shadow')
			.attr('height', '150%')
			.append('feGaussianBlur')
			.attr('in', 'SourceAlpha')
			.attr('stdDeviation', 3)
			.attr('result', 'blur')
			.append('feOffset')
			.attr('in', 'blur')
			.attr('dx', 0)
			.attr('dy', 10)
			.attr('result', 'offsetBlur')
			.append('feFlood')
			.attr('flood-color', 'rgba(18, 20, 28, 1)')
			.attr('result', 'color')
			.append('feComposite')
			.attr('in', 'color')
			.attr('in2', 'offsetBlur')
			.attr('operator', 'in')
			.attr('result', 'shadow');
		const feMerge = filter.append('feMerge');
		feMerge.append('feMergeNode').attr('in', 'shadow');
		feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

		node
			.append('text')
			.attr('class', 'labels')
			.attr('dy', '.2em')
			.text(function (d) {
				return `$${d.data.label}`;
			})
			.attr('font-family', 'Roboto')
			.attr('font-size', function (d) {
				return d.r / 5;
			})
			.attr('fill', 'white')
			.style('text-anchor', 'middle');

		node
			.append('text')
			.attr('class', 'SecondLabels')
			.attr('dy', '1.8em')
			.text((d) => {
				return this.numberFormatter(d.value);
			})
			.attr('font-family', 'Roboto')
			.attr('font-size', function (d) {
				return d.r / 7;
			})
			.attr('fill', 'white')
			.style('text-anchor', 'middle');
	}

	renderLegend(width, height, offset, nodes, color) {
		const { data, legendClickFun, legendFont } = this.props;
		const bubble = d3.select('.bubble-chart');
		const bubbleHeight = bubble.node().getBBox().height;

		const legend = d3
			.select(this.svg)
			.append('g')
			.attr('transform', function () {
				return `translate(${offset},${bubbleHeight * 0.05})`;
			})
			.attr('class', 'legend');

		let textOffset = 0;
		const texts = legend
			.selectAll('.legend-text')
			.data(nodes)
			.enter()
			.append('g')
			.attr('transform', (d, i) => {
				const offset = textOffset;
				textOffset += legendFont.size + 10;
				return `translate(0,${offset})`;
			})
			.on('mouseover', function (d) {
				d3.select('#' + d.id).attr('r', d.r * 1.04);
			})
			.on('mouseout', function (d) {
				const r = d.r - d.r * 0.04;
				d3.select('#' + d.id).attr('r', r);
			})
			.on('click', function (d) {
				legendClickFun(d.label);
			});

		texts
			.append('rect')
			.attr('width', 30)
			.attr('height', legendFont.size)
			.attr('x', 0)
			.attr('y', -legendFont.size)
			.style('fill', 'transparent');

		texts
			.append('rect')
			.attr('width', legendFont.size)
			.attr('height', legendFont.size)
			.attr('x', 0)
			.attr('y', -legendFont.size)
			.style('fill', function (d) {
				return d.data.color ? d.data.color : color(nodes.indexOf(d));
			});

		texts
			.append('text')
			.style('font-size', `${legendFont.size}px`)
			.style('font-weight', (d) => {
				return legendFont.weight ? legendFont.weight : 600;
			})
			.style('font-family', legendFont.family)
			.style('fill', () => {
				return legendFont.color ? legendFont.color : '#000';
			})
			.style('stroke', () => {
				return legendFont.lineColor ? legendFont.lineColor : '#000';
			})
			.style('stroke-width', () => {
				return legendFont.lineWeight ? legendFont.lineWeight : 0;
			})
			.attr('x', (d) => {
				return legendFont.size + 10;
			})
			.attr('y', 0)
			.text((d) => {
				return d.label;
			});
	}
}

BubbleChart.propTypes = {
	overflow: PropTypes.bool,
	graph: PropTypes.shape({
		zoom: PropTypes.number,
		offsetX: PropTypes.number,
		offsetY: PropTypes.number,
	}),
	width: PropTypes.number,
	height: PropTypes.number,
	padding: PropTypes.number,
	showLegend: PropTypes.bool,
	legendPercentage: PropTypes.number,
	legendFont: PropTypes.shape({
		family: PropTypes.string,
		size: PropTypes.number,
		color: PropTypes.string,
		weight: PropTypes.string,
	}),
	valueFont: PropTypes.shape({
		family: PropTypes.string,
		size: PropTypes.number,
		color: PropTypes.string,
		weight: PropTypes.string,
	}),
	labelFont: PropTypes.shape({
		family: PropTypes.string,
		size: PropTypes.number,
		color: PropTypes.string,
		weight: PropTypes.string,
	}),
};
BubbleChart.defaultProps = {
	overflow: false,
	graph: {
		zoom: 1.1,
		offsetX: -0.05,
		offsetY: -0.01,
	},
	width: 1000,
	height: 800,
	padding: 0,
	showLegend: true,
	legendPercentage: 20,
	legendFont: {
		family: 'Arial',
		size: 12,
		color: '#000',
		weight: 'bold',
	},
	valueFont: {
		family: 'Arial',
		size: 16,
		color: '#fff',
		weight: 'bold',
	},
	labelFont: {
		family: 'Arial',
		size: 11,
		color: '#fff',
		weight: 'normal',
	},
	bubbleClickFun: (label) => {
		console.log(`Bubble ${label} is clicked ...`);
	},
	legendClickFun: (label) => {
		console.log(`Legend ${label} is clicked ...`);
	},
};
