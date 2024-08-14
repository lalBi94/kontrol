import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import "./Graph.scss";

export default function Graph({ nodes, links }) {
    const ref = useRef(null);

    useEffect(() => {
        const width = ref.current.clientWidth;
        const height = ref.current.clientHeight;

        const svg = d3
            .select(ref.current)
            .attr("width", "100%")
            .attr("height", "100%")
            .style("border", "1px solid black");

        // Ajustements pour espacer les sommets
        const simulation = d3
            .forceSimulation(nodes)
            .force(
                "link",
                d3.forceLink(links).id((d) => d.id)
            )
            .force("charge", d3.forceManyBody().strength(-300)) // Augmentez la force de répulsion
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide().radius(60)) // Augmentez le rayon de collision
            .force("x", d3.forceX().strength(0.1)) // Diminuez la force pour moins d'attraction au centre
            .force("y", d3.forceY().strength(0.1)); // Idem pour l'axe Y

        svg.selectAll("*").remove();

        const link = svg
            .append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(links)
            .enter()
            .append("line")
            .attr("stroke-width", (d) => Math.sqrt(d.value))
            .attr("stroke", "#ffffff");

        const node = svg
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
            );

        node.each(function (d) {
            const group = d3.select(this);

            const text = group
                .append("text")
                .attr("x", -34)
                .attr("y", 20)
                .attr("dy", ".35em")
                .attr("fill", "white")
                .style("font-size", "10px")
                .text(d.title);

            const bbox = text.node().getBBox();

            group
                .insert("rect", "text")
                .attr("x", bbox.x)
                .attr("y", bbox.y)
                .attr("width", bbox.width)
                .attr("height", bbox.height)
                .attr("fill", "black");
        });

        simulation.nodes(nodes).on("tick", () => {
            link.attr("x1", (d) => d.source.x)
                .attr("y1", (d) => d.source.y)
                .attr("x2", (d) => d.target.x)
                .attr("y2", (d) => d.target.y);

            node.attr(
                "transform",
                (d) =>
                    `translate(${d.x + Math.sin(d.x / 50) * 10},${
                        d.y + Math.cos(d.y / 50) * 10
                    })`
            );
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
            d.fx = null;
            d.fy = null;
        }
    }, [nodes, links]);

    return <svg id="mind" ref={ref}></svg>;
}
