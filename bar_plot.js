/**
 *
 * Created by yyl on 2018/1/5.
 */
var svg_bar = d3.select('#canvas-svg-bar').attr("transform","translate(-100,0)");

var width_bar = +svg_bar.attr('width');
var height_bar = +svg_bar.attr('height');
var margin_bar = {
    left:130,
    right:80,
    top:100,
    bottom:100
};
function showTip(loc,d) {
    var tip = d3.select('.d3-tip');
    var showTip = (loc,d)=>{
        "use strict";
        tip.style('opacity',1)
            .style('top',`${loc[0]+2380}px`)
            .style('margin-left',`${loc[1]-80}px`)
            .style('position','absolute');
        tip.html(`<strong>${d.name}:</strong> <span style="color:red">${d.value}</span>`);
    };
    showTip(loc,d)
//
}
function hidTip() {
    var tip = d3.select('.d3-tip');
    var hidTip = ()=>{
        "use strict";
        tip.style('opacity',0)
    }
    hidTip();
}

d3.csv('career.csv',row=>{
    "use strict";
    row['Starting Median Salary'] = +row['Starting Median Salary'].replace('$','');
    row['Mid-Career Median Salary'] = +row['Mid-Career Median Salary'].replace('$','');
    row.delta = row['Mid-Career Median Salary'] - row['Starting Median Salary'];
    return row;
},data=>{
    "use strict";

    var max = d3.max(data, d=>d['Mid-Career Median Salary']);
    var scale_x = d3.scaleLinear().domain([0, max]).range([0, width_bar - margin_bar.right - margin_bar.left]);
    var scale = d3.scaleLinear().domain([0, max]).range([margin_bar.left, width_bar - margin_bar.right]);
    var scale_y = d3.scaleBand()
        .domain(data.map(d=>d['Undergraduate Major']))
        .rangeRound([margin_bar.top, height_bar - margin_bar.bottom])
        .paddingInner(0.1);

    var container = svg_bar.append('g');
    var barG = container.append('g');
    var barsL = barG.selectAll('.left').data(data);

    barsL.enter().append('rect')
        .attr('class','left')
        .merge(barsL)
        .attr('x',margin_bar.left)
        .attr('y',d=>scale_y(d['Undergraduate Major']))
        .attr('width', d=>scale_x(d['Starting Median Salary']))
        .attr('height',d=>scale_y.bandwidth())
        .style('fill','#bbb4c1')
        .on('mouseover',function (d) {
            d3.select(this).style('fill','red');
            var top = scale_y(d['Undergraduate Major'])-margin_bar.top/2;
            var left = scale_x(d['Starting Median Salary'])/2;
            showTip([top,left],{name:'Starting Median Salary',value:d['Starting Median Salary']})
        })
        .on('mouseout',function (d){
            d3.select(this).style('fill','#bbb4c1');
            hidTip();
        })
    ;

    var barsR = barG.selectAll('.right').data(data);
    barsR.enter().append('rect')
        .attr('class','right')
        .merge(barsR)
        .attr('x',d=>margin_bar.left+scale_x(d['Starting Median Salary']))
        .attr('y',d=>scale_y(d['Undergraduate Major']))
        .attr('width', d=>scale_x(d.delta))
        .attr('height',d=>scale_y.bandwidth())
        .style('fill','#eadad3')
        .on('mouseover',function (d){
            d3.select(this).style('fill','red');
            var top = scale_y(d['Undergraduate Major'])-margin_bar.top/2;
            //var left = scale_x(d['Mid-Career Median Salary']);
            var left = margin_bar.left+(scale_x(d['Starting Median Salary'])+scale_x(d.delta))/2;
            showTip([top,left],{name:'Mid-Career Median Salary',value:d['Mid-Career Median Salary']})
        })
        .on('mouseout',function (d){
            d3.select(this).style('fill','#eadad3');
            hidTip();
        })
    ;

    var gAxis_x = container.append('g')
        .attr('transform',`translate(0,${height_bar-margin_bar.top})`)
        .call(d3.axisBottom(scale));

    var gAxis_y = container.append('g')
        .attr('transform',`translate(${margin_bar.left},0)`)
        .call(d3.axisLeft(scale_y));

});
svg_bar.append("text").text("Starting&mid-career median salary for different majors")
   .attr("class", "map-header")
   .attr("x",0)
   .attr("y",60);
 svg_bar.append("text").text("Measured in dollar")
    .attr('class', "graph-ref")
    .attr("x",width_bar-150)
    .attr("y",height_bar-60);
svg_bar.append('text').text("(source: Kaggle.com, 2017)")
    .attr('class', "graph-ref")
    .attr("x",width_bar/2-100)
    .attr("y",height_bar-20)
    .attr('fill','darkgray');
