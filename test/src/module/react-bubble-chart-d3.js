import React, { Component } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import * as d3 from "d3";

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

  render() {
    const { width, height } = this.props;
    return <svg width={width} height={height} />;
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
    this.svg.innerHTML = "";
    // Allow bubbles overflowing its SVG container in visual aspect if props(overflow) is true.
    if (overflow) this.svg.style.overflow = "visible";

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
          d.id = d.data.label.toLowerCase().replace(/ |\//g, "-");
        }
      });

    // Pass the data to the pack layout to calculate the distribution.
    const nodes = pack(root).leaves();
    // Call to the function that draw the bubbles.
    this.renderBubbles(bubblesWidth, nodes, color);
    // Call to the function that draw the legend.
    if (showLegend) {
      this.renderLegend(legendWidth, height, bubblesWidth, nodes, color);
    }
  }

  renderBubbles(width, nodes, color) {
    const { graph, data, bubbleClickFun, valueFont, labelFont } = this.props;

    const formatNumber = (value) => {
      if (value >= 1000000) {
        return (
          (value / 1000000).toFixed(1) +
          "M" +
          (value % 1000000 !== 0 ? "+" : "")
        );
      } else if (value >= 1000) {
        return (
          (value / 1000).toFixed(1) + "K" + (value % 1000 !== 0 ? "+" : "")
        );
      } else {
        return value.toString();
      }
    };

    const bubbleChart = d3
      .select(this.svg)
      .append("g")
      .attr("class", "bubble-chart")
      .attr("transform", function (d) {
        return (
          "translate(" +
          width * graph.offsetX +
          "," +
          width * graph.offsetY +
          ")"
        );
      });

    let bubbleOffsetX, bubbleOffsetY;

    // console.log("noeds");
    // console.log(nodes);
    // console.log("");

    const node = bubbleChart
      .selectAll(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", function (d) {
        bubbleOffsetX = d.x;
        bubbleOffsetY = d.x;
        return "translate(" + d.x + "," + d.y + ")";
      })
      .on("click", function (d) {
        bubbleClickFun(d.label);
      });
      
    let circle = node
      .append("circle")
      .attr("id", function (d) {
        return d.id;
      })
      .attr("r", function (d) {
        return d.r - d.r * 0.04;
      })
      .style("fill", function (d) {
        return "#12141C";
      })
      .style("z-index", 1)
      .style("filter", "url(#drop-shadow)")
      .on("mouseover", function (d) {
        d3.select(this).attr("r", d.r * 1.04);
      })
      .on("mouseout", function (d) {
        const r = d.r - d.r * 0.04;
        d3.select(this).attr("r", r);
      });
    // Define the filter
    const defs2 = circle.append("defs");

    // nodes.forEach((node) => {
    //   console.log("nodee");
    //   console.log(node);
    //   console.log("");

    //   // Create the clipPath element with an ID
    //   let clipPath = defs.append("clipPath").attr("id", `clip-${node.id}`);

    //   // Append a circle to the clipPath and set its attributes
    //   clipPath
    //     .append("circle")
    //     .attr("cx", node.x) // Assuming node.x is the center x of your node
    //     .attr("cy", node.y) // Assuming node.y is the center y of your node
    //     .attr("r", 41); // The radius of the clipping circle
    // });

    // .attr("id", "drop-shadow")
    // .attr("height", "150%");

    const filter = defs2
      .append("filter")
      .attr("id", "drop-shadow")
      .attr("height", "150%");

    filter
      .append("feGaussianBlur")
      .attr("in", "SourceAlpha")
      .attr("stdDeviation", 5)
      .attr("result", "blur");

    filter
      .append("feOffset")
      .attr("in", "blur")
      .attr("dx", 0)
      .attr("dy", 10)
      .attr("result", "offsetBlur");

    // Add color to the shadow
    filter
      .append("feFlood")
      .attr("flood-color", "rgba(18, 20, 28, 1)")
      .attr("result", "color");

    // Composite the colored shadow and the offset blur
    filter
      .append("feComposite")
      .attr("in", "color")
      .attr("in2", "offsetBlur")
      .attr("operator", "in")
      .attr("result", "shadow");

    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "shadow");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");
    //// image work


    node
    .append("text")
    .attr("class", "heading-text")
    .style("font-size", d=>{
      const r = d.r * 0.;
      // console.log("r",r,valueFont.size);
      return`${valueFont.size * d.r / 10 }px`
    })
    .style("font-weight", (d) => {
      return valueFont.weight ? valueFont.weight : 600;
    })
    .style("font-family", valueFont.family)
    .style("fill", () => {
      return valueFont.color ? valueFont.color : "#000";
    })
    .style("stroke", () => {
      return valueFont.lineColor ? valueFont.lineColor : "#000";
    })
    .style("stroke-width", () => {
      return valueFont.lineWeight ? valueFont.lineWeight : 0;
    })
    .text(function (d) {
      return d.label
    });
    // node
    //   .append("image")
    //   .attr("xlink:href", function (d) {
    //     return d.data.src;
    //   })
    //   .attr("clip-path", function (d) {
    //     return "url(#clip-" + d.id + ")";
    //   })

    //   .attr("x", function (d) {
    //     // clipCx = -d.r * 0.2;
    //     return -d.r * 0.2;
    //   })
    //   .attr("r", function (d) {
    //     // clipR = d.r - d.r * 0.04;
    //     return d.r - d.r * 0.04;
    //   })
    //   .attr("y", function (d) {
    //     // clipCy = -d.r * 0.2;
    //     return -d.r * 0.2;
    //   })
    //   .attr("width", function (d) {
    //     return d.r * 0.2;
    //   })
    //   .attr("height", function (d) {
    //     return d.r * 0.2;
    //   });

    const defs3 = node.append("defs");

    let clipPath = defs3.append("clipPath").attr("id", (d) => {
      console.log("d");
      console.log(d);
      console.log("");

      return `clip-${d.id}`;
    });

    // Append a circle to the clipPath and set its attributes
    clipPath
      .append("circle")
      .attr("cx", (d) => {
        console.log("d");
        console.log(d);
        console.log("");
        return 0;
        return d.x;
      })
      .attr("cy", (d) => {
        console.log("d");
        console.log(d);
        console.log("");
        return 0;
        return d.y;
      })
      .attr("r", (d) => {
        console.log("d");
        console.log(d);
        console.log("");

        return 44;
      });

    // For each node, add a clipPath

    // console.log("node");
    // console.log(node);
    // console.log("");

    // to do
    // 	node
    // 	.append('svg:pattern')
    // 	.attr('id', 'grump_avatar')
    // 	.attr('xlink:href', function (d) {
    // 		return d.data.src;
    // 	})
    // 	.attr('x', function (d) {
    // 		return -d.r * 0.2;
    // 	})
    // 	.attr('r', function (d) {
    // 		return d.r - d.r * 0.04;
    // 	})
    // 	.attr('y', function (d) {
    // 		return -d.r * 0.2;
    // 	})
    // 	.attr('width', function (d) {
    // 		return d.r * 0.2;
    // 	})
    // 	.attr('height', function (d) {
    // 		return d.r * 0.2;
    // 	});

    // node
    // 	.append('circle')
    // 	.attr('cx', function (d) {
    // 		return -d.r * 0.2;
    // 	})
    // 	.attr('cy', function (d) {
    // 		return -d.r * 0.2;
    // 	})
    // 	.attr('r', function (d) {
    // 		return -d.r * 0.2;
    // 	})
    // 	.style('fill', '#fff')
    // 	.style('fill', 'url(#grump_avatar)');
    // node
    // 	.append('clipPath')
    // 	.attr('id', function (d) {
    // 		return 'clip-' + d.id;
    // 	})
    // 	.append('use')
    // 	.attr('xlink:href', function (d) {
    // 		return '#' + d.id;
    // 	});

    node
      .append("text")
      .attr("class", "value-text")
      .style("font-size", `${valueFont.size * 0.5}px`)
      .style("font-weight", (d) => {
        return valueFont.weight ? valueFont.weight : 600;
      })
      .style("font-family", valueFont.family)
      .style("fill", () => {
        return valueFont.color ? valueFont.color : "#000";
      })
      .style("stroke", () => {
        return valueFont.lineColor ? valueFont.lineColor : "#000";
      })
      .style("stroke-width", () => {
        return valueFont.lineWeight ? valueFont.lineWeight : 0;
      })
      .text(function (d) {
        return formatNumber(d.value);
      });

    node
      .append("text")
      .attr("class", "label-text")
      .style("font-size", `${labelFont.size * 0.1}px`)
      .style("font-weight", (d) => {
        return labelFont.weight ? labelFont.weight : 600;
      })
      .style("font-family", labelFont.family)
      .style("fill", () => {
        return labelFont.color ? labelFont.color : "#000";
      })
      .style("stroke", () => {
        return labelFont.lineColor ? labelFont.lineColor : "#000";
      })
      .style("stroke-width", () => {
        return labelFont.lineWeight ? labelFont.lineWeight : 0;
      })
      .text(function (d) {
        return d.label;
      });

    // // Center the texts inside the circles.
    d3.selectAll(".heading-text")
    .attr("dy", "-0.2em")
      .attr("x", function (d) {
        const self = d3.select(this);
        const width = self.node().getBBox().width;
        return -(width / 2);
      })
      .style("opacity", function (d) {
        const self = d3.select(this);
        const width = self.node().getBBox().width;
        d.hideLabel = width * 1.05 > d.r * 2;
        return d.hideLabel ? 0 : 1;
      })
      .attr("y", function (d) {
        return labelFont.size;
      });
      d3.selectAll(".label-text")
      .attr("x", function (d) {
        const self = d3.select(this);
        const width = self.node().getBBox().width;
        return -(width / 2);
      })
      .style("opacity", function (d) {
        const self = d3.select(this);
        const width = self.node().getBBox().width;
        d.hideLabel = width * 1.05 > d.r * 2;
        return d.hideLabel ? 0 : 1;
      })
      .attr("y", function (d) {
        return labelFont.size;
      });

    //   font size
    d3.selectAll(".value-text").style("font-size", function (d) {
      const self = d3.select(this);
      const width = self.node().getBBox().width;
      console.log(width, "hello");
      return valueFont.size * (width * 0.1);
    });

    // // Center the texts inside the circles.
    d3.selectAll(".value-text")
      .attr("dy", "0.2em")
      .attr("x", function (d) {
        const self = d3.select(this);
        const width = self.node().getBBox().width;
        return -(width / 2);
      })
      .attr("y", function (d) {
        return valueFont.size * 2;
      });

    node.append("title").text(function (d) {
      return d.label;
    });
  }

  renderLegend(width, height, offset, nodes, color) {
    const { data, legendClickFun, legendFont } = this.props;
    const bubble = d3.select(".bubble-chart");
    const bubbleHeight = bubble.node().getBBox().height;

    const legend = d3
      .select(this.svg)
      .append("g")
      .attr("transform", function () {
        return `translate(${offset},${bubbleHeight * 0.05})`;
      })
      .attr("class", "legend");

    let textOffset = 0;
    const texts = legend
      .selectAll(".legend-text")
      .data(nodes)
      .enter()
      .append("g")
      .attr("transform", (d, i) => {
        const offset = textOffset;
        textOffset += legendFont.size + 10;
        return `translate(0,${offset})`;
      })
      .on("mouseover", function (d) {
        d3.select("#" + d.id).attr("r", d.r * 1.04);
      })
      .on("mouseout", function (d) {
        const r = d.r - d.r * 0.04;
        d3.select("#" + d.id).attr("r", r);
      })
      .on("click", function (d) {
        legendClickFun(d.label);
      });

    texts
      .append("rect")
      .attr("width", 30)
      .attr("height", legendFont.size)
      .attr("x", 0)
      .attr("y", -legendFont.size)
      .style("fill", "transparent");

    texts
      .append("rect")
      .attr("width", legendFont.size)
      .attr("height", legendFont.size)
      .attr("x", 0)
      .attr("y", -legendFont.size)
      .style("fill", function (d) {
        return d.data.color ? d.data.color : color(nodes.indexOf(d));
      });

    texts
      .append("text")
      .style("font-size", `${legendFont.size}px`)
      .style("font-weight", (d) => {
        return legendFont.weight ? legendFont.weight : 600;
      })
      .style("font-family", legendFont.family)
      .style("fill", () => {
        return legendFont.color ? legendFont.color : "#000";
      })
      .style("stroke", () => {
        return legendFont.lineColor ? legendFont.lineColor : "#000";
      })
      .style("stroke-width", () => {
        return legendFont.lineWeight ? legendFont.lineWeight : 0;
      })
      .attr("x", (d) => {
        return legendFont.size + 10;
      })
      .attr("y", 0)
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
    family: "Arial",
    size: 12,
    color: "#000",
    weight: "bold",
  },
  valueFont: {
    family: "Arial",
    size: 16,
    color: "#fff",
    weight: "bold",
  },
  labelFont: {
    family: "Arial",
    size: 11,
    color: "#fff",
    weight: "normal",
  },
  bubbleClickFun: (label) => {
    console.log(`Bubble ${label} is clicked ...`);
  },
  legendClickFun: (label) => {
    console.log(`Legend ${label} is clicked ...`);
  },
};
