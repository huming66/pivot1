(function() {
    var callWithJQuery;
  
    callWithJQuery = function(pivotModule) {
      if (typeof exports === "object" && typeof module === "object") {
        return pivotModule(require("jquery"));
      } else if (typeof define === "function" && define.amd) {
        return define(["jquery"], pivotModule);
      } else {
        return pivotModule(jQuery);
      }
    };
  
    callWithJQuery(function ($) {
        return $.pivotUtilities.leaflet_renderers = {
            "map": function (pivotData, opts) {
                if ($('#mpid').length == 0) {                                               // 1 setup map if not already setup
                    mapLayer = [
                        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', // satellite
                        'https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png',                                 // openstreet
                        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'                                               // openstreet
                    ]
                    let osm = L.tileLayer(mapLayer[2], {
                        maxZoom: 18,
                        tileSize: 512,
                        zoomOffset: -1,
                    }).setOpacity(0.5)
                    let sat = L.tileLayer(mapLayer[0], {
                        maxZoom: 18,
                        tileSize: 512,
                        zoomOffset: -1
                    }).setOpacity(0.5)
                    let baseMaps = {
                        "OpenStreetMap": osm,
                        "Satellite": sat
                    };
                    // $("#mpid").remove()
                    $("<div>").attr("id", "mpid").height(1000).appendTo($("body"));
                    spa.map = L.map('mpid', {
                        maxZoom: 18,
                        tileSize: 512,
                        zoomOffset: -1,
                        zoom: 6,
                        // zoomControl: false,
                        wheelPxPerZoomLevel: 600, wheelDebounceTime: 80,
                        zoomSnap: 0.1, zoomDelta: 0.1,
                        layers: [osm]

                    }).setView([52.0, -114.6], 4);
                    // L.control.zoom({
                    //     position: 'topright'
                    // }).addTo(spa.map);
                    L.control.scale({
                        position: 'topright', // Positions: 'topleft', 'topright', 'bottomleft', 'bottomright'
                        metric: true,           // Shows kilometres/metres
                        imperial: false          // Shows miles/feet
                    }).addTo(spa.map);
                    var layerControl = L.control.layers(baseMaps, null, { position: 'topleft' }).addTo(spa.map)
                    // var container = layerControl.getContainer();
                    // container.style.display = 'inline-block';
                    // container.style.float = 'left';
                    spa.map.setZoom(6)
                    spa.leaflet = {
                        layout: {
                            Point: {
                                color: 'red',
                                fillColor: '#f03',
                                fillOpacity: 0.3,
                                opacity: 0.5,
                                weight: 10,
                                // radius: 10                        
                            },
                            LineString: {
                                color: 'black',
                                weight: 3,
                                opacity: 0.7,
                                title: '----',
                                offset: null,
                                dashArray: "10"
                                // dashArray: null, 
                                // lineCap: null, 
                                // lineJoin: null, 
                                // clickable: true, 
                                // pointerEvents: 'visiblePainted', 
                                // stroke: true, 
                                // fill: false, 
                                // fillColor: '#f03', 
                                // fillOpacity: 0.2, 
                                // fillRule: 'evenodd', 
                                // dashOffset: null, 
                                // smoothFactor: 1.0, 
                            },
                            Polygon: {
                                color: 'green'
                            }
                        }
                    }
                } else { }
                // document.getElementById('mpid').style.position = ''
                // if (spa.map.hasLayer(spa['mpid'])) spa.map.removeLayer(spa['mpid'])         // 2 remove old layer
                // spa['mpid'] = L.featureGroup().addTo(spa.map);                              //   create new layer
                if (spa['mpid']) spa.map.removeLayer(spa['mpid']); // 先用旧引用从地图移除
                spa['mpid'] = L.featureGroup().addTo(spa.map)
                var _tr = '<tr><td><b>__</b></td><td >--</td></tr>'                          // a table row for formatting tooltip and popup content, where __ will be replaced by property name and -- by property value
                if (window._mapReady) {                                                     // 2026_03 add for "before mapping"
                    _mapReady()                                                             // udf code can be put in _mapReady function, which will be called before mapping
                } else if (spa.baseMap) {                                                   // additional base map features (not from pivotData, but from spa.baseMap, which can be loaded in _mapReady or before)
                    Object.keys(spa.baseMap).forEach(k => {
                        spa.baseMap[k].features.forEach(v => {
                            let elmMap
                            if (v.geometry.type == 'Point') {
                                // L.geoJSON(v, {color:'grey',fillColor:'green',fillOpacity:0.3, opacity:0.5, weight: 3}).addTo(spa.map)
                                elmMap = L.circleMarker(v.geometry.coordinates.reverse()
                                    , v.style || { color: 'grey', fillColor: 'white', fillOpacity: 0.9, radius: 4, weight: 1 })
                                    .addTo(spa['mpid'])
                            } else if (v.geometry.type == 'LineString') {
                                elmMap = L.geoJSON(v
                                    , v.style || { color: 'rgba(0,0,200,0.3)', weight: 1 })
                                    .addTo(spa['mpid'])
                            } else if (v.geometry.type == 'Polygon') {
                                elmMap = L.geoJSON(v, v.style || { color: 'green' }).addTo(spa['mpid'])
                            }
                            let html = v.properties.html || v.properties.NAME
                                || ('<table><tbody>' + (Object.entries(v.properties).map(v => _tr.replace('__', v[0]).replace('--', v[1])).join(' ')) + '</tbody></table>')
                            elmMap = elmMap.bindTooltip(html, { permanent: false, direction: 'right' })
                        })
                    })
                }
                if (spa.pivotMap) {                                                         // 3.1 map based on pivot results
                    // spa.pivotMap = {}  
                    // pivotData.colKeys.forEach(colKey => {                                   // loop through colKeys
                    //     spa.pivotMap[colKey] = pivotData.rowKeys.map(rowKey => Object.values(pivotData.getAggregator(rowKey, colKey))[0])
                    // }) 
                    // let pivotRowResults = Object.values(pivotData.rowTotals).map(v => Object.values(v)[0])  // pivot results for each row (in last column)
                    let eachPivotRowData,  pivotRowData = [] 
                    pivotData.rowKeys.forEach(rowkey => {                                   //  loop through rowKeys
                        eachPivotRowData = spa.dataPC.filter(v => (rowkey.map(k => k).join() ==  pivotData.rowAttrs.map(k => v[k]).join()))
                        var newUDF = 1
                        let _style = {}
                        let _arrStyle = { yawn: 30, size: '10px', fill: false, frequency: 'endonly' }
                        // pivotData.getAggregator(pivotData.rowKeys[0], pivotData.colKeys[0])
                        let r = {data: eachPivotRowData} 
                        try {
                            r.gisType = r.data[0].gisType || r.data[0].type;
                            r.coordinates = Object.values(L.latLngBounds(r.data.map(v => v.coordinates)).getCenter()) //r.data[0].coordinates;
                            r.stylePoint = r.data[0].stylePoint;    // one row sample
                            r[pivotData.rowAttrs.join(', ')] = rowkey.join(', ')
                            pivotData.colKeys.forEach(colKey => {                                // loop through colKeys
                                r[colKey] = pivotData.getAggregator(rowkey, colKey).value()
                            })
                            r['rowTotal'] = pivotData.rowTotals[rowkey.join('\x00')].value()
                            pivotRowData.push(r)
                        } catch { }
                    })      
                    spa.mapStyle = {}                  
                    pivotRowData.forEach(r => {                                              //  loop through pivotRowData                       
                        try { r.gisType = r.gisType||r.type||'Point'
                            if (r.gisType == 'Point') {
                                r.stylePoint = r.stylePoint || r.stylepoint || r.style
                                if (r.stylePoint) {
                                    // eval("_style = {" + r.stylePoint + "}")
                                    _style = r.stylePoint.replace(/([\w\d\.]+)/g, '"$1"').replace(/"([\d\.]+)"/g, '$1');
                                    _style = JSON.parse(_style.replaceAll('#"', '"#'));
                                    if (typeof(_style.weight) == 'string' ) {
                                        if (_style.weight =='pivot') _style.weight = 'rowTotal'
                                        if (!spa.mapStyle.weightRG) spa.mapStyle.weightRG = _getMnMx(_style.weight, pivotRowData)
                                        _style.weight = getR(r[_style.weight], spa.mapStyle.weightRG[0], spa.mapStyle.weightRG[1])
                                    }                                     
                                }
                                var ll = L.latLng(r.coordinates[1], r.coordinates[0])
                                var newUDF = L.circle(ll, { ...spa.leaflet.layout['Point'], ..._style }).addTo(spa['mpid']);
                            } else if (r.gisType == 'LineString') {
                                r.styleLine = r.styleLine || r.styleline || r.style
                                if (r.styleLine) {
                                    _style = r.styleLine.replace(/([\w\d\.]+)/g, '"$1"').replace(/"([\d\.]+)"/g, '$1');
                                    _style = JSON.parse(_style.replaceAll('#"', '"#'));
                                }
                                if (r.arrowheads) {
                                    _arrStyle = r.arrowheads.replace(/([\w\d\.]+)/g, '"$1"').replace(/"([\d\.]+)"/g, '$1');
                                    _arrStyle = JSON.parse(_arrStyle.replaceAll('#"', '"#'));
                                }
                                // L.polyline(f.geometry.coordinates.map(v => [v[1],v[0]]), lStyle)
                                var newUDF = L.polyline(r.coordinates.map(v => [v[1], v[0]]), { ...spa.leaflet.layout['LineString'], ..._style })
                                    .arrowheads(_arrStyle).addTo(spa['mpid']);
                                if (r.label) {
                                    // var icon = L.divIcon({ className: spa.icon[f.properties.TYPE], iconSize: [size, size], html: "<div class='genLabel'>" + f.properties.ASSET_ID + '</div>' })
                                    // var marker = L.marker([f.geometry.coordinates[1], f.geometry.coordinates[0]], { title: f.properties.UNIT, icon: icon }).addTo(spa['mpid'])
                                    var icon = L.divIcon({ iconSize: [0, 0], html: r.label })
                                    L.marker([r.coordinates[1][1], r.coordinates[1][0]], { icon: icon }).addTo(spa['mpid'])
                                }
                            } else if (r.gisType == 'Polygon') {
                                r.stylePolygon = r.stylePolygon || r.stylepolygon || r.stylePoint|| r.stylepoint || r.style 
                                if (r.stylePolygon) {
                                    _style = (r.stylePolygon).replace(/([\w\d\.]+)/g, '"$1"').replace(/"([\d\.]+)"/g, '$1');
                                    _style = JSON.parse(_style);
                                }
                                if (r.coordinates.length == 2) {
                                    r.coordinates = [
                                        r.coordinates[0]
                                        , [r.coordinates[0][0], r.coordinates[1][1]]
                                        , r.coordinates[1]
                                        , [r.coordinates[1][0], r.coordinates[0][1]]
                                    ]
                                }
                                if (r.coordinates[0][0][0]) {
                                    var newUDF = L.polygon(r.coordinates.map(v => v.map(v => [v[1], v[0]])), { ...spa.leaflet.layout['Polygon'], ..._style }).addTo(spa['mpid'])
                                } else {
                                    var newUDF = L.polygon(r.coordinates.map(v => [v[1], v[0]]), { ...spa.leaflet.layout['Polygon'], ..._style }).addTo(spa['mpid']);
                                }
                            }
                            if (newUDF == 1) {
                                try {
                                    newUDF = L.geoJSON({ type: 'Feature', geeometry: { type: (r.gisType||r.type), coordinates: r.coordinates.map(v => v.map(v => [v[1], v[0]])) } },
                                        {  // onEachFeature: onEachFeature,
                                            style: {
                                                color: 'rgba(0,0,100,0.2)', // : 'rgba(0,0,0,0.05)',
                                                weight: 0.6,
                                                fillColor: 'black',
                                                // fillOpacity: f.properties['fill-opacity'],
                                            }
                                        }).addTo(spa['mpid']); // doing geoJSON
                                    // if (spa.treePath.select['#^^label^^label'].list.includes(dLayer)) {
                                    //     var icon = L.divIcon({className: 'lineLabel', html: _label})
                                    //     L.marker(newUDF._layers[Object.keys(newUDF._layers)].getCenter(), {icon:icon}).addTo(spa._leaflet.hasLayer[dLayer])   
                                    // }  
                                } catch { console.log('error in geoJSON') }

                            }
                            if ('table' == 'table') {
                                // var txt = pivotData.rowAttrs.length > 0 ? 
                                // '<table><tbody>' + pivotData.rowAttrs.map(v => _tr.replace('__',v).replace('--',r[v])).join(' ') + '</tbody></table>'
                                // : r.name
                                spa.hideColData = spa.hideCol || ['type','coordinate','style','value']          // confuguable in udf.js or udf column in cfg.json
                                spa.hideColPivot = spa.hideColPivot || ['data','gisType','coordinates','style'] // confuguable in udf.js or udf column in cfg.json
                                let infoKey = Object.keys(r.data[0]).filter(k => !Math.max(...spa.hideColData.map(str => k.includes(str)? 1:0)))
                                let infoKey0 =  Object.keys(r).filter(k => !Math.max(...spa.hideColPivot.map(str => k.includes(str)? 1:0)))
                                let infoTxt = infoKey.map(k => r.data.map(v => v[k])).map(v_ => [ ...new Set(v_)].join(' | ').replaceAll('  ',' '))
                                infoTxt = infoTxt.map(v => v.length > 99? v.slice(0,99) + ' ...': v)
                                // var txt = '<table><tbody>'
                                //     + ([...pivotData.colAttrs, ...pivotData.rowAttrs, ...pivotData.valAttrs].map(v => _tr.replace('__', v).replace('--', r[v])).join(' ') || r.name)
                                //     + '</tbody></table>'
                                var txt = '<table><tbody>' //style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                                    + (infoKey0.map(v => _tr.replace('__', v).replace('--', r[v])).join(' ') || r.name)
                                    + '<tr><td><b>Aggregation</b></td><td><b>'+ pivotData.aggregatorName +'</b></td></tr>'
                                    + (infoKey.map((v, i) => _tr.replace('__', v).replace('--', infoTxt[i])).join(' ') || r.name)
                                    + '</tbody></table>'                                
                            } else {
                                txt = pivotData.rowAttrs.length > 0 ? pivotData.rowAttrs.map(v => '' + v + ': ' + r[v]).join('<br>') : r.name
                            }

                            if (!['NO', 'N'].includes((_style.tooltip || 'Y').toUpperCase())) newUDF = newUDF.bindTooltip(txt, { permanent: false, direction: 'right' })
                            if (!['NO', 'N'].includes((_style.popup || 'Y').toUpperCase())) newUDF = newUDF.bindPopup(txt)
                            // newUDF = newUDF.bindTooltip(String(_label) || '_bindTooltip or _label', { permanent: false, direction: 'right' })
                            // newUDF = newUDF.bindPopup(_bindPopup(f.properties) + (_url? _url[0] : ''))
                            // newUDF = newUDF.on('mouseover', function (e) {
                            //     // $("#infoBlock").html(JSON.stringify(f.properties).replace(/["\{]/g, '').replace(/coordinates:\[.*\]/, '').replace(/:/g, ":<b>").replace(/,/g, "<\/b><br>").replace(/\}/g, "<\/b>"))
                            //     $("#infoBlock").html(_infoBox(f.properties).details || _infoBox(f.properties))
                            //     $("#mydivheader").html((_infoBox(f.properties).title || String(_label) )+ ' ... ' + dLayer + ' &hArr;')
                            // });                        
                        } catch { }                          
                    })                       
                } else {                                                                    // 3.1 map based on spa.dataPC (filtered of spa.data) ... selected pivot value
                    spa.mapStyle = {}
                    // const markersGroup = L.markerClusterGroup({
                    //     showCoverageOnHover: false, // Disables the bounding box line on hover
                    //     zoomToBoundsOnClick: true,  // Automatically zooms into a cluster when clicked
                    //     spiderfyOnMaxZoom: true,    // Fans out overlapping markers at the highest zoom level
                    //     maxClusterRadius: 5        // The maximum radius (in pixels) a cluster will cover (Default: 80)
                    // }).addTo(spa['mpid'])
                    spa.dataPC.forEach(r => {                                               // 3.1.1 loop thru rows in spa.dataPC (filtered of spa.data)
                        var newUDF = 1
                        let _style = {}
                        let _arrStyle = { yawn: 30, size: '10px', fill: false, frequency: 'endonly' }
                        try {
                            r.gisType = r.gisType||r.type
                            if (r.gisType == 'Point') {
                                r.stylePoint = r.stylePoint || r.stylepoint || r.style
                                if (r.stylePoint) {
                                    // eval("_style = {" + r.stylePoint + "}")
                                    _style = r.stylePoint.replace(/([\w\d\.]+)/g, '"$1"').replace(/"([\d\.]+)"/g, '$1');
                                    _style = JSON.parse(_style.replaceAll('#"', '"#'));
                                    if (typeof(_style.weight) == 'string' ) {
                                        if (_style.weight =='pivot') _style.weight = pivotData.valAttrs[0]         //selected pivot value
                                        if (!spa.mapStyle.weightRG) spa.mapStyle.weightRG = _getMnMx(_style.weight, spa.dataPC)
                                        _style.weight = (window.getR||window._getR)(Math.abs(parseFloat(r[_style.weight])), spa.mapStyle.weightRG[0], spa.mapStyle.weightRG[1])
                                    } 
                                } else if (pivotData.valAttrs[0]) {
                                    if (r.styleWeight) {
                                        _style.weight = r.styleWeight
                                    } else {
                                        _style.weight = pivotData.valAttrs[0]
                                        if (!spa.mapStyle.weightRG) spa.mapStyle.weightRG = _getMnMx(_style.weight, spa.dataPC)
                                        _style.weight = (window.getR || window._getR)(Math.abs(parseFloat(r[_style.weight])), spa.mapStyle.weightRG[0], spa.mapStyle.weightRG[1])
                                    }
                                    if (r.styleOpacity) {
                                        _style.opacity = r.styleOpacity
                                    }                                    
                                    _style.color = r.styleColor||r.stylecolor||r.color || 'grey'
                                }
                                var ll = L.latLng(r.coordinates[1], r.coordinates[0])
                                if (_style.radius) {
                                    var newUDF = L.circleMarker(ll, { ...spa.leaflet.layout['Point'], ..._style }).addTo(spa['mpid']); //.addTo(markersGroup)
                                } else {
                                    var newUDF = L.circle(ll, { ...spa.leaflet.layout['Point'], ..._style }).addTo(spa['mpid']);
                                }
                            } else if (r.gisType == 'LineString') {
                                r.styleLine = r.styleLine || r.styleline || r.style
                                if (r.styleLine) {
                                    _style = r.styleLine.replace(/([\w\d\.]+)/g, '"$1"').replace(/"([\d\.]+)"/g, '$1');
                                    _style = JSON.parse(_style.replaceAll('#"', '"#'));
                                }
                                if (r.arrowheads) {
                                    _arrStyle = r.arrowheads.replace(/([\w\d\.]+)/g, '"$1"').replace(/"([\d\.]+)"/g, '$1');
                                    _arrStyle = JSON.parse(_arrStyle.replaceAll('#"', '"#'));
                                }
                                // L.polyline(f.geometry.coordinates.map(v => [v[1],v[0]]), lStyle)
                                var newUDF = L.polyline(r.coordinates.map(v => [v[1], v[0]]), { ...spa.leaflet.layout['LineString'], ..._style })
                                    .arrowheads(_arrStyle).addTo(spa['mpid']);
                                if (r.label) {
                                    // var icon = L.divIcon({ className: spa.icon[f.properties.TYPE], iconSize: [size, size], html: "<div class='genLabel'>" + f.properties.ASSET_ID + '</div>' })
                                    // var marker = L.marker([f.geometry.coordinates[1], f.geometry.coordinates[0]], { title: f.properties.UNIT, icon: icon }).addTo(spa['mpid'])
                                    var icon = L.divIcon({ iconSize: [0, 0], html: r.label })
                                    L.marker([r.coordinates[1][1], r.coordinates[1][0]], { icon: icon }).addTo(spa['mpid'])
                                }
                            } else if (r.gisType == 'Polygon') {
                                r.stylePolygon = r.stylePolygon || r.stylepolygon || r.stylePoint|| r.stylepoint || r.style 
                                if (r.stylePolygon) {
                                    _style = (r.stylePolygon).replace(/([\w\d\.]+)/g, '"$1"').replace(/"([\d\.]+)"/g, '$1').replace('"false"','false').replace('"true"','true');
                                    _style = JSON.parse(_style);
                                }
                                if (r.coordinates.length == 2) {
                                    r.coordinates = [
                                        r.coordinates[0]
                                        , [r.coordinates[0][0], r.coordinates[1][1]]
                                        , r.coordinates[1]
                                        , [r.coordinates[1][0], r.coordinates[0][1]]
                                    ]
                                }
                                if (r.coordinates[0][0][0]) {
                                    var newUDF = L.polygon(r.coordinates.map(v => v.map(v => [v[1], v[0]])), { ...spa.leaflet.layout['Polygon'], ..._style }).addTo(spa['mpid'])
                                } else {
                                    var newUDF = L.polygon(r.coordinates.map(v => [v[1], v[0]]), { ...spa.leaflet.layout['Polygon'], ..._style }).addTo(spa['mpid']);
                                }
                            }
                            if (newUDF == 1) {
                                try {
                                    newUDF = L.geoJSON({ type: 'Feature', geeometry: { type: r.gisType, coordinates: r.coordinates.map(v => v.map(v => [v[1], v[0]])) } },
                                        {  // onEachFeature: onEachFeature,
                                            style: {
                                                color: 'rgba(0,0,100,0.2)', // : 'rgba(0,0,0,0.05)',
                                                weight: 0.6,
                                                fillColor: 'black',
                                                // fillOpacity: f.properties['fill-opacity'],
                                            }
                                        }).addTo(spa['mpid']); // doing geoJSON
                                    // if (spa.treePath.select['#^^label^^label'].list.includes(dLayer)) {
                                    //     var icon = L.divIcon({className: 'lineLabel', html: _label})
                                    //     L.marker(newUDF._layers[Object.keys(newUDF._layers)].getCenter(), {icon:icon}).addTo(spa._leaflet.hasLayer[dLayer])   
                                    // }  
                                } catch { console.log('error in geoJSON') }

                            }
                            if ('table' == 'table') {
                                // var txt = pivotData.rowAttrs.length > 0 ? 
                                // '<table><tbody>' + pivotData.rowAttrs.map(v => _tr.replace('__',v).replace('--',r[v])).join(' ') + '</tbody></table>'
                                // : r.name
                                var txt = '<table><tbody>'
                                    + ([...pivotData.colAttrs, ...pivotData.rowAttrs, ...pivotData.valAttrs].map(v => _tr.replace('__', v).replace('--', r[v])).join(' ') || r.name)
                                    + '</tbody></table>'
                            } else {
                                txt = pivotData.rowAttrs.length > 0 ? pivotData.rowAttrs.map(v => '' + v + ': ' + r[v]).join('<br>') : r.name
                            }

                            if (!['NO', 'N'].includes((_style.tooltip || 'Y').toUpperCase())) newUDF = newUDF.bindTooltip(txt, { permanent: false, direction: 'right' })
                            if (!['NO', 'N'].includes((_style.popup || 'Y').toUpperCase())) newUDF = newUDF.bindPopup(txt)
                            // newUDF = newUDF.bindTooltip(String(_label) || '_bindTooltip or _label', { permanent: false, direction: 'right' })
                            // newUDF = newUDF.bindPopup(_bindPopup(f.properties) + (_url? _url[0] : ''))
                            // newUDF = newUDF.on('mouseover', function (e) {
                            //     // $("#infoBlock").html(JSON.stringify(f.properties).replace(/["\{]/g, '').replace(/coordinates:\[.*\]/, '').replace(/:/g, ":<b>").replace(/,/g, "<\/b><br>").replace(/\}/g, "<\/b>"))
                            //     $("#infoBlock").html(_infoBox(f.properties).details || _infoBox(f.properties))
                            //     $("#mydivheader").html((_infoBox(f.properties).title || String(_label) )+ ' ... ' + dLayer + ' &hArr;')
                            // });                        
                        } catch { }
                    });
                }
                if (window.mapReady_) {                                                     // 2026_03 after mapping
                    mapReady_()                                                             // udf code can be put in mapReady_ function, which will be called after mapping
                } else {
                    setTimeout(() => {
                        if (getUrlVars()['zm']) spa.map.fitBounds(spa['mpid'].getBounds());
                    }, "500");
                }
                return "see on map below ... when adding a data column(s) to the row or columns section, it will be shown on map when hoving over the feature"
        //   var agg, colAttrs, colKey, colKeys, defaults, i, j, k, l, len, len1, len2, len3, len4, len5, m, n, r, result, row, rowAttr, rowAttrs, rowKey, rowKeys, text;
        //   defaults = {
        //     localeStrings: {}
        //   };
        //   opts = $.extend(true, {}, defaults, opts);
        //   rowKeys = pivotData.getRowKeys();
        //   if (rowKeys.length === 0) {
        //     rowKeys.push([]);
        //   }
        //   colKeys = pivotData.getColKeys();
        //   if (colKeys.length === 0) {
        //     colKeys.push([]);
        //   }
        //   rowAttrs = pivotData.rowAttrs;
        //   colAttrs = pivotData.colAttrs;
        //   result = [];
        //   row = [];
        //   for (i = 0, len = rowAttrs.length; i < len; i++) {
        //     rowAttr = rowAttrs[i];
        //     row.push(rowAttr);
        //   }
        //   if (colKeys.length === 1 && colKeys[0].length === 0) {
        //     row.push(pivotData.aggregatorName);
        //   } else {
        //     for (j = 0, len1 = colKeys.length; j < len1; j++) {
        //       colKey = colKeys[j];
        //       row.push(colKey.join("-"));
        //     }
        //   }
        //   result.push(row);
        //   for (k = 0, len2 = rowKeys.length; k < len2; k++) {
        //     rowKey = rowKeys[k];
        //     row = [];
        //     for (l = 0, len3 = rowKey.length; l < len3; l++) {
        //       r = rowKey[l];
        //       row.push(r);
        //     }
        //     for (m = 0, len4 = colKeys.length; m < len4; m++) {
        //       colKey = colKeys[m];
        //       agg = pivotData.getAggregator(rowKey, colKey);
        //       if (agg.value() != null) {
        //         row.push(agg.value());
        //       } else {
        //         row.push("");
        //       }
        //     }
        //     result.push(row);
        //   }
        //   text = "";
        //   for (n = 0, len5 = result.length; n < len5; n++) {
        //     r = result[n];
        //     text += r.join("\t") + "\n";
        //   }
        //   return $("<textarea>").text(text).css({
        //     width: ($(window).width() / 2) + "px",
        //     height: ($(window).height() / 2) + "px"
        //   });
        }
      };
    });
  
  }).call(this);
  