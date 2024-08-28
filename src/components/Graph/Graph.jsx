import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import "./Graph.scss";
import { Button, Stack, Chip } from "@mui/joy";
import { Typography } from "antd";
import { Tag } from "antd";
import moment from "moment";

export default function Graph({ nodes, links, leave }) {
    const svgRef = useRef(null);
    const [popupData, setPopupData] = useState(null);

    useEffect(() => {
        if (!svgRef.current) return;

        const width = svgRef.current.clientWidth;
        const height = svgRef.current.clientHeight;

        const svg = d3
            .select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .style("border", "1px solid black");

        const container = svg.append("g");

        const zoom = d3
            .zoom()
            .scaleExtent([0.1, 10])
            .on("zoom", (event) => {
                container.attr("transform", event.transform);
            });

        svg.call(zoom).on("dblclick.zoom", null);
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
            })
            .on("click", function (event, d) {
                // Positionner le popup
                const [x, y] = d3.pointer(event);
                console.log(d);
                setPopupData({
                    x,
                    y,
                    data: d,
                });
                event.stopPropagation(); // Stopper la propagation pour empêcher la fermeture immédiate
            });

        // Ajout des étiquettes sur fond blanc en dessous des sommets
        node.each(function (d) {
            const title =
                d.title.length > 15 ? d.title.substring(0, 6) + "..." : d.title;
            const textElement = d3
                .select(this)
                .append("text")
                .attr("x", 0)
                .attr("y", 28)
                .attr("text-anchor", "middle")
                .attr("fill", "black")
                .style("font-size", "12px")
                .text(title);

            const bbox = textElement.node().getBBox();
            d3.select(this)
                .insert("rect", "text")
                .attr("x", bbox.x - 2)
                .attr("y", bbox.y - 2)
                .attr("width", bbox.width + 4)
                .attr("height", bbox.height + 4)
                .attr("fill", "white")
                .attr("stroke", "black")
                .attr("stroke-width", 1);
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
            d.fx = null;
            d.fy = null;
        }
    }, [nodes, links]);

    return (
        <div>
            <svg
                id="mind"
                ref={svgRef}
                style={{ width: "100%", height: "100%" }}
            ></svg>

            {popupData && (
                <div className="popup">
                    <Typography level="p">
                        <span style={{ color: "white" }}>
                            <strong>Nom — </strong> {popupData.data.title}
                        </span>
                    </Typography>

                    <Typography level="p">
                        <span style={{ color: "white" }}>
                            <strong>Date — </strong>{" "}
                            {`${moment(popupData.data.timestamp).format(
                                "DD/MM/YYYY"
                            )} a ${moment(popupData.data.timestamp).format(
                                "HH:m:s"
                            )}`}
                        </span>
                    </Typography>

                    {popupData.data.keywords.length > 0 ? (
                        <Stack className="popup-keywords">
                            {popupData.data.keywords.map((v, i) => (
                                <Tag
                                    key={i}
                                    className="popup-keywords-tag"
                                    color="green"
                                >
                                    #{v}
                                </Tag>
                            ))}
                        </Stack>
                    ) : null}

                    <Button
                        onClick={() => {
                            setPopupData(null);
                            leave(popupData.data.title);
                        }}
                        style={{ zIndex: "999" }}
                    >
                        Voir la note
                    </Button>

                    <Button
                        onClick={() => {
                            console.log(popupData.data);
                            setPopupData(null);
                        }}
                        color="danger"
                        style={{ zIndex: "999" }}
                    >
                        Retour
                    </Button>
                </div>
            )}
        </div>
    );
}
