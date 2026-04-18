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
        Plotly.Icons.xLog = {
          'width': 48,
          'height': 48,
          'path': 'M19.6,13.2a2.1,2.1,0,0,0-.2-2.7l-6-5.9a1.9,1.9,0,0,0-2.8,0l-6,5.9a2.1,2.1,0,0,0-.2,2.7,1.9,1.9,0,0,0,3,.2L10,10.8V42a2,2,0,0,0,4,0V10.8l2.6,2.6A1.9,1.9,0,0,0,19.6,13.2Z M22,40H20a2,2,0,0,0,0,4h2a2,2,0,0,0,0-4Z M32,40H30a2,2,0,0,0,0,4h2a2,2,0,0,0,0-4Z M42,40H40a2,2,0,0,0,0,4h2a2,2,0,0,0,0-4Z'
        }
        Plotly.Icons.yLog = {
          'width': 48,
          'height': 48,
          'path': 'M43.4,34.6l-5.9-6a2.1,2.1,0,0,0-2.7-.2,1.9,1.9,0,0,0-.2,3L37.2,34H6a2,2,0,0,0,0,4H37.2l-2.6,2.6a1.9,1.9,0,0,0,.2,3,2.1,2.1,0,0,0,2.7-.2l5.9-6A1.9,1.9,0,0,0,43.4,34.6Z M6,30a2,2,0,0,0,2-2V26a2,2,0,0,0-4,0v2A2,2,0,0,0,6,30Z M6,20a2,2,0,0,0,2-2V16a2,2,0,0,0-4,0v2A2,2,0,0,0,6,20Z M6,10A2,2,0,0,0,8,8V6A2,2,0,0,0,4,6V8A2,2,0,0,0,6,10Z'
        }        
        defaults = {
          localeStrings: {
            vs: "vs",
            by: "by"
          },
          plotly: {},
          plotlyConfig: { scrollZoom: true, displaylogo: false,
            modeBarButtonsToRemove: ['_toImage','_zoom2d', '_pan2d', 'select2d', 'lasso2d', 'zoomIn2d', 'zoomOut2d', '_autoScale2d', 'resetScale2d'],
            modeBarButtonsToAdd: [
              {
                name: 'X: linear / log / date',
                icon: Plotly.Icons.xLog,
                direction: 'up',
                click: function(gd) {
                  Plotly.relayout(gd,{'xaxis.type': (gd.layout.xaxis.type =='date') ? 'linear' : (gd.layout.xaxis.type =='linear' ? 'log' :'date') })
              }},              
              {
                name: 'Y: linear / log / date',
                icon: Plotly.Icons.yLog,
                direction: 'up',
                click: function(gd) {
                  Plotly.relayout(gd,{'yaxis.type': (gd.layout.yaxis.type =='date') ? 'linear' : (gd.layout.yaxis.type =='linear' ? 'log' :'date') })
              }},                         
              {
                name: 'line or marker',
                // icon: Plotly.Icons.xLog, //Plotly.Icons.pencil,
                direction: 'up',
                click: function(gd) {
                  let _mode = gd.data[0].mode||'lines'                  
                  if (_mode == 'markers') {
                    _mode = 'lines+markers'
                  } else if (_mode == 'lines') {
                    _mode = 'markers'
                  } else if (_mode == 'lines+markers') {
                    _mode = 'lines'                      
                  }
                  Plotly.update(gd,{'mode': _mode, 'line.width': 1,'marker.size': 3})
              }},              
            ]
          }
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
        layout = {                                                          // #1 of 3, layout common
          title: titleText,
          hovermode: 'x', //'closest',
          width: window.innerWidth / 1.4,
          height: window.innerHeight / 1.4 + 50,
          xaxis : {
            title: transpose ? fullAggName : null,
            automargin: true,
            'showgrid': true,
            // 'type': 'date',
            'zeroline': false            
          },
          yaxis : {
            title: transpose ? null : fullAggName,
            automargin: true,
            // 'zeroline': false
            // 'showgrid': false,
          },
          yaxis2 : {
            title: transpose ? null : fullAggName,
            automargin: true,
            overlaying: 'y',
            side: 'right'
          },
          legend: {
            x:1.05, //yanchor:'top',
            font: {
              family: 'Arial Narrow, sans-serif',
              // size: 11,
              color: 'blue'
            }
          }          
        };

        if (traceOptions.type === "Parallel Coordinates") {                 // mhu #2 of 3, data
          // let dims = [...(pivotData.rowAttrs||[]), ...(pivotData.columnAttrs||[])]
          data = [{
            type: 'parcoords',
            line: {
              color: 'blue'
            },
            dimensions: pivotData.rowAttrs.map(k => {   //dims
              // var vv = pivotData.rowKeys.map(v => v.join('|'))
              var strVal = spa.dataPC.map(v => v[k])
              if (spa.dataPC.some(d => isNaN(parseFloat(d[k])) && !['', NaN, 'NaN', 'NA'].includes(d[k]))) {   //mhu string
                var strV = [... new Set(strVal)]
                var strKey = {}
                strV.forEach((v, i) => strKey[v] = i)
                return {
                  label: k,
                  tickvals: strV.map((v, i) => i),
                  ticktext: strV,
                  values: strVal.map(v => strKey[v])
                }
              } else {
                return {
                  label: k,
                  values: strVal
                }
              }
            })
          }]
          layout.title = 'Parallel Coordinates'
        } else if (traceOptions.type === "barErr") {                        // mhu xy
          var ct = trsp(pivotData.colKeys).map(v => [...new Set(v)].length)
          var xx = pivotData.colKeys.map(v => v.filter((i,x) => ct[x] > 1 )).map(v => v.join('|').replaceAll('-',''))
          var grp = new Set(pivotData.rowKeys.map(v => v.slice(0,-1).join()))
          var data_ = traceKeys.map(function(traceKey) {                           // y-value based on other trace(s)         
            var datumKey, j, labels, len, trace, val, values;
            values = [];
            for (j = 0, len = datumKeys.length; j < len; j++) {
              datumKey = datumKeys[j];
              val = parseFloat(pivotData.getAggregator(traceKey, datumKey).value());
              values.push(isFinite(val) ? val : null);
            }
            return values;
          })
          if (grp.length ==0) grp = ['']
          data=[]
          grp.forEach(g => {
            var data3 = data_.filter((v,i) => pivotData.rowKeys[i].slice(0,-1).join()==g)
            var ord0 = data3.map(v => d3.sum(v))
            var idx
            if (ord0.length > 2) {
              idx = [mmIdx(ord0),mdIdx(ord0)]
            } else if (ord0.length == 1) {
              idx = [[0,0],[0]]
            } else if (ord0.length == 2) {
              idx = [[1,0],[0]]
            }
            var trace2 = {
              x: xx,
              y: data3[idx[1]],
              name:  g+' ',
              error_y: {
                type: 'data',
                array: data3[idx[0][1]].map((v,i) => v-data3[idx[1]][i]),
                arrayminus:  data3[idx[0][0]].map((v,i) => data3[idx[1]][i]-v),
                visible: true
              },
              type: traceOptions.type0
            };
            data.push(trace2);            
          })
          layout.barmode = 'group';
        } else if (traceOptions.type === "scatter") {                       // mhu xy
          var xx, labels, datumKey
          xx = []
          labels = [];
          for (j = 0, len = datumKeys.length; j < len; j++) {
            datumKey = datumKeys[j];
            val = parseFloat(pivotData.getAggregator(traceKeys[0], datumKey).value()); // xx based on 1st trace
            xx.push(isFinite(val) ? val : null);
            labels.push(datumKey.join('-') || ' ');
          }          
          data = traceKeys.slice(1).map(function(traceKey) {                           // y-value based on other trace(s)         
            var datumKey, j, labels, len, trace, val, values;
            values = [];
            labels = [];
            for (j = 0, len = datumKeys.length; j < len; j++) {
              datumKey = datumKeys[j];
              val = parseFloat(pivotData.getAggregator(traceKey, datumKey).value());
              values.push(isFinite(val) ? val : null);
              labels.push(datumKey.join('-') || ' ');
            }
            trace = {
              name: traceKey.join('-') + ' / ' + traceKeys[0],  //|| fullAggName,
              type: 'scatter',
              mode: 'markers',
              showlegend: true
            };
              trace.x = xx;
              trace.y = values;
              trace.text = labels;
            return $.extend(trace, traceOptions);
          });          
        } else if (traceOptions.type === "timeline") {                      // mhu time-line
          // traceOptions.type = 'scatter'
          // pivotData.rowKeys, pivotData.colAttrs, pivotData.rowAttrs, spa.dataPC (filted data)
          data = []
          let nGrp = pivotData.rowKeys.length
          pivotData.rowKeys.forEach((grp,i) => {
            spa.dataPC.filter(r =>  pivotData.rowAttrs.map(k => r[k]).join('|') ==  grp.join('|')).forEach(r1 => {
              data.push({
                'type': 'scatter',
                'marker': {
                  // 'color': 'red', 
                  'line': {'width': 1},
                  'size': Math.max(5,10 * 10/nGrp),
                  'opacity': 0.8,
                  'symbol': 'bowtie'
                },
                'line': {'width': 20*25/nGrp},
                'opacity':0.75,
                'name':  grp.join('|') ,
                'text': pivotData.colAttrs.slice(2).map(k1 => r1[k1]).join('<br>'),
                'showlegend': false,
                'x': pivotData.colAttrs.slice(0,2).map(k1 => (typeof(r1[k1]) == 'number') ? r1[k1] :new Date(r1[k1])),
                'y': Array(2).fill(i + 0.1*(Math.random()-0.5))            
              })
            })
          })
          let lenTick = pivotData.rowKeys.reduce((a,v,i) => a=Math.max(a, v.join('').length),0)
          layout = {
            ...layout, ...{
               // 'showlegend': true,
              'title': {
                'text': 'Gantt Chart (Time-line) by [' + pivotData.rowAttrs +']'
              },
              'xaxis': {
                // 'side': 'top',
                'tickfont' : {'size': 15, 'color':'blue'},
                'gridwidth': 5,
                // "rangeslider": {},
                'automargin': true, 'title': {standoff: 300}, 'showspikes': true, 'spikemode': 'across'                


              },              
              'yaxis': {
                'tickfont' : {'color':'blue'},
                'gridwidth': 20*22/nGrp, 'zerolinewidth':20*20/nGrp, 'zerolinecolor': '#EEEEEE',
                // 'autorange': false,
                // 'range': [-1, 4],
                // 'side': 'right',
                // 'automargin': true,
                // 'pad':20,
                'ticktext': pivotData.rowKeys.map(v => v.join('; ').slice(0,75)),
                'tickvals': pivotData.rowKeys.map((v,i) => i),
                'tickangle': 30,
                // 'autoshift':'free'
                // 'ticklabeloverflow':'allow',
                // 'ticklabelposition': 'inside top',
                // 'ticklabelstandoff': '-100'
              },
              margin: {
                l: Math.max(80, Math.min(400, lenTick*500/75)),   // Left margin (in pixels)
                r: 10,   // Right margin
                t: 80,   // Top margin
                b: 10   // Bottom margin
              }
            }
          }
        } else if (traceOptions.type === "waterfall") {                     // mhu waterfall
          // traceOptions.type = 'waterfall'
          // pivotData.rowKeys, pivotData.colKeys, 
          // pivotData.rowAttrs, pivotData.colAttrs
          // spa.dataPC (filted data)
          // pivotData.getAggregator(pivotData.getRowKeys()[0], pivotData.getColKeys()[0]).value()
          if (1 == 1) {   // with pre-processing 
            data = []
            if (pivotData.colKeys[0].slice(-1)[0].includes(',')) { ///
              var mix = 1
              var dataWF1 = pivotData.colKeys.map(v => [... v.slice(0,-1), ...v.slice(-1)[0].split(',')])
              var idxMsr = dataWF1.find(v1 => v1.indexOf('relative') >=0).indexOf('relative')// idx for measure
              dataWF = pivotData.colKeys.filter((v,i) =>dataWF1[i][idxMsr-1])   
              dataWF1 = dataWF1.filter(v => v[idxMsr-1])  // sort by order before measure
              dataWF1 = dataWF1.sort((a,b) => (a.slice(0,idxMsr-2).join('_')+(100+ +a[idxMsr-1])).localeCompare(b.slice(0,idxMsr-2).join('_') + (100+ +b[idxMsr-1]).toString()))
              dataWF = dataWF.sort((a1,b1) => {
                a = [... a1.slice(0,-1), ...a1.slice(-1)[0].split(',')]
                b = [... b1.slice(0,-1), ...b1.slice(-1)[0].split(',')]
                return (a.slice(0,idxMsr-2).join('_')+(100+ +a[idxMsr-1])).localeCompare(b.slice(0,idxMsr-2).join('_') + (100+ +b[idxMsr-1]).toString())
              })
              if (dataWF1[0].length > 5) { // more columns for group
                let nGrp = dataWF1[0].length -5 + 1 
                var dataWF_ = dataWF1.map(v => [v.slice(0, nGrp), ...v.slice(idxMsr-2)])
                dataWF_ = dataWF_[0].map((v,i) => dataWF_.map(v => v[i]))
              } else {                    // one column for group
                dataWF_ = dataWF1[0].map((v,i) => dataWF1.map(v => v[i]))
              }
            } else {
              var idxMsr = pivotData.colKeys[0].map((v,i) => pivotData.colKeys.map(v1 => v1[i])).reduce((a,v,i) => a = v.includes('absolute')? i: a, '__') // idx for measure
              var dataWF = pivotData.colKeys.filter(v => v[idxMsr-1])  // sort by order before measure   
              dataWF = dataWF.sort((a,b) => (a.slice(0,idxMsr-2).join('_')+(100+ +a[idxMsr-1])).localeCompare(b.slice(0,idxMsr-2).join('_') + (100+ +b[idxMsr-1]).toString()))
              if (dataWF[0].length > 5) { // more columns for group
                let nGrp = dataWF[0].length -5 + 1 
                var dataWF_ = dataWF.map(v => [v.slice(0, nGrp), ...v.slice(idxMsr-2)])
                dataWF_ = dataWF_[0].map((v,i) => dataWF_.map(v => v[i]))
              } else {                    // one column for group
                dataWF_ = dataWF[0].map((v,i) => dataWF.map(v => v[i]))
              }
            }
            data = [
              {
                type: "waterfall",
                x: dataWF_.slice(0,2),
                measure: dataWF_[3],
                y: dataWF.map(v => pivotData.getAggregator(pivotData.getRowKeys()[0], v).value()  * (mix? +v[v.length-1].split(',').slice(-1)[0] : +v.slice(-1)[0])),
                // base: 300,
                decreasing: { marker: { color: "lightred", line: { color: "black", width: 1 } } },
                increasing: { marker: { color: "lightgreen"  ,  line: { color: "black", width: 1 }}},
                totals: { marker: { color: "deep sky blue", line: { color: 'blue', width: 2 } } }
              }];            
              layout = { ... layout, ...{
                title: {
                  text: "Waterfall of [" + pivotData.colAttrs[idxMsr-2] + "] by [" + pivotData.colAttrs.slice(0,idxMsr-2).join(' | ') +']'
                },
                waterfallgap: 0.3,
                xaxis: {
                  // title: pivotData.colAttrs.slice(0,idxMsr-1).join(' / ') + ' | ' + pivotData.rowAttrs.join(' / '),
                  tickfont: { size: 12 },
                  ticks: "outside"
                },
                margin: {
                  // l: Math.max(80, Math.min(400, lenTick*500/75)),   // Left margin (in pixels)
                  // r: 10,   // Right margin
                  // t: 80,   // Top margin
                  b: 200   // Bottom margin
                }
              }}
          } else {         // standard format for testing
            data = [
              {
                type: "waterfall",
                x: [
                ["2016", "2017", "2017", "2017", "2017", "2018", "2018", "2018", "2018"],
                ["initial", "q1", "q2", "q3", "total", "q1", "q2", "q3", "total"]
                ],
                measure: ["absolute", "relative", "relative", "relative", "total", "relative", "relative", "relative", "total"],
                y: [10, 20, 30, -10, null, 10, 20, -40, null],
                base: 300,
                decreasing: { marker: { color: "Maroon", line: { color: "red", width: 2 } } },
                increasing: { marker: { color: "Teal" } },
                totals: { marker: { color: "deep sky blue", line: { color: 'blue', width: 3 } } }
              }];          
            layout = { ... layout, ...{
              title: {
                text: "Profit and loss statement"
              },
              waterfallgap: 0.1,
              xaxis: {
                title: "vvv",
                tickfont: { size: 15 },
                ticks: "outside"
              }
            }}
          }
        } else if (traceOptions.type === "sankey") {                        // mhu sankey
          data = []
          var _source = pivotData.rowKeys.map(v => [v[0],v[2]? v[2] : ''])
          var _target = pivotData.rowKeys.map(v => [v[1],v[3]? v[3] : ''])
          var _link   = pivotData.rowKeys.map(v => v[4] ? v[4] : ",...")
          var _linkLabel = _link.map(v => v.split(',')[1])
          var _linkColor = _link.map(v => {
            let color = v.split(',')[0]
            color = color ? (color.includes('rgb') ? color : 'rgba('+ getRgbFromColorName(color).join(',') + ',0.4)') : 'rgba(100,100,100,0.3)'
            return color
          })
          // var _value = pivotData.rowKeys.map(v => v[2])
          var _value = pivotData.getRowKeys().map(v => pivotData.getAggregator(v,[]).value())
          var _label = [...new Set([..._source.map(v => v[0]), ..._target.map(v => v[0])])]
          var _att = _label.map(v=> [..._source, ..._target].find(v1 => v1[0]==v && v1[1].length > 0))
          var _color = _att.map(v => v? v[1].split(',')[0] : 'lightgreen').map(v => v? v : 'lightgreen')
          var _x = _att.map(v => v? +v[1].split(',')[1] : 0).map(v => v? v : 0)
          var _y = _att.map(v => v? +v[1].split(',')[2] : 0).map(v => v? v : 0)
          // re-order: at begining if x > 0
          _label = [..._label.filter((v,i) => _x[i] > 0), ..._label.filter((v,i) => _x[i] == 0)]
          _color = [..._color.filter((v,i) => _x[i] > 0), ..._color.filter((v,i) => _x[i] == 0)]
          _y = [..._y.filter((v,i) => _x[i] > 0), ..._y.filter((v,i) => _x[i] == 0)]
          _x = [..._x.filter((v,i) => _x[i] > 0), ..._x.filter((v,i) => _x[i] == 0)]
          _source = _source.map(v => _label.indexOf(v[0]))
          _target = _target.map(v => _label.indexOf(v[0]))
          align = 'left'
          data = [{
            type: "sankey",
            domain: {
              x: [0,1],
              y: [0,1]
            },
            node: {
              pad: 15,
              thickness: 15,
              line: {
                color: "black",
                width: 1
              },
              label: _label,
              color: _color,
              x: _x,
              y: _y,
              align: 'left',
              hovertemplate: " "
            },
            link: {
              source: _source,
              target: _target,
              value: _value,
              label: _linkLabel,
              color: _linkColor
            }
          }]
          data[0] = {... data[0], ...pivotData.traceStyleData}       
          layout = {
            ...layout, ...{
              title: {
                text: "Sankey Diagram"
              },
              font:{
                size:12,
                color:'blue'
              },

              margin: {
                // l: Math.max(80, Math.min(400, lenTick*500/75)),   // Left margin (in pixels)
                // r: 10,   // Right margin
                // t: 80,   // Top margin
                b: 50   // Bottom margin
              }
            }
          }    
        } else if (['box','violin'].includes(traceOptions.type) ) {    
          data = pivotData.rowKeys.map((rKey, i) => {
            let datai = spa.dataPC.filter(v => pivotData.rowAttrs.map(k => v[k]).join(' ') ==  pivotData.rowKeys[i].join(' '))
            return {
            type: traceOptions.type,
            name:rKey.join('_'),
            x: datai.map(v => pivotData.colAttrs.map(k => v[k]).join(' ')),
            y: datai.map(v => v[pivotData.valAttrs[0]]),
            boxpoints: false,  //all, outliers
            // jitter: 0.5,
            // pointpos: -1.8
            }
          });
          layout.boxmode = 'group'
          layout.violinmode = 'group'
        } else {                                                            // other:  mix-type of chart, overwrite by _traceStyleData ... & original data code
          var aggVals =[];                                                  //  mhu adding aggregation line
          data = traceKeys.map(function (traceKey, i) {                           // trace loop
            var datumKey, j, labels, len, trace, val, values;
            var labels1 = []
            values = [];
            labels = [];
            for (j = 0, len = datumKeys.length; j < len; j++) {                // loop through all datum keys
              datumKey = datumKeys[j];
              val = parseFloat(pivotData.getAggregator(transpose ? datumKey : traceKey, transpose ? traceKey : datumKey).value());
              values.push(isFinite(val) ? val : null);
              if (traceKeys.length > 1 && i === 0 && document.getElementById('showTotal').checked) {     //  mhu adding aggregation line
                val = parseFloat(pivotData.getAggregator(transpose ? datumKey : [], transpose ? [] : datumKey).value());
                aggVals.push(isFinite(val) ? val : null);
              }              
              try {
                if (datumKey[0].match(/^\d{4}-\d{2}-\d{2}/)) {                 // date format
                  labels.push(datumKey[0])
                  labels1.push(datumKey.slice(1).join('<br>') || ' ')          // join other colAttrs
                } else {
                  labels.push(datumKey.join('<br>') || ' ');                   // join all colAttrs
                }
              } catch {
                labels.push(datumKey.join('<br>') || ' ');
              }       
            }
            trace = {
              name: traceKey.join('-') || fullAggName
            };

            if (traceOptions.type === "pie") {
              trace.values = values;
              trace.labels = labels.length > 1 ? labels : [fullAggName];
            } else if (traceOptions.type === "histogram") {
              trace.x = transpose ? values : values;
              var binSize = (Math.max(...values) - Math.min(...values)) / 50
              var sizeOrd = Math.floor(Math.log10(binSize))
              var binInt = binSize / 50 ** sizeOrd
              var intList = [1, 2, 5]
              var intList1 = intList.map(v => Math.abs(binInt - v))
              binInt = intList[intList1.indexOf(Math.min(...intList1))]
              trace.xbins = { size: binInt * 10 ** sizeOrd }
              trace.cumulative = { enabled: traceOptions.cum }
              trace.histnorm = traceOptions.histnorm//'percent'
            } else if (traceOptions.type === "duration") {
              let combined = values.map((value, index) => {                                         // sorting labels
                return { value: value, element: labels[index] };
              });     
              combined = combined.filter(v => v.value !== null) 
              values = combined.map(v => v.value)
              // values = values.filter(v => v !== null)  // partision by trace
              var lll = values.length   
              trace.text = combined.sort((x, y) => x.value - y.value).map(item => item.element);    // sorting labels    
              if (lll <= 1000) {
                trace.y = values.sort(function (a, b) { return a - b });
                if (traceOptions.normByCount) {
                  trace.x = values.map((v, i) => lll - (i + 1))
                } else {
                  trace.x = values.map((v, i) => 100 - 100 * (i + 1) / lll)
                }
                trace.line = { shape: 'hv' }
              } else {
                values.sort(function (a, b) { return a - b });
                if (traceOptions.normByCount) {
                  trace.y = values //.sort(function (a, b) { return a - b });
                  trace.x = values.map((v, i) => lll - (i + 1))
                } else {
                  var idx = [...Array(1001).keys()]
                  idx = idx.map(i => Math.round(i * (lll - 1) / 1000))
                  trace.x = idx.map(v => 100 - 100 * (v + 1) / lll)
                  trace.y = idx.map(v => values[v])
                  trace.text = idx.map(v => trace.text[v])
                }
                // trace.line = {shape: 'hv'}
              }
            } else if (traceOptions.type === "Acc Line Chart") {
              let acc = 0
              trace.x = transpose ? values.map((v) => acc += v) : labels;
              trace.y = transpose ? labels : values.map((v) => acc += v);
              trace.text = labels1;
            } else {                                                        // #### original data code; data adjest for mix-type of chart ... overwrite by _traceStyleData
              trace.x = transpose ? values : labels;
              trace.y = transpose ? labels : values;
              trace.text = labels1;
              try {                                                         // mhu: 2nd Y axis 
                if (spa.cfg?.chtOpt?.Y2) {                                     // mhu: 2nd Y axis  
                  if (spa.cfg.chtOpt.Y2[0] == '___') {                        // mhu: 2nd Y axis by value
                    if (Math.max(...trace.y) >= spa.cfg.chtOpt.Y2[1]) {
                      trace.yaxis = 'y2'
                      trace.name = 'y2_' + trace.name
                      trace.line = { ...traceOptions?.line, dash: 'dot', width: 3 }
                    } else {
                      trace.name = 'y1_' + trace.name
                      trace.line = traceOptions?.line
                    }
                  } else {                                                    // mhu: 2nd Y axis by trace name / idx
                    var idxAttrs = pivotData.rowAttrs.indexOf(spa.cfg.chtOpt.Y2[0])
                    if (idxAttrs >= 0) {
                      var y2Labels = spa.cfg.chtOpt?.Y2[1].map(v => typeof (v) == 'string' ? v : pivotData.rowKeys[v][idxAttrs])
                      var idxY2 = Math.max(...y2Labels.map((v, i) => (v[0] == '^' ? !traceKey[idxAttrs].includes(v.slice(1)) : traceKey[idxAttrs].includes(v)) ? i : -1))
                      if (idxY2 >= 0) {
                        trace.yaxis = 'y2'
                        trace.name = '_' + trace.name
                        trace.line = { ...traceOptions?.line, dash: 'dot', width: 3 }
                      } else {
                        trace.name = '' + trace.name
                        trace.line = traceOptions?.line
                      }
                    }
                  }
                }
              } catch (err) { alert('Y2 ... ' + err) }
              try {                                                         // mhu: mixed Line & Bar
                if (spa.cfg?.chtOpt?.bar) {                                  // mhu: mixed Line & Bar
                  var idxAttrs = pivotData.rowAttrs.indexOf(spa.cfg.chtOpt.bar[0])
                  if (idxAttrs >= 0) {
                    var barLabels = spa.cfg.chtOpt?.bar[1].map(v => typeof (v) == 'string' ? v : pivotData.rowKeys[v][idxAttrs])
                    var idxBar = Math.max(...barLabels.map((v, i) => traceKey[idxAttrs].includes(v) ? i : -1))             // the next one has the exclusion logic ^
                    // var idxBar = Math.max( ...barLabels.map((v,i) => (v[0]=='^' ? !traceKey[idxAttrs].includes(v.slice(1)) : traceKey[idxAttrs].includes(v) )? i : -1))
                    if (idxBar >= 0) {
                      trace.type = 'bar'
                      trace.marker = {
                        opacity: 0.5,
                        line: {
                          color: 'rgb(8,48,107)',
                          width: 1,
                        }
                      }
                    }
                  }
                }
              } catch (err) { alert('Bar ... ' + err) }
              try {                                                         // mhu: stack / area
                if (spa.cfg?.chtOpt?.stack) {                                  // mhu: stack
                  var idxAttrs = pivotData.rowAttrs.indexOf(spa.cfg.chtOpt.stack[0])
                  if (idxAttrs >= 0) {
                    var stackLabels = spa.cfg.chtOpt?.stack[1].map(v => typeof(v) == 'string' ? v : pivotData.rowKeys[v][idxAttrs])
                    var idxStack = Math.max( ...stackLabels.map((v,i) => traceKey[idxAttrs].includes(v) ? i : -1))
                    if (idxStack >=0) {
                      trace.type = 'scatter'
                      trace.stackgroup = spa.cfg.chtOpt?.stack[2][idxStack]
                      trace.fillcolor = 'rgba(0,0,0,0.05)'
                      trace.mode = 'lines'  //'lines+markers'
                      // trace.marker = {size: 3, opacity:0.8}
                      trace.line = {... trace.line, width:1}
                    }                   
                  }
                }   
              } catch (err) { alert('Stack ... ' + err) }
              trace = {... trace, ...pivotData.traceStyleData};
            }
            // if (trace.line && traceOptions.line) traceOptions.line = {...trace.line, ... traceOptions.line} // mhu line option 
            return $.extend(trace, spa.cfg?.chtOpt?.Y2 ? {} : traceOptions);
          });
          if (aggVals.length > 0) {               // mhu adding aggregation line
            var aggTrace = {
              name: 'AGG',
              // type: 'scatter',
              // mode: 'lines',
              x: data[0].x,
              y: aggVals,
              line: {
                color: 'rgba(0,0,0,0.3)',
                width: 8,
                dash: 'dot'
              }
            };
            data.push(aggTrace);
          }
        }                                                                   // ##### original data code end
        if (!["timeline",'sankey','waterfall'].includes(traceOptions.type)) {                              // Buttons & Slider
          if (!spa.cfg?.chtOpt?.['-updatemenus']) {
            layout['updatemenus'] = [{                                         // ... button_menu 
              pad: { t: -10, r: 0 },
              type: 'buttons',
              xanchor: 'left',
              yanchor: 'top',
              x: -0.05,
              y: 1.2,
              direction: 'right',
              buttons: [{
                label: 'linear / log',
                method: 'relayout',
                args: ['yaxis.type', 'linear'],
                args2: ['yaxis.type', 'log']
              }]
            }]            
          }
          if (!spa.cfg?.chtOpt?.['-slide']) {
            if (data[0].y) {                                                   // ... slider
              var normalBase = data.map(v => { return { value: 1, max: d3.max(v.y), mean: d3.mean(v.y) } })
              layout['sliders'] = [{                                             // 4.5.* slider for Y axis
                pad: { t: -10, right: 10 },
                len: 0.12,
                xanchor: 'left',
                x: 0.05,
                y: 1.25,
                bgcolor: "rgba(0,0,255,0.5)",
                ticklen: 0,
                currentvalue: {
                  xanchor: 'right',
                  prefix: 'Normalize: ',
                  font: {
                    color: 'blue',
                    size: 13
                  }
                },
                active: 0,
                steps: [{
                  label: 'raw',
                  method: 'Plotly.update',
                  args: ['y', data.map((v, i) => v['y'])]
                }, {
                  //   label: normalBase.map(v => v.value).toLocaleString(),
                  //   method: 'Plotly.update',
                  //   args: ['y', data.map((v, i) => v['y'].map(v1 => v1 / normalBase[i].value))]
                  // }, {
                  label: 'max',
                  method: 'Plotly.update',
                  args: ['y', data.map((v, i) => v['y'].map(v1 => v1 / normalBase[i].max))]
                }, {
                  label: 'avg',
                  method: 'Plotly.update',
                  args: ['y', data.map((v, i) => v['y'].map(v1 => v1 / normalBase[i].mean))]
                  // }, {
                  //   label: 'd',
                  //   method: 'relayout',
                  //   args: ['xaxis.type', 'date']
                }]
              }]
            }
          }
        }
        if (traceOptions.type === 'pie') {                                  // #3 of 3 ... layout by type
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
        } else {                                                            // ... default line chart
          // layout.xaxis = {
          //   title: transpose ? fullAggName : null,
          //   automargin: true
          // };
          // layout.yaxis = {
          //   title: transpose ? null : fullAggName,
          //   automargin: true
          // };
        }
        result = $("<div>").appendTo($("body"));
        if (spa.cfg?.chtOpt?.barmode) layout.barmode = spa.cfg.chtOpt.barmode  // group, overlay, stack, relative
        layout = { ...layout, ...spa.cfg?.chtOpt?.layout};
        if (spa.bf_newPlot) {
          if (spa.bf_newPlot.data) data = spa.bf_newPlot.data(data)
          if (spa.bf_newPlot.layout) layout = spa.bf_newPlot.layout(layout, data)
        }
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
          plotlyConfig: { scrollZoom: true, modeBarButtonsToRemove: ['toImage']}
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
        if (colKeys[0].length == 1) {    // oringinal code
          data = {
            x: [],
            y: [],
            text: [],
            type: 'scatter',
            mode: 'markers',
            marker: { size: 5 }
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
          data = [data]
        } else {                       // mhu version
          var data0 = {}
          var traceName = [... new Set(colKeys.map(v => v[1]))]
          traceName.forEach(v => {
            data0[v] = {
              x: [],
              y: [],
              name: v,
              text: [],
              type: 'scatter',
              mode: 'markers',
              marker: { size: 5 }
            }
          })    
          for (j = 0, len = rowKeys.length; j < len; j++) {
            rowKey = rowKeys[j];
            for (k = 0, len1 = colKeys.length; k < len1; k++) {
              colKey = colKeys[k];
              v = pivotData.getAggregator(rowKey, colKey).value();
              if (v != null) {
                data0[colKey[1]].x.push(colKey[0]);
                data0[colKey[1]].y.push(rowKey.join('-'));
                data0[colKey[1]].text.push(v);
              }
            }
          }          
          data = Object.values(data0)
        }
        layout = {
          title: pivotData.rowAttrs.join("-") + ' vs ' + pivotData.colAttrs.join("-"),
          hovermode: 'x', // 'closest',
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
        Plotly.newPlot(result[0], data, $.extend(layout, opts.plotly), opts.plotlyConfig);
        result.detach();
        renderArea.remove();
        return result;
      };
    };
    return $.pivotUtilities.plotly_renderers = {                            // #1 of 3, entry | trigger
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
      "Bar...": makePlotlyChart({                                  // mhu bar error
        type: 'barErr',type0:'bar'
        
      }),      
      "Line...": makePlotlyChart({                                  // mhu bar error
        type: 'barErr',type0:'line'
        
      }),      
      "Line Chart": makePlotlyChart(),
      "Line Chart hv": makePlotlyChart({                                  // mhu
        line: {shape: 'hv'}
      }),   
      "Acc Line Chart": makePlotlyChart({                                 // mhu
        type:"Acc Line Chart",
        line: {shape: 'hv'}
      }),    
      "xy": makePlotlyChart({                                             // mhu
        type:"scatter",
      }),            
      "Area Chart": makePlotlyChart({
        stackgroup: 1
      }),
      "Gantt Chart": makePlotlyChart({                                      // mhu
        type: "timeline"
      }),
      "Waterfall": makePlotlyChart({                                      // mhu
        type: "waterfall"
      }),      
      "Sankey": makePlotlyChart({                                      // mhu
        type: "sankey"
      }),        
      "Histogram Chart": makePlotlyChart({
        type: 'histogram',
        histnorm :  'count'
      }),
      "Accum. histogram Chart": makePlotlyChart({                         // mhu
        type: 'histogram',
        cum: true,
        histnorm : 'count'
      }),       
      "Histogram Chart %": makePlotlyChart({                              // mhu
        type: 'histogram',
        histnorm : 'percent'
      }),     
      "Accum. histogram Chart %": makePlotlyChart({                       // mhu
        type: 'histogram',
        cum: true,
        histnorm : 'percent'
      }),
      "Duration curve": makePlotlyChart({                                 // mhu
        type: 'duration',
        normByCount: true
      }),
      "Duration curve %": makePlotlyChart({                               // mhu
        type: 'duration'
      }),
      "Box Plot": makePlotlyChart({                               // mhu
        type: 'box'
      }),
      "Violin Plot": makePlotlyChart({                               // mhu
        type: 'violin'
      }),     
      "Parallel Coordinates": makePlotlyChart({                           // #1 of 3, entry | trigger
        type: 'Parallel Coordinates'
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
// modeBarButtonsToRemove: ['toImage']