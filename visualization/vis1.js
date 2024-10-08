    const margin = { top: 50, right: 80, bottom: 30, left: 150 };
    const width = 1000 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const SVG1 = d3.select("#vis-1")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")")
    const tooltip = d3.select("body").append("div")
        .attr("id", "tooltip")
        .style("display", "none")
        .style("position", "absolute")
        .style("background", "#5c4652")
        .style("color", "#f6f6f6")
        .style("padding", "8px")
        .style("border-radius", "4px");
        
    const parsearDatosAlbumes = (d) => {
        // Divide la cadena de fecha en partes usando el carácter "-"
        const fechaPartes = d["Release Date"].split("-");

        // Crea la fecha en formato "MM-DD-YYYY"
        const fechaFormateada = `${fechaPartes[1]}-${fechaPartes[0]}-${fechaPartes[2]}`;

        return {
            album: d["Album"],
            total_streams: parseInt(d["Total Streams"]),
            release_date: new Date(fechaFormateada),
            daily_streams: parseInt(d["Daily"])
        }

    }

    const parsearDatosCanciones = (d) => {
        return {
            album: d["Album"],
            song: d["Song"],
            total_streams: parseInt(d["Streams"]),
            daily_streams: parseInt(d["Daily"])
        }
    }

    function preprocesarData (callback){
        let ALBUM_STREAMS, SONGS_STREAMS;
        "Leer csv y procesar datos"
        d3.csv("../dataset/Album Streams.csv", parsearDatosAlbumes).then(dataset => {
            ALBUM_STREAMS = dataset;
            d3.csv("../dataset/Songs Streams.csv", parsearDatosCanciones).then(dataset => {
                SONGS_STREAMS = dataset;

                callback(ALBUM_STREAMS, SONGS_STREAMS);
            })
        })
    }

    function procesarAlbum(filtrar, album, ALBUM_STREAMS, SONGS_STREAMS){
        "Si es false mostrar ranking de albumes"
        let dataOrdenada;
        if (!filtrar) {
            dataOrdenada = ALBUM_STREAMS.sort((a, b) => d3.ascending(a.total_streams, b.total_streams));
        } else {
            const dataFiltrada = SONGS_STREAMS.filter(d => d.album === album);
            dataOrdenada = dataFiltrada.sort((a, b) => d3.ascending(a.total_streams, b.total_streams));
        }
        
        "Si es true mostrar grafico de album seleccionado"
            // Configuración de escalas
            const x = d3.scaleLinear().range([0, width]);
            const y = d3.scaleBand().range([height, 0]).padding(0.2);
            const xAxis = d3.axisBottom(x);
            const yAxis = d3.axisLeft(y);
            
            x.domain([0, d3.max(dataOrdenada, d => d.total_streams)]);
            y.domain(dataOrdenada.map(d => filtrar? d.song : d.album));

            const x_axis = SVG1.selectAll(".x-axis")
            .data([null])
            .join(enter => {
                const axis = enter.append("g").attr("class", "x-axis")
                .attr("transform", `translate(0, ${height})`)
                .call(xAxis);
                
                return axis;
            },
            // Actualizar ejes
            update  => {
                update.transition().duration(500).call(xAxis);
                return update;
            },
            // Eliminar barras que ya no están en los datos
            exit => {
                exit.remove()
                return exit;
            }
            );

            const y_axis = SVG1.selectAll(".y-axis")
            .data([null])
            .join(enter => {
                const axis = enter.append("g").attr("class", "y-axis")
                .call(yAxis);
                
                return axis;
            },
            // Actualizar ejes
            update  => {
                update.transition().duration(500).call(yAxis);
                return update;
            },
            // Eliminar barras que ya no están en los datos
            exit => {
                exit.remove()
                return exit;
            }
            );

            const title = SVG1.selectAll(".title-plot")
                .data([null])
                .join(
                    enter => {
                        return enter.append("text")
                            .attr("class", "title-plot")
                            .attr("x", width / 2)
                            .attr("y", 0 - (margin.top / 2))
                            .style("fill", "#f6f6f6")
                            .style("font-family", "Biko")
                            .attr("text-anchor", "middle")
                            .style("font-size", "20px")
                            .style("text-decoration", "underline")
                            .text(album ? `Total de Streams ${album}` : "Total de Streams");
                    },
                    // Actualizar el texto existente
                    update => {
                        return update.text(album ? `Total de Streams ${album}` : "Total de Streams");
                    },
                    // Eliminar elementos que ya no están en los datos
                    exit => {
                        exit.remove();
                    }
                );


            const bars = SVG1
            .selectAll(".bar")
            .data(dataOrdenada)
            .join(
            enter => {
                return enter.append("rect")
                    .transition()
                    .duration(500)
                    .attr("x", 0)
                    .attr("height", y.bandwidth())
                    .attr("class", "bar")
                    .attr("opacity", 1)
                    .attr("y", d => y(filtrar? d.song : d.album))
                    .attr("width", d => x(d.total_streams))
                    .attr("fill", album? "#e94c45" : "#ced4e0");
            },
            // Actualizar barras existentes
            update  => {

                return update
                    .transition()
                    .duration(500)
                    .attr("opacity", 1)
                    .attr("height", y.bandwidth())
                    .attr("width", d => x(d.total_streams))
                    .attr("fill", album? "#e94c45" : "#ced4e0")
                    .attr("y", d => y(filtrar? d.song : d.album));
            },
            // Eliminar barras que ya no están en los datos
            exit => {
                exit.remove();
            }
            )
            .on("click", function (e, d) {
                bars
                    .attr("fill", (d) => album ? "#e94c45" : "#ced4e0")
                    .attr("opacity", 0.5)
                ;
                d3.select(this)
                    .transition()
                    .duration(100)
                    .attr("opacity", 1);
                if (filtrar){
                    createMap("../dataset/Top Charts Songs.csv", d.song);
                } else {
                    createMap("../dataset/Top Charts Album.csv", d.album);
                }
            })
            .on("mousemove", function (e, d) {
                tooltip.style("display", "block")
                    .style("left", e.pageX + 20 + "px")
                    .style("top", e.pageY + "px")
                    .html(`
                        <div class="tooltip">
                            <p class="tooltip"><strong>${filtrar? d.song : d.album}</strong></p>
                            <p class="tooltip"><strong>Total Streams: </strong>${d.total_streams.toLocaleString()}</p>
                        </div>
                    `);
            })
            .on("mouseout", function () {
                tooltip.style("display", "none");
            });
    }

// LLAMAR A FUNCIONES
preprocesarData((ALBUM_STREAMS, SONGS_STREAMS) => {
    procesarAlbum(false, null, ALBUM_STREAMS, SONGS_STREAMS);
});

// EVENTOS
d3.select("#upAllNight").on("click", () => {
    d3.selectAll(".album")
        .style("opacity", 0.5);
    d3.select("#upAllNight")
        .transition()
        .duration(100)
        .style("opacity", 1);
    preprocesarData((ALBUM_STREAMS, SONGS_STREAMS) => {
        procesarAlbum(true, "Up All Night", ALBUM_STREAMS, SONGS_STREAMS);
        createMap("../dataset/Top Charts Album.csv", "Up All Night");
    });
});
d3.select("#takeMeHome").on("click", () => {
    d3.selectAll(".album")
        .style("opacity", 0.5);
    d3.select("#takeMeHome")
        .transition()
        .duration(100)
        .style("opacity", 1);
    preprocesarData((ALBUM_STREAMS, SONGS_STREAMS) => {
        procesarAlbum(true, "Take Me Home", ALBUM_STREAMS, SONGS_STREAMS);
        createMap("../dataset/Top Charts Album.csv", "Take Me Home");
    });
});
d3.select("#midnightMemories").on("click", () => {
    d3.selectAll(".album")
        .style("opacity", 0.5);
    d3.select("#midnightMemories")
        .transition()
        .duration(100)
        .style("opacity", 1);
    preprocesarData((ALBUM_STREAMS, SONGS_STREAMS) => {
        procesarAlbum(true, "Midnight Memories", ALBUM_STREAMS, SONGS_STREAMS);
        createMap("../dataset/Top Charts Album.csv", "Midnight Memories");
    });
});
d3.select("#four").on("click", () => {
    d3.selectAll(".album")
        .style("opacity", 0.5);
    d3.select("#four")
        .transition()
        .duration(100)
        .style("opacity", 1);
    preprocesarData((ALBUM_STREAMS, SONGS_STREAMS) => {
        procesarAlbum(true, "FOUR", ALBUM_STREAMS, SONGS_STREAMS);
        createMap("../dataset/Top Charts Album.csv", "FOUR");
    });
});
d3.select("#madeInTheAM").on("click", () => {
    d3.selectAll(".album")
        .style("opacity", 0.5);
    d3.select("#madeInTheAM")
        .transition()
        .duration(100)
        .style("opacity", 1);
    preprocesarData((ALBUM_STREAMS, SONGS_STREAMS) => {
        procesarAlbum(true, "Made In The A.M", ALBUM_STREAMS, SONGS_STREAMS);
        createMap("../dataset/Top Charts Album.csv", "Made In The A.M");
    });
});

d3.select("#reset").on("click", () => {
    d3.selectAll(".album")
        .style("opacity", 1);
    preprocesarData((ALBUM_STREAMS, SONGS_STREAMS) => {
        procesarAlbum(false, null, ALBUM_STREAMS, SONGS_STREAMS);
        createMap("../dataset/Top Charts Album.csv", "Total");
    });
});