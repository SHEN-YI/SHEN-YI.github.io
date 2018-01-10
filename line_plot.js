var svg_line = d3.select("#canvas-svg-line");
var width_line = svg_line.attr('width');
var height_line = svg_line.attr('height');
var margin = {
    left: 70,
    right: 130,
    top: 100,
    bottom:80,
    interval:50
};

d3.csv('data.csv',row=>{
    row.TIME = +row.TIME;
    row.Value = +row.Value;
    return row;
},data=>{
    var callbacks = Callbacks('memory');
    var nestD = d3.nest().key(d=>d.Country).entries(data);
    //console.log(nestD);
    function drawLine(g, data, lineColor, xRange, yRange, lineWrap, key){
        var xExtent = d3.extent(data,d=>d.TIME);
        var yExtent = d3.extent(data,d=>d.Value);
        function expand(extent, range){
            return [extent[0] - range, extent[1]+range]
        }

        var scale = d3.scaleLinear()
            .domain(data.map(d=>d.TIME))
            .range(data.map(d=>d.Value));

        var scaleX = d3.scaleLinear()
            .domain(xExtent)
            .range(xRange);
        var scaleY = d3.scaleLinear()
            .domain(expand(yExtent, 500))
            .range(yRange);


        var axis_x = d3.axisBottom(scaleX);
        g.append('g')
            .classed('axis', true)
            .attr('transform',`translate(0,${yRange[0]})`)
            .call(axis_x)
            .append('text')
            .attr('x',xRange[1])
            .attr('y', 40)
            .style('fill','#000')
            .style('font-size','14px')
            .style('text-anchor','end')
            .text(key);

        var axis_y = d3.axisLeft(scaleY).ticks(5);
        g.append('g')
        .classed('axis', true)
        .attr('transform',`translate(${xRange[0]},0)`)
        .call(axis_y);


        var line = d3.line()
            .x(d=>scaleX(d.TIME))
            .y(d=>scaleY(d.Value));

        var paths = g.selectAll('.line')
            .data([data]);
        paths.enter().append('path')
            .merge(paths)
            .attr('class','line')
            .attr('d',line)
            .style('fill','none')
            .style('stroke-width','2px')
            .style('stroke',lineColor);

        lineWrap.append('rect')
            .attr('x',xRange[0]+1)
            .attr('y', yRange[1])
            .attr('width',50)
            .attr('height',16)
            .style('fill','#fff');

        var text = lineWrap.append('text')
            .attr('x',xRange[0]+26)
            .attr('y', yRange[1]+8)
            .style('fill',lineColor)
            .text(yExtent[0]);

        callbacks.add((x)=>{
            text.text(scale(scaleX.invert(x)).toFixed(0))
        });
    }
    var g1 = svg_line.append('g');
    var perHeight = (height_line-margin.bottom)/4;
    // drawLine(g1,nestD[0].values, '#FC9E27',
    //     [margin.left, width - margin.right], [height-margin.bottom, margin.top]);
    var color = ['#FC9E27', '#3A7FA3', '#D6616B', '#B5CF6B'];

    var lines = svg_line.append('g');

    var interactiveWrap = svg_line.append('g').attr('class','interactive-wrap');
    var lineWrap = interactiveWrap.append('g').attr('class','line-wrap').style('display','none');
    lineWrap.append('line')
        .attr('x1', margin.left)
        .attr('y1', margin.top)
        .attr('x2', margin.left)
        .attr('y2',height_line - margin.bottom)
        .style('stroke','#ccc')
        .style('stroke-width',2);

    interactiveWrap.append('rect')
        .attr('x', margin.left)
        .attr('y',margin.top)
        .attr('width', width_line - margin.left - margin.right)
        .attr('height', height_line - margin.top - margin.bottom)
        .style('fill','#000')
        .style('opacity',0)
        .on('mousemove',d=>{
            var coord = d3.mouse(interactiveWrap.node());
            //console.log(coord);
            lineWrap.attr('transform',`translate(${coord[0]-100},0)`).style('display','block');
            callbacks.fireWith(this,[coord[0]-100]);
        })
        .on('mouseout',d=>{
            lineWrap.style('display','none');
        })
        ;

    nestD.forEach((e,i) => {
        var g = lines.append('g');
        drawLine(g, e.values, color[i],
            [margin.left, width_line - margin.right],
            [perHeight*(i+1), margin.top+(perHeight)*i], lineWrap, e.key)
    });
});
svg_line.append("text").text("Average wage trend within four countries")
   .attr("class", "map-header")
   .attr("x",70)
   .attr("y",70);
svg_line.append('text').text("(source: OECD organisation, 2017)")
   .attr('class', "graph-ref")
   .attr("x",width_line/2-100)
   .attr("y",height_line-20)
   .attr('fill','darkgray');
