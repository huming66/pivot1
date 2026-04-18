(function() {
  var callWithJQuery;

  callWithJQuery = function(pivotModule) {
    if (typeof exports === "object" && typeof module === "object") {
      return pivotModule(require("jquery"), require("plotly.js"));
    } else if (typeof define === "function" && define.amd) {
      return define(["jquery", "plotly.js"], pivotModule);
    } else {
      return pivotModule(jQuery, Plotly);
    }
  };

  callWithJQuery(function($, Plotly) {
    var makePlotlyChart, makePlotlyScatterChart;
    makePlotlyChart = function(traceOptions, layoutOptions, transpose) {
      if (traceOptions == null) {
        traceOptions = {};
      }
      if (layoutOptions == null) {
        layoutOptions = {};
      }
      if (transpose == null) {
        transpose = false;
      }
      return function(pivotData, opts) {
        var colKeys, columns, d, data, datumKeys, defaults, fullAggName, groupByTitle, hAxisTitle, i, layout, result, rowKeys, rows, titleText, traceKeys;
        defaults = {
          localeStrings: {
            vs: "vs",
            by: "by"
          },
          plotly: {},
          plotlyConfig: { scrollZoom: true}
        };
        opts = $.extend(true, {}, defaults, opts);
        rowKeys = pivotData.getRowKeys();
        colKeys = pivotData.getColKeys();
        traceKeys = transpose ? colKeys : rowKeys;
        if (traceKeys.length === 0) {
          traceKeys.push([]);
        }
        datumKeys = transpose ? rowKeys : colKeys;
        if (datumKeys.length === 0) {
          datumKeys.push([]);
        }
        fullAggName = pivotData.aggregatorName;
        if (pivotData.valAttrs.length) {
          fullAggName += "(" + (pivotData.valAttrs.join(", ")) + ")";
        }
        data = traceKeys.map(function(traceKey) {
          var datumKey, j, labels, len, trace, val, values;
          values = [];
          labels = [];
          for (j = 0, len = datumKeys.length; j < len; j++) {
            datumKey = datumKeys[j];
            val = parseFloat(pivotData.getAggregator(transpose ? datumKey : traceKey, transpose ? traceKey : datumKey).value());
            values.push(isFinite(val) ? val : null);
            labels.push(datumKey.join('-') || ' ');
          }
          trace = {
            name: traceKey.join('-') || fullAggName
          };
          if (traceOptions.type === "pie") {
            trace.values = values;
            trace.labels = labels.length > 1 ? labels : [fullAggName];
          } else if (traceOptions.type === "histogram"){
            trace.x = transpose ? values : values;
            var binSize = (Math.max(...values) - Math.min(...values))/50
            var sizeOrd = Math.floor(Math.log10(binSize))
            var binInt = binSize / 50**sizeOrd
            var intList = [1,2,5]
            var intList1 = intList.map(v => Math.abs(binInt-v))
            binInt = intList[intList1.indexOf(Math.min(...intList1))]
            trace.xbins = {size: binInt*10**sizeOrd}
            trace.cumulative = {enabled: traceOptions.cum}
            trace.histnorm =  traceOptions.histnorm//'percent'
          } else if (traceOptions.type === "duration"){
            var lll = values.length
            if (lll<=1000) {
              trace.y = values.sort(function(a, b){return a-b});
              if (traceOptions.normByCount) {
                trace.x = values.map((v,i) => lll - (i+1))
              } else {
                trace.x = values.map((v,i) => 100 - 100*(i+1) / lll)
              }
              trace.line = {shape: 'hv'}
            } else {
              values.sort(function(a, b){return a-b});
              if (traceOptions.normByCount) {
                trace.y = values.sort(function(a, b){return a-b});
                trace.x = values.map((v,i) => lll - (i+1))
              } else {
                var idx = [...Array(1001).keys()]
                idx = idx.map(i => Math.round(i*(lll-1)/1000))
                trace.x = idx.map(v => 100 - 100*(v+1) / lll)
                trace.y = idx.map(v => values[v])
              }

              // trace.line = {shape: 'hv'}
            }
          } else {
            trace.x = transpose ? values : labels;
            trace.y = transpose ? labels : values;
          }
          return $.extend(trace, traceOptions);
        });
        if (transpose) {
          hAxisTitle = pivotData.rowAttrs.join("-");
          groupByTitle = pivotData.colAttrs.join("-");
        } else {
          hAxisTitle = pivotData.colAttrs.join("-");
          groupByTitle = pivotData.rowAttrs.join("-");
        }
        titleText = fullAggName;
        if (hAxisTitle !== "") {
          titleText += " " + opts.localeStrings.vs + " " + hAxisTitle;
        }
        if (groupByTitle !== "") {
          titleText += " " + opts.localeStrings.by + " " + groupByTitle;
        }
        layout = {
          title: titleText,
          hovermode: 'closest',
          width: window.innerWidth / 1.4,
          height: window.innerHeight / 1.4 - 50
        };
        if (traceOptions.type === 'pie') {
          columns = Math.ceil(Math.sqrt(data.length));
          rows = Math.ceil(data.length / columns);
          layout.grid = {
            columns: columns,
            rows: rows
          };
          for (i in data) {
            d = data[i];
            d.domain = {
              row: Math.floor(i / columns),
              column: i - columns * Math.floor(i / columns)
            };
            if (data.length > 1) {
              d.title = d.name;
            }
          }
          if (data[0].labels.length === 1) {
            layout.showlegend = false;
          }
        } else if (traceOptions.type === "histogram"){
          layout.xaxis = {
            title: transpose ? (traceOptions.histnorm ? 'count' :'percentage%') : fullAggName,
            automargin: true
          };
          layout.yaxis = {
            title: transpose ? fullAggName : (traceOptions.histnorm ? 'count' :'percentage%'),
            automargin: true
          };
          // layout.barmode = 'overlay'
          // layout.bargap = 0.05
          // layout.bargroupgap = 0.2
        } else if (traceOptions.type === "duration"){
          layout.yaxis = {
            title: transpose ? (traceOptions.normByCount ? 'count' : 'percentage% of time') : fullAggName,
            automargin: true
          };
          layout.xaxis = {
            title: transpose ? fullAggName : (traceOptions.normByCount ? 'count' : 'percentage% of time'),
            automargin: true
          };
        } else {
          layout.xaxis = {
            title: transpose ? fullAggName : null,
            automargin: true
          };
          layout.yaxis = {
            title: transpose ? null : fullAggName,
            automargin: true
          };
        }
        result = $("<div>").appendTo($("body"));
        Plotly.newPlot(result[0], data, $.extend(layout, layoutOptions, opts.plotly), opts.plotlyConfig);
        return result.detach();
      };
    };
    makePlotlyScatterChart = function() {
      return function(pivotData, opts) {
        var colKey, colKeys, data, defaults, j, k, layout, len, len1, renderArea, result, rowKey, rowKeys, v;
        defaults = {
          localeStrings: {
            vs: "vs",
            by: "by"
          },
          plotly: {},
          plotlyConfig: {}
        };
        opts = $.extend(true, {}, defaults, opts);
        rowKeys = pivotData.getRowKeys();
        if (rowKeys.length === 0) {
          rowKeys.push([]);
        }
        colKeys = pivotData.getColKeys();
        if (colKeys.length === 0) {
          colKeys.push([]);
        }
        data = {
          x: [],
          y: [],
          text: [],
          type: 'scatter',
          mode: 'markers'
        };
        for (j = 0, len = rowKeys.length; j < len; j++) {
          rowKey = rowKeys[j];
          for (k = 0, len1 = colKeys.length; k < len1; k++) {
            colKey = colKeys[k];
            v = pivotData.getAggregator(rowKey, colKey).value();
            if (v != null) {
              data.x.push(colKey.join('-'));
              data.y.push(rowKey.join('-'));
              data.text.push(v);
            }
          }
        }
        layout = {
          title: pivotData.rowAttrs.join("-") + ' vs ' + pivotData.colAttrs.join("-"),
          hovermode: 'closest',
          xaxis: {
            title: pivotData.colAttrs.join('-'),
            automargin: true
          },
          yaxis: {
            title: pivotData.rowAttrs.join('-'),
            automargin: true
          },
          width: window.innerWidth / 1.5,
          height: window.innerHeight / 1.4 - 50
        };
        renderArea = $("<div>", {
          style: "display:none;"
        }).appendTo($("body"));
        result = $("<div>").appendTo(renderArea);
        Plotly.newPlot(result[0], [data], $.extend(layout, opts.plotly), opts.plotlyConfig);
        result.detach();
        renderArea.remove();
        return result;
      };
    };
    return $.pivotUtilities.plotly_renderers = {
      "Horizontal Bar Chart": makePlotlyChart({
        type: 'bar',
        orientation: 'h'
      }, {
        barmode: 'group'
      }, true),
      "Horizontal Stacked Bar Chart": makePlotlyChart({
        type: 'bar',
        orientation: 'h'
      }, {
        barmode: 'relative'
      }, true),
      "Bar Chart": makePlotlyChart({
        type: 'bar'
      }, {
        barmode: 'group'
      }),
      "Stacked Bar Chart": makePlotlyChart({
        type: 'bar'
      }, {
        barmode: 'relative'
      }),

      "Line Chart": makePlotlyChart(),
      "Area Chart": makePlotlyChart({
        stackgroup: 1
      }),

      "Histogram Chart": makePlotlyChart({
        type: 'histogram',
        histnorm :  'count'
      }),
      "Accum. histogram Chart": makePlotlyChart({
        type: 'histogram',
        cum: true,
        histnorm : 'count'
      }),       
      "Histogram Chart %": makePlotlyChart({
        type: 'histogram',
        histnorm : 'percent'
      }),     
      "Accum. histogram Chart %": makePlotlyChart({
        type: 'histogram',
        cum: true,
        histnorm : 'percent'
      }),
      "Duration curve": makePlotlyChart({
        type: 'duration',
        normByCount: true
      }),
      "Duration curve %": makePlotlyChart({
        type: 'duration'
      }),
      "Scatter Chart": makePlotlyScatterChart(),
      'Multiple Pie Chart': makePlotlyChart({
        type: 'pie',
        scalegroup: 1,
        hoverinfo: 'label+value',
        textinfo: 'none'
      }, {}, true)
    };
  });

}).call(this);

//# sourceMappingURL=plotly_renderers.js.map
