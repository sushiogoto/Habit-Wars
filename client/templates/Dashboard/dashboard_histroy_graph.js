Template.dashboardHistoryGraph.rendered = function () {

  function dashboard(id, fData){

      var barColor = "#f1b837";
      function segColor(c){ return {low:"#807dba", mid:"#e08214",high:"#41ab5d"}[c]; }

      // compute total for each state.
      fData.forEach(function(d){d.total=d.freq.low+d.freq.mid+d.freq.high;});

      // function to handle histogram.
      function histoGram(fD){
          var hG={},    hGDim = {t: 60, r: 0, b: 30, l: 0};
          hGDim.w = 300 - hGDim.l - hGDim.r,
          hGDim.h = 300 - hGDim.t - hGDim.b;

          //create svg for histogram.
          var hGsvg = d3.select(id).append("svg")
              .attr("width", hGDim.w + hGDim.l + hGDim.r)
              .attr("height", hGDim.h + hGDim.t + hGDim.b).append("g")
              .attr("transform", "translate(" + hGDim.l + "," + hGDim.t + ")");

          // create function for x-axis mapping.
          var x = d3.scale.ordinal().rangeRoundBands([0, hGDim.w], 0.1)
                  .domain(fD.map(function(d) { return d[0]; }));

          // Add x-axis to the histogram svg.
          hGsvg.append("g").attr("class", "x axis")
              .attr("transform", "translate(0," + hGDim.h + ")")
              .call(d3.svg.axis().scale(x).orient("bottom"));

          // Create function for y-axis map.
          var y = d3.scale.linear().range([hGDim.h, 0])
                  .domain([0, d3.max(fD, function(d) { return d[1]; })]);

          // Create bars for histogram to contain rectangles and freq labels.
          var bars = hGsvg.selectAll(".bar").data(fD).enter()
                  .append("g").attr("class", "bar");

          //create the rectangles.
          bars.append("rect")
              .attr("x", function(d) { return x(d[0]); })
              .attr("y", function(d) { return y(d[1]); })
              .attr("width", x.rangeBand())
              .attr("height", function(d) { return hGDim.h - y(d[1]); })
              .attr('fill',barColor);

          //Create the frequency labels above the rectangles.
          bars.append("text").text(function(d){ return d3.format(",")(d[1])})
              .attr("x", function(d) { return x(d[0])+x.rangeBand()/2; })
              .attr("y", function(d) { return y(d[1])-5; })
              .attr("text-anchor", "middle");


          return hG;
      }

      // calculate total frequency by segment for all state.
      var tF = ['low','mid','high'].map(function(d){
          return {type:d, freq: d3.sum(fData.map(function(t){ return t.freq[d];}))};
      });

      // calculate total frequency by state for all segment.
      var sF = fData.map(function(d){return [d.Day,d.total];});

      var hG = histoGram(sF); // create the histogram.

  }

  user = Meteor.user();
  habit = Habits.findOne({userId: user._id});

  current = new Date();
  first = current.getDate() - current.getDay();
  firstday = new Date(current.setDate(first));

  habitHistory = [];

  weekDay = {
    0: "Mon",
    1: "Tue",
    2: "Wed",
    3: "Thur",
    4: "Fri",
    5: "Sat",
    6: "Sun"
  };

  for(var i = 0; i < 7; i++){
    year = firstday.getUTCFullYear();
    month = firstday.getUTCMonth() + 1;
    day = firstday.getUTCDate() + i;
    date = year + "-" + month + "-" + day;

    (habit.git_record[date] === undefined) ? gitCount = 0 : gitCount = habit.git_record[date][0];

    habitHistory.push({
      Day: weekDay[i],
      freq: {low:gitCount, mid:0, high:0 }
    });
  }

  dashboard('#dashboard',habitHistory);

};
