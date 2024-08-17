import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import "./Graph.scss";

export default function Graph({ nodes, links }) {
    const svgRef = useRef(null);

    useEffect(() => {
        if (!svgRef.current) return;

        const width = svgRef.current.clientWidth;
        const height = svgRef.current.clientHeight;

        const svg = d3
            .select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .style("border", "1px solid black");

        const container = svg.append("g"); // Un groupe pour contenir tout

        const zoom = d3
            .zoom()
            .scaleExtent([0.1, 10]) // Limiter le zoom pour ne pas zoomer trop loin
            .on("zoom", (event) => {
                container.attr("transform", event.transform);
            });

        svg.call(zoom).on("dblclick.zoom", null); // Désactiver le zoom au double clic

        svg.call(
            zoom.transform,
            d3.zoomIdentity.translate(width / 2, height / 2).scale(1)
        );

        const tooltip = d3
            .select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        container.selectAll("*").remove();

        const simulation = d3
            .forceSimulation(nodes)
            .force(
                "link",
                d3
                    .forceLink(links)
                    .id((d) => d.id)
                    .distance(120)
            )
            .force("charge", d3.forceManyBody().strength(-300))
            .force("collision", d3.forceCollide().radius(25))
            .force("x", d3.forceX().strength(0.05))
            .force("y", d3.forceY().strength(0.05));

        const link = container
            .append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(links)
            .enter()
            .append("line")
            .attr("stroke-width", (d) => Math.sqrt(d.value))
            .attr("stroke", "#ffffff");

        const node = container
            .append("g")
            .attr("class", "nodes")
            .selectAll("g")
            .data(nodes)
            .enter()
            .append("g");

        node.append("circle")
            .attr("r", 12)
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .call(
                d3
                    .drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended)
            )
            .on("mouseover", function (event, d) {
                tooltip.transition().duration(200).style("opacity", 0.9);
                tooltip
                    .html(d.title)
                    .style("left", event.pageX + 5 + "px")
                    .style("top", event.pageY - 28 + "px");
            })
            .on("mouseout", function () {
                tooltip.transition().duration(500).style("opacity", 0);
            });

        node.each(function (d) {
            const group = d3.select(this);

            const text = group
                .append("text")
                .attr("x", 0)
                .attr("y", 20)
                .attr("text-anchor", "middle")
                .attr("fill", "white")
                .style("font-size", "10px")
                .text(truncateText(d.title, 10));

            const bbox = text.node().getBBox();

            group
                .insert("rect", "text")
                .attr("x", bbox.x - 2)
                .attr("y", bbox.y - 2)
                .attr("width", bbox.width + 4)
                .attr("height", bbox.height + 4)
                .attr("fill", "black");
        });

        simulation.nodes(nodes).on("tick", () => {
            link.attr("x1", (d) => d.source.x)
                .attr("y1", (d) => d.source.y)
                .attr("x2", (d) => d.target.x)
                .attr("y2", (d) => d.target.y);

            node.attr("transform", (d) => `translate(${d.x},${d.y})`);
        });

        simulation.force("link").links(links);

        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            setTimeout(() => {
                d.fx = null;
                d.fy = null;
            }, 100);
        }

        function truncateText(text, maxLength) {
            return text.length > maxLength
                ? text.slice(0, maxLength) + "..."
                : text;
        }
    }, [nodes, links]);

    return (
        <svg
            id="mind"
            ref={svgRef}
            style={{ width: "100%", height: "100%" }}
        ></svg>
    );
}
