//Be sure to include this https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.2/Chart.min.js

var chartColors = {
  blue: "rgb(54, 162, 235)",
  green: "rgb(45, 230, 92)",
  grey: "rgb(201, 203, 207)",
  orange: "rgb(255, 159, 64)",
  purple: "rgb(153, 102, 255)",
  red: "rgb(255, 99, 132)",
  yellow: "rgb(255, 205, 86)"
}

function randomSum(count) {
  return new Array(count).fill().map(() => Math.random()).reduce((sum, curr) => sum + curr, 0)
}

function getNormalizedRandom() {
  return (randomSum(10) - 5) / 5;
}
//This is to return multidimensional random point within the range specified, and have the dependent
//variable vary its value based on the normal distribution
function getRandomizedData(f = (x) => x, length, dimensions = 2, range = [[-1, 1]], varianceScalar = 0) {
  var dataset = []
  for (i = 0; i < length; i++) {
    var data = []
    var value = 0
    for (j = 0; j < dimensions - 1; j++) {
      var value = Math.random() * (range[j][1] - range[j][0]) + range[j][0]
      data.push(value)
    }
    value = f(...data)
    value += (getNormalizedRandom() * varianceScalar)
    data.push(value)
    dataset.push(data)
  }
  return dataset
}
function populate2DScatter(name, sampleData, xAxisLabel, yAxisLabel) {
  populate2DRegression(name, sampleData, null, xAxisLabel, yAxisLabel)
}
function populate2DRegression(
  name,
  sampleData,
  predict,
  xAxisLabel,
  yAxisLabel,
) {
  var usedColors = Object.keys(chartColors)
  var getNextColor = (color) => {
    if (color) {
      var index = usedColors.indexOf(color)
      if (index > -1) {
        return chartColors[usedColors.splice(index, 1)[0]]
      } else {
        return color
      }
    } else {
      return chartColors[usedColors.shift()]
    }
    chartColors[usedColors.shift()]
  }
  var ctx = document.getElementById(name).getContext('2d');
  var color = Chart.helpers.color;

  var chartData = {
    datasets: sampleData.map(sample => {
      var nextColor = getNextColor(sample.color)
      return {
        type: 'scatter',
        showLine: false,
        label: sample.name,
        borderColor: nextColor,
        backgroundColor: color(nextColor).alpha(0.2).rgbString(),
        data: sample.data
      }
    })
  };

  if (predict) {
    var predictData = predict.data || sampleData[0].data.map(d => Object.assign({}, d, { y: predict.func(d.x) }))
    var nextColor = getNextColor(predict.color || 'red')
    predictData = predictData.sort((a, b) => a.x - b.x)
    chartData.datasets.push({
      type: 'line',
      showLine: true,
      cubicInterpolationMode: 'monotone',
      pointRadius: 0,
      fill: false,
      label: predict.name,
      borderColor: nextColor,
      backgroundColor: color(nextColor).alpha(0.2).rgbString(),
      data: predictData
    })
  }
  var getData = (item, data, attr) => {
    try {
      return data.datasets[item[0].datasetIndex].data[item[0].index][attr]
    } catch (e) {
      return null
    }
  }
  var chartOptions = {
    tooltips: {
      callbacks: {
        title: (item, data) => getData(item, data, 'title'),
        afterTitle: (item, data) => getData(item, data, 'afterTitle'),
        label: (item, data) => {
          var label = getData(item, data, 'label') ||
            item.xLabel.toFixed(2) + ", " + item.yLabel.toFixed(2)
          return label
        }
      },
      //This ensures the regression line will not show tooltips
      filter: (item) => item.datasetIndex !== sampleData.length
    },
    scales: {
      xAxes: [{
        scaleLabel: {
          display: xAxisLabel ? true : false,
          labelString: xAxisLabel
        },
        display: true
      }],
      yAxes: [{
        scaleLabel: {
          display: yAxisLabel ? true : false,
          labelString: yAxisLabel
        },
        display: true
      }],
    }
  }
  var myChart = new Chart.Scatter(ctx, {
    data: chartData,
    options: chartOptions
  });

}

//getRandomizedData((x)=>{return 2*x + 1;},100,2,[[0,10],[0,20]],[5,5])
