Template.characterGitChart.rendered = function () {

  var user = Meteor.user();
  var git_record = Habits.findOne({userId: user._id}).git_record;
  var data = [];
  for (var date in git_record){
    data.push(git_record[date][0]);
  }

  // var data = [4, 8, 15, 16, 23, 42];

  var x = d3.scale.linear()
      .domain([0, d3.max(data)])
      .range([0, 420]);

  d3.select(".chart")
    .selectAll("div")
      .data(data)
    .enter().append("div")
      .style("width", function(d) { return x(d) + "px"; })
      .text(function(d) { return d; });
};


