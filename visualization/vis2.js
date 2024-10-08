//set svg parameters
const width_ = 800,
      height_ = 400;
const svg = d3.select("#vis-2")
   .append("svg")
     .attr("width", "100%")
     .attr("height", "100%")
     .attr("viewBox","0 0  450 350")
     .attr("preserveAspectRatio","xMinYMin");

// set map scale, location on screen and its projection
const projection = d3.geoRobinson()
        .scale(85)
        .center([100, -30])
        .translate([width_/2.2, height_/2]);

// path generator
const path = d3.geoPath()
        .projection(projection);

//declare polygon and polyline
const poly = svg.append("g");
const line = svg.append("g");

function createMap(URL, column){
  const title = svg.selectAll(".title-map")
  .data([null])
  .join(
      enter => {
          return enter.append("text")
              .attr("class", "title-map")
              .attr("x", 230)
              .attr("y", 10)
              .style("fill", "#f6f6f6")
              .style("font-family", "Biko")
              .attr("text-anchor", "middle")
              .style("font-size", "12px")
              .text(`${column}`);
      },
      // Actualizar el texto existente
      update => {
          return update.text(`${column}`);
      },
      // Eliminar elementos que ya no están en los datos
      exit => {
          exit.remove();
      }
  );
  // declare URL
  const dataURL = URL;
  const countriesCodeURL = "../dataset/Countries Code.csv";
  const polygonsURL = "https://raw.githubusercontent.com/GDS-ODSSS/unhcr-dataviz-platform/master/data/geospatial/world_polygons_simplified.json";
  const polylinesURL = "https://raw.githubusercontent.com/GDS-ODSSS/unhcr-dataviz-platform/master/data/geospatial/world_lines_simplified.json";

  // load data
  const promises = [
    d3.json(polygonsURL),
    d3.csv(dataURL),
    d3.csv(countriesCodeURL)
  ];

  Promise.all(promises).then(ready)
  function ready([topology, top200, countriesCode]) {

    // prepare pop data to join shapefile
    const data = {};
    const countries = {};
    countriesCode.forEach(function(d){
      countries[d["ISO 3"]] = d.NOMBRE;
    });
    top200.forEach(function(d){
      data[d.iso] = +d[column];
    });

    console.log("data",data);
    valores = Object.values(data);

    // set color scale
    const color = d3.scaleQuantize()
    .domain([d3.min(valores), d3.max(valores)])
      .range(["#332424","#825D5B","#DE746F","#E84E46"])
      .unknown("#332424");

    // set mouse events
    const mouseover = function(d) {
      d3.selectAll(".countries")
        .transition()
        .duration(100)
        .style("opacity", .3)
      d3.select(this)
        .transition()
        .duration(100)
        .style("opacity", 1)
    };
    const mouseleave = function(d) {
      d3.selectAll(".countries")
        .transition()
        .duration(100)
        .style("opacity", 1)
      d3.select(this)
        .transition()
        .duration(100)
        .style("opacity", 1)
    };

    // load and draw polygons
    poly
      .selectAll("path")
      .data(topojson.feature(topology, topology.objects.world_polygons_simplified).features)
      .join(enter => {
        const path_ = enter.append("path")
        .attr("fill", function(d) { return color(d[column] = data[d.properties.color_code])})
        .attr("d", path)
        .attr("class", function(d){ return "countries" })
        .on("mouseover", mouseover)
        .on("mouseleave", mouseleave)
        .append("title")
          .text(function(d) {
            return `${countries[d.properties.color_code]} \nSemanas en el top Chart 200: ${d[column] === undefined? "0" : d[column].toLocaleString()}`
          });
        return path_;
      },
      // Actualizar ejes
      update  => {
        update.
        attr("fill", function(d) { return color(d[column] = data[d.properties.color_code])})
        .attr("d", path)
        .attr("class", function(d){ return "countries" })
        .on("mouseover", mouseover)
        .on("mouseleave", mouseleave)
        .select("title")
        .text(function(d) {
          return `${countries[d.properties.color_code]} \nSemanas en el top Chart 200: ${d[column] === undefined? "0" : d[column].toLocaleString()}`
        });
        return update;
      },
      // Eliminar barras que ya no están en los datos
      exit => {
        exit.remove()
        return exit;
      }
    );

    //load and draw lines
    d3.json(polylinesURL).then(function(topology) {
    line
      .selectAll("path")
        .data(topojson.feature(topology, topology.objects.world_lines_simplified).features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill","none")
        .attr("class", function(d) {return d.properties.type;})
    });

    //zoom function
    const zoom = true
    if (zoom){
      var zoomFunction = d3.zoom()
          .scaleExtent([1, 8])
          .on('zoom', function(event) {
            poly.selectAll('path')
            .attr('transform', event.transform);
            line.selectAll('path')
            .attr('transform', event.transform);
      });
      svg.call(zoomFunction);
    };

    // set legend
    svg.append("g")
      .attr("class", "legendThreshold")
      .attr("transform", "translate(5,255)");

    const legend = d3.legendColor()
      .labelFormat(d3.format(",.0f"))
      .labels(d3.legendHelpers.thresholdLabels)
      .labelOffset(0)
      .shapeWidth(30) 
      .shapePadding(5)
      .scale(color)
    ;

    const limitesDominio = color.thresholds();
    // legend en español
    const etiquetasLeyenda = limitesDominio.map((limite, index) => {
      console.log("limite",limite,"index",index)
      const siguienteLimite = Math.trunc(limitesDominio[index + 1]);
      if (index === limitesDominio.length-1) {
        return `${Math.trunc(limite).toLocaleString()}+`;
      } else {
        return `${Math.trunc(limite).toLocaleString()}-${(siguienteLimite - 1).toLocaleString()}`;
      }
    });
    
    etiquetasLeyenda.unshift(`0-${(Math.trunc(limitesDominio[0]) - 1).toLocaleString()}`);
    // Actualizar las etiquetas de la leyenda
    legend.labels(etiquetasLeyenda)

    console.log(limitesDominio)

    svg.selectAll(".legendThreshold")
      .data([null])
      .join(enter => {
        const g = enter.call(legend);
        return g;
      },
      // Actualizar ejes
      update  => {
        update.call(legend);
        return update;
      },
      // Eliminar barras que ya no están en los datos
      exit => {
        exit.remove()
        return exit;
      }
    );  

    svg.selectAll(".note")
    .data([null])
    .join(enter => {
        const g = enter.append("text")
            .attr('class', 'note')
            .attr('x', 300)
            .attr('y', 310)
            .attr('height', 100)
            .style('fill', '#f6f6f6')
            .style('font-family', 'Biko')
            .attr('text-anchor', 'start')
            .style('font-size', 7);

        // Texto en dos líneas
        const textLines = [
            "El mapa muestra el número de semanas que un",
            "álbum ha estado en el Top Chart 200 de Spotify."
        ];

        g.selectAll('tspan')
            .data(textLines)
            .enter()
            .append('tspan')
            .attr('x', 300)
            .attr('dy', (d, i) => i * 10)  // Ajusta la separación vertical entre líneas
            .text(d => d);

        return g;
    });
  }
}

createMap("../dataset/Top Charts Album.csv", "Total");