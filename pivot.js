
spa = {
    column: { category: ['YEAR', 'MONTH', 'DAY','HOUR','HE','MINUTE','REPORT_YEAR','REPORT_MONTH','REPORT_DAY','REPORT_HOUR','Dispatch_Segment','TIME','DT'] },
    gbe: 'http://prodgrd02:8088/'
}
$(function(){
    var renderers = $.extend(
        $.pivotUtilities.renderers,
        $.pivotUtilities.leaflet_renderers,
        $.pivotUtilities.plotly_renderers,
        $.pivotUtilities.d3_renderers,
        $.pivotUtilities.export_renderers
        );

    var parseAndPivot = function(f) {
        $("#output").html("<p align='center' style='color:grey;'>(processing...)</p>")
        Papa.parse(f, {
            skipEmptyLines: true,
            error: function(e){ alert(e) },
            complete: function(parsed){
                spa.data = parsed.data
                if (document.getElementById('unpivot_vCol').checked) {
                    parsed.data = unpivotValue(parsed.data)
                }  
                $("#output").pivotUI(parsed.data, { renderers: renderers }, true);
            }
        });
    };

    $("#csv").bind("change", function(event){
        parseAndPivot(event.target.files[0]);
    });

    $("#textarea").bind("input change", function(){
        parseAndPivot($("#textarea").val());
    });

    var dragging = function(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.originalEvent.dataTransfer.dropEffect = 'copy';
        $("body").removeClass("whiteborder").addClass("greyborder");
    };

    var endDrag = function(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.originalEvent.dataTransfer.dropEffect = 'copy';
        $("body").removeClass("greyborder").addClass("whiteborder");
    };

    var dropped = function(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        $("body").removeClass("greyborder").addClass("whiteborder");
        parseAndPivot(evt.originalEvent.dataTransfer.files[0]);
    };

    $("html")
        .on("dragover", dragging)
        .on("dragend", endDrag)
        .on("dragexit", endDrag)
        .on("dragleave", endDrag)
        .on("drop", dropped);

// ================ to get data defined in URL parameter (csv / fth on DFS, sql query) 
    var getUrlVars = function () {
        var vars = {};
        var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
            vars[key] = value;
        });
        return vars;
    }

    async function getCfg(withJson = 1) {   // to merge with switchCfg() in _gui.js
        if (withJson == 1) {                // with JSON to read, 
            spa.cfg = await getData0(spa.cfg_file)
            if (spa.cfg.default.derivedAttributes) {
                Object.keys(spa.cfg.default.derivedAttributes).forEach(k => {
                    spa.cfg.default.derivedAttributes[k] = eval(spa.cfg.default.derivedAttributes[k])
                })
            }
            // a = await _getPIData()
            if (spa.cfg['user columns']) {
                if (typeof (spa.cfg['user columns']) == 'object') { spa.cfg['user columns'] = spa.cfg['user columns'].join(';') }
                document.getElementById('userCol').value = spa.cfg['user columns'].replace(/[;\n]{1,3} */g, ';\n') + '\n==========='
                // document.getElementById("usrCol").open = true    
            } else {
                document.getElementById('userCol').value = ''
                document.getElementById("usrCol").open = false
            }
            if (spa.cfg?.default?.filter) spa.cfg.default.filter = eval(spa.cfg.default.filter)
            spa.jsonRead = 1
            document.getElementById('title').innerText = spa.cfg.title || 'Title not configured in JSON'
            if (spa.cfg?.title) document.title = spa.cfg.title.split(' ')[0]
            if (spa.csv_file?.toLowerCase().includes('history.txt')) document.title = '_' + document.title
        }
        if (1 == 1) { //hideTotal        run with or without JSON, for the Pivot table layout
            if (!spa.cfg) spa.cfg = {}
            spa.cfg.hideTotal = getUrlVars()['hideTotal'] || getUrlVars()['hidetotal'] || spa.cfg?.hideTotal
            if (spa.cfg.hideTotal == 'true') spa.cfg.hideTotal = true
            if (spa.cfg.hideTotal == 'false') spa.cfg.hideTotal = false
            if (spa.cfg?.hideTotal) {
                if (spa.cfg.hideTotal == true) {
                    document.getElementById('showTotal').checked = false
                    document.querySelector('#showTotals').value = 'none'
                } else if (spa.cfg.hideTotal.toLowerCase() == 'col') {
                    document.querySelector('#showTotals').value = 'col'
                } else if (spa.cfg.hideTotal.toLowerCase() == 'row') {
                    document.querySelector('#showTotals').value = 'row'
                } else if (spa.cfg.hideTotal.toLowerCase() == 'all') {
                    document.querySelector('#showTotals').value = 'all'
                }
            }
            // if (!spa.cfg?.hideTotal) spa.cfg.hideTotal = 0
            // if (spa.cfg.hideTotal === fasle ) {
            //     spa.cfg.hideTotal = 0
            // } else if (spa.cfg.hideTotal === true ) {
            //     spa.cfg.hideTotal = 3
            // }
            // document.getElementById('showTotal1').selectedIndex = spa.cfg.hideTotal    
        }

    }
    var path = getUrlVars()["path"];
    if (path == undefined) {
        path = "";
    } else {
        path = path + '/';
        path = path.replace(/%22/g, '')
        path = path.replace(/%27/g, '')
    }
    spa.urlPara = getUrlVars()
    var csv = getUrlVars()["csv"];    // data csv file
    // var xls = getUrlVars()["xls"];    // data xls file
    var sql = getUrlVars()["sql"]||getUrlVars()["api"];    // sql text file
    var cfg = getUrlVars()["cfg"]
    spa.jsonRead = cfg? 0 : 1
    spa.db = getUrlVars()["db"]||(getUrlVars()["api"]?'api':'')||'pi'
    spa.brkTime = getUrlVars()["brt"]
    spa.unpivot0 = getUrlVars()["upv"]? true : false
    document.getElementById('unpivot_vCol').checked = spa.unpivot0
    // spa.percentile = +(getUrlVars()["pct"]||95)/100
    spa.percentile = getUrlVars()["pct"]||'t5'
    
    if (cfg == undefined) {
        cfg = "";
        document.getElementById('userCol').value =''
        getCfg(0)  
    } else {
        cfg = path + '/' +cfg;
        cfg = cfg.replace(/%22/g, '').replace(/%27/g, '')
        // spa.cfg_file = 'http://devgrd02:2222/' + cfg;
        spa.cfg_file = 'http://prodgrd02:2222/' + cfg;
        getCfg()  
    }
    // var t=setInterval(() => { toggleTotal()},200) // running every 200ms
    var parseAndPivot_url = async function (url, dataReady = false, pvtOnly = 0) { //mh, enable url parameter
        if (cfg!='' && !spa.cfg) {
            await getCfg()           // reload cfg.json in not loaded yet
        }
        if (!spa.cfg?.default) spa_cfg_default = {}
        $("#output").html("<p align='center' style='color:grey;'>(processing...)</p>")
        if (dataReady) {
            $("#output").pivotUI(await prcsData(spa.data, pvtOnly), { renderers: renderers, ...spa_cfg_default }, true);
        } else {  // with data reload
            if (url.match(/txt$/i)) {                              // if *.txt: set query text
                d3.text(url,function(error,data)                 
                {
                  if(error)
                    return console.error(error);
                  console.log(data)
                  document.getElementById('sqlText').value = data      // [sqlText]'s onchange will trigger queryData()
                //   queryData()
                  setTimeout(function(){ queryData()}, (spa.jsonRead == 0)? 200 :  10)
                });
            } else if (url.match(/fth$/i)) {                       // if *.fth: retrive fth through GBE
                var url0 = spa.gbe+ 'getFile/fth?id=all&path='+url
                try {        //async & await
                    var d = await getData0(url0)
                    spa.data = d.all
                    var idx = spa.data[0].indexOf('dt') || spa.data[0].indexOf('time') 
                    if (idx >= 0) {
                        spa.data.forEach((d,i) => {
                            if (i == 0) {
                                spa.data[i] = [...d, 'year', 'month', 'day', 'hour', 'minute' ]
                            } else {
                                var dt = new Date(d[idx])
                                spa.data[i][idx] = d[idx].slice(0,10) + ' ' + d[idx].slice(11,19)
                                spa.data[i] = [...d, dt.getFullYear(),dt.getMonth()+1, dt.getDate(), dt.getHours(),dt.getMinutes()] 
                            }
                        })
                    }
                    $("#output").html("<p align='center' style='color:grey;'>(...data returned...)</p>")
                    spa.data = spa.cfg?.unpivot? unpivotUser(spa.data) : spa.data
                    $("#output").pivotUI(await prcsData(spa.data, pvtOnly), { renderers: renderers, ...spa_cfg_default}, true)
                } catch (err) {
                    console.log(err)
                    console.log(new Date())
                    $("#output").html("<p align='center' style='color:grey;'>(...data error...)</p>")
                }   
            } else if (url.match(/csv$/i)) {                       // if *.csv: retrive csv using 'Papa'
                Papa.parse(url, {
                    download: true,
                    skipEmptyLines: true,
                    error: function (e) { alert(e) },
                    complete: async function (parsed) {
                        if (window.dataReady_) {  // excute code in UDF
                            dataReady_()
                        }
                        console.log(spa.jsonRead)
                        spa_cfg_default = spa.cfg?.default? spa.cfg.default : {}
                        // spa.data = spa.cfg?.unpivot? unpivotUser(parsed.data) : parsed.data
                        spa.data = spa.cfg?.unpivot? unpivotUser(parsed.data) : (spa.cfg?.pivot? pivotCols(parsed.data, spa.cfg.pivot) : parsed.data)
                        $("#output").pivotUI(await prcsData(spa.data, pvtOnly), { renderers: renderers, ...spa_cfg_default }, true) 

                        // setTimeout(function(){
                        //    spa_cfg_default = spa.cfg?.default? spa.cfg.default : {}
                        //    spa.data = spa.cfg?.unpivot? unpivotUser(parsed.data) : parsed.data
                        //    $("#output").pivotUI(prcsData(spa.data, pvtOnly), { renderers: renderers, ...spa_cfg_default }, true)                         
                        // }, (spa.jsonRead == 0)? 200 :  10)
                    }
                });
            } else if (url.match(/xls[x]?!/i) || url.match(/xls[x]?$/i)) {
                var url0 = spa.gbe+ 'getFile/xls?&path='+url
                var d = await getData0(url0)
                spa.data = spa.cfg?.unpivot? unpivotUser(d.all) : d.all
                if (window.dataReady_) {  // excute code in UDF
                    dataReady_()
                }                
                if (spa.cfg?.default) spa_cfg_default = spa.cfg?.default               
                $("#output").pivotUI(await prcsData(spa.data, pvtOnly), { renderers: renderers, ... spa_cfg_default}, true)                    
            } else {
                document.getElementById('sqlText').value = url.replace('http://prodgrd02:2222/','')
                setTimeout(function(){ queryData()}, (spa.jsonRead == 0)? 200 :  10)
            }
        }
    };
    if (csv) {
        // spa.csv_file = 'http://prodhpcts01/pc/csv/' + path + csv;
        spa.csv_file = 'http://prodgrd02:2222/' + path + csv;
        parseAndPivot_url(spa.csv_file)
    }
    // if (xls) {   // using GBE
    //     // spa.csv_file = 'http://prodhpcts01/pc/csv/' + path + csv;
    //     // spa.csv_file = 'http://prodgrd02:2222/' + path + csv;  
    //     spa.csv_file = spa.gbe + 'getFile/xls?path=' + path + xls // \\aeso.ca\dfs\Technical\te\97\SystemPerformence\Transmission\csv\mhu\2023\txuReport\TxUtilization2022toChris.xlsx!Summary_Copy
    //     parseAndPivot_url(spa.csv_file)
    // }    
    if (sql) {                   // sql & api 
        spa.csv_file = 'http://prodgrd02:2222/' + path + sql;
        parseAndPivot_url(spa.csv_file)
    }    
    $("#unpivot_vCol").change(function() {
        parseAndPivot_url(spa.csv_file, true, 1)  // up pivot only
    })
    $("#userCol").change(function() {
        parseAndPivot_url(spa.csv_file, true)
    })
 });             

function unpivotValue(data, col=0) {   // post unpivot number columns as item / value 
    try {
        if (spa.cfg?.unpivot1) {
            var pureDataColumn = Object.values(spa.cfg.unpivot1[0])[0]
            var _newCol = Object.keys(spa.cfg.unpivot1[0])[0].split('_')    // 'what_value' => ['what', 'value']        
        } else {
            // var pureDataColumn = data[0].filter((v,i) => !Number.isNaN(+data[1][i]) && !spa.column.category.map(v=> v.toUpperCase()).includes(v.toUpperCase()))
            var pureDataColumn = data[0].filter((v,i) => {
                var _1stValid = data.find((v1,i1) => ![undefined,'',' ', 'NaT', null, Number.NaN, NaN].includes(v1[i]) && i1>0  )  // to get 1st valid value
                if (_1stValid) {
                    _1stValid = _1stValid[i]
                } else {
                    return false
                }
                if (typeof(_1stValid)  == 'boolean') return false                                  // true or false
                if (_1stValid instanceof Date) return false
                return (!Number.isNaN(+_1stValid) && !spa.column.category.map(v=> v.toUpperCase()).includes(String(v).toUpperCase())) && !String(v).match(/^ccc_/i)       
            })
            // _newCol = spa.cfg?.colName? ['item', 'itemGrp', 'value'] : ['item', 'value']  // with changed / grouped colomn/item names after pivot
            if (spa.cfg?.colName) {
                var nGrp = Math.max(...Object.values(spa.cfg.colName).map(v => v.split('.').length)) -1
                let itemGrp = Array(nGrp).fill().map((v,i) => i? i+1:'').map(v => 'itemGrp'+v)
                _newCol = ['item', ...itemGrp, 'value']
            } else {
                _newCol = ['item', 'value']
            }
            if (spa.cfg?.waterfall) {            // waterfall data column
                _newCol = [..._newCol, ... new Array(spa.cfg.waterfall.length).fill(0).map((v,i) => 'waterfall_' +i)]  // _newCol = [..._newCol,'wfData']               
            }            
            if (spa.cfg?.colName2) {             // fomular based 
                _newCol = [..._newCol, ... spa.cfg.colName2.map(v => v[0])]  // _newCol = [..._newCol,'wfData']               
            }                 
        }
        var prmtColumn = data[0].filter(v => !pureDataColumn.includes(v))
        var data_unpvt = [[... prmtColumn, ..._newCol]]
        // var data_unpvt = [[... prmtColumn, 'item', 'value']]
        data.slice(1).forEach(row => {
            var row_ = []
            prmtColumn.forEach(colP => {
                row_.push(row[data[0].indexOf(colP)])
            })
            if (1 == 1) {  // re-name inside
                pureDataColumn.forEach(colD => {
                    if (String(row[data[0].indexOf(colD)]).toUpperCase().replace('NA', '').replace('NaT', '').replaceAll(' ', '') != '') {
                        if (spa.cfg?.colName) {                                               // change colomn/item names after pivot and group them wuth a new column
                            let colD_ = spa.cfg.colName[colD] || colD
                            var _row = [...row_, colD_, colD_.split('.')[0], row[data[0].indexOf(colD)]]
                            let nGrpi = colD_.length - colD_.replaceAll('.', '').length
                            var _row = [...row_,
                            colD_.split('.').splice(-1)[0], // itme
                            ...[...colD_.split('.').slice(0, -1), ...Array(nGrp - nGrpi).fill('')],
                            row[data[0].indexOf(colD)]
                            ]
                        } else {
                            var _row = [...row_, colD, row[data[0].indexOf(colD)]]
                        }
                        if (spa.cfg?.waterfall) {
                            spa.cfg.waterfall.forEach((wf, i) => {
                                if (wf[colD]) {
                                    _row.push(wf[colD])
                                } else {
                                    _row.push(null)
                                }
                            })
                        }
                        if (spa.cfg?.colName2) {            // // fomular based
                            spa.cfg.colName2.forEach(cn2 => {
                                try {
                                    _row.push(eval(cn2[1]))
                                } catch {
                                    _row.push(null)
                                }
                            })              
                        }  
                        data_unpvt.push(Object.values(_row))
                    }
                })
            } else {  // re-name outside
                pureDataColumn.forEach(colD => {
                    if (String(row[data[0].indexOf(colD)]).toUpperCase().replace('NA', '').replace('NaT', '').replaceAll(' ', '') != '') {
                        if (spa.cfg?.colName) {                                               // change colomn/item names after pivot and group them wuth a new column
                            var _row = [...row_, colD, colD.split('.')[0], row[data[0].indexOf(colD)]]
                            let nGrpi = colD.length - colD.replaceAll('.', '').length
                            var _row = [...row_,
                            colD.split('.').splice(-1)[0], // itme
                            ...[...colD.split('.').slice(0, -1), ...Array(nGrp - nGrpi).fill('')],
                            row[data[0].indexOf(colD)]
                            ]
                        } else {
                            var _row = [...row_, colD, row[data[0].indexOf(colD)]]
                        }
                        data_unpvt.push(Object.values(_row))
                    }
                    // var _row = [...row_, colD, row[data[0].indexOf(colD)]]
                    // data_unpvt.push(Object.values(_row))
                })
            }
        })
    }
    catch {
        document.getElementById('userCol').value = document.getElementById('userCol').value + "\n======== \nUser column error"
    }

    return data_unpvt     
}
function unpivotUser(data) {           // pre unpivot number columns as defined in spa.cfg.unpivot
    try {
        var pureDataColumn = Object.values(spa.cfg.unpivot[0])[0]
        var prmtColumn = data[0].filter(v => !pureDataColumn.includes(v))
        var data_unpvt = [[... prmtColumn, ...Object.keys(spa.cfg.unpivot[0])[0].split('_')]]
        data.slice(1).forEach(row => {
            var row_ = []
            prmtColumn.forEach(colP => {
                row_.push(row[data[0].indexOf(colP)])
            })
            pureDataColumn.forEach(colD => {
                if (String(row[data[0].indexOf(colD)]).toUpperCase().replace('NA','').replace('NaT','').replaceAll(' ','') != '') {
                    var _row = [...row_, colD, row[data[0].indexOf(colD)]]
                    data_unpvt.push(Object.values(_row))
                }
            })
        })         
    }
    catch {
        document.getElementById('userCol').value = document.getElementById('userCol').value + "\n======== \nUser unpivot error ===="
    }

    return data_unpvt     
}
async function prcsData(data,pvtOnly = 0){
    if (pvtOnly == 1) return document.getElementById('unpivot_vCol').checked ? unpivotValue(spa.dataUNPVT) : spa.dataUNPVT
    if (spa.brkTime) data = _brkDateTime(data)   // break time-stamp
    userCol = document.getElementById('userCol').value.split('=======')[0].trim().replace(/;$/g, '')  // ignor txt after [=======]
    if (userCol != '') {                         // user columns
        if (window.colReady_) {  // excute code in UDF
            colReady_()
        }        
        userCol = userCol.replace(/[;\n]{1,3} */g,';').replace(/ +=/g,'=').split(';').map(v => {v1 = v.split('='); return [v1[0],v1.slice(1).join('=')]})
        for (let idx = 0; idx < userCol.length; idx++) { col = userCol[idx];     // loop each coloun 
        var txt0 = document.getElementById('output').innerText
        document.getElementById('output').innerHTML = document.getElementById('output').innerHTML.replace(txt0, [txt0,col[0]].join(' ... '))
        // userCol.forEach(async (col) => {
            if (col[0].match(/^__.*\(\)$/)) {                                    // 1-setp processing __****(),       without any parameter
                eval('data=' + col[0].replace('()','(data)'))                    //                => __****(data),   add data as the only parameter
            // } else if (col[0].match(/^___/)) {
            //     await eval1(col[1])
            } else if (col[0].match(/^__run__/)) {
                eval(col[0].replace('__run__', '') + ' = ' + col[1])         // directly run JavaScript code
            } else if (col[0].match(/^__.*\(.*\)$/)) {                           // for taking other parameters passed
                eval(col[0]) 
            } else {                                                             // to loop  all rows 
                // var newCol = ''+col[0].replace(/[\[\]]/g,'')
                var newCol = '' + col[0].replaceAll('|', '')
                if (newCol[0] == '*') {                                          // dynamic column name based on a user column
                    newCol = colFromVar(newCol)                                  // *at0*gen =>  at0 + '_gen'; 
                }
                var newColExist = false
                var idxExist = 0
                for (let idx = 0; idx < data.length; idx++) { d = data[idx];     // loop each row, ansyc version
                // data.forEach(async (d, idx) => {
                    if (idx == 0) {
                        if (col[0].match(/____/)) {

                            ___=1
                        } else {
                            if (data[0].includes(newCol)) {
                                newColExist = true
                                idxExist = data[0].indexOf(newCol)
                            } else {
                                data[0].push(newCol)
                            }                            
                            ___=0
                        }

                        // var col_1 = col[1].match(/\[[^=\]\d]*\]/g)
                        // var col_1_ = col_1.map(v => v.replace(/[\[\]]/g,''))
                        if (col[1].includes("{{")) {
                            var col_1 = col[1].match(/\{\{[^=\{]+\}\}/g) //col[1], after "="
                            var col_1_ = col_1.map(v => v.replaceAll('{{', '').replaceAll('}}', ''))
                            // col_1_ = col_1_.map(v => 'd[' + data[0].indexOf(v) + ']')
                            col_1_ = col_1_.map(v => 'd[' + (v[0]=='#'? v.slice(1): data[0].indexOf(v)) + ']')
                            col_1_.forEach( (c, i) => {
                                col[1] = col[1].replaceAll(col_1[i], c)
                            })
                        } else if (col[1].includes("|")) {
                            var col_1 = col[1].match(/\|[^=|]+\|/g) //col[1], after "="
                            // var col_1_ = col_1.map(v => v.replace(/\|/g,''))
                            var col_1_ = col_1.map(v => v.replaceAll('||', '^^^^').replace(/\|/g, '').replaceAll('^^^^', '||'))
                            // var col_1_ = col_1.map(v => v.replace(/\[([^\d]*)\]/g, "$1"))
                            col_1_ = col_1_.map(v => 'd[' + (v[0]=='#'? v.slice(1): data[0].indexOf(v)) + ']')
                            col_1_.forEach((c, i) => {
                                col[1] = col[1].replaceAll(col_1[i], c)
                            })
                        }
                    } else if (___ == 1) {
                        if (idx == 1) {
                            await eval1(col[1])
                        }
                    } else {   
                         try {
                            if (newColExist) {  // already exist
                                // // if (eval(col[1]) == false) {a=1}
                                // if (await eval1(col[1]) == false) {a=1}
                                try {
                                    // data[idx][idxExist] = eval(col[1])
                                    data[idx][idxExist] = await eval1(col[1]);
                                }
                                catch (err) {
                                    console.log(col[1], err);
                                }
                            } else {            // new
                                try {                                 
                                    // data[idx].push(eval(col[1]));
                                    // data[idx].push(await eval1(col[1]));
                                    data[idx] [data[0].length-1] = (await eval1(col[1]));
                                }
                                catch (err) {
                                    console.log(col[1]);
                                }
    
                            }
                        } catch (err) {
                            // alert("user column error !!!")
                            console.log("user column error !!!")
                        }

                    }
                } //)
            }
        } //)        
    }                                            
    //save a copy of unpivoted data ... then, unpivot
    spa.dataUNPVT = data.slice(0)
    // data[0] = data[0].map(v => spa.cfg?.colName?.[v]||v)
    var prcdData = document.getElementById('unpivot_vCol').checked ? unpivotValue(data) : data
    return prcdData  
}
function ctc(col,by0, py=0) {
    if (typeof(col) == 'string') col = spa.data[0].indexOf(col)
    if (typeof(py) == 'string') py = spa.data[0].indexOf(py)
    // a = new Set(spa.data.slice(1).filter(v => v[py] == by0).map(v => v[col])).size
    return new Set(spa.data.slice(1).filter(v => v[py] == by0).map(v => v[col])).size-1
}

async function toggleTotal() {
    ['.pvtTotal','.pvtTotalLabel','.pvtGrandTotal'].forEach(part => {
        document.querySelectorAll(part).forEach(function(el) {
            el.style.display = (document.getElementById('showTotal').checked)? '' : 'none';
         });
    })
    if (spa.cfg_copy.rendererName.toLowerCase().includes('chart')) $("#output").pivotUI(await prcsData(spa.data));
}
function toggleTotals() {
    let showWhat = document.querySelector('#showTotals').value
    let allClass =  ['pvtGrandTotal', 'colTotal','rowTotal','pvtRowTotalLabel','pvtColTotalLabel']
    var showClass 
    switch (showWhat) {
        case 'all':
            showClass = allClass.slice(0)
            break;
        case 'col':
            showClass = ['colTotal', 'pvtColTotalLabel']
            break;
        case 'row':
            showClass = ['rowTotal', 'pvtRowTotalLabel']
            break;
        case 'none':
            showClass = []
            break;
        default:
        // code block
    }
    allClass.forEach(part => {
        document.querySelectorAll('.' + part).forEach(function (el) {
            el.style.display = showClass.includes(part)? '': 'none';
        });
    })
}
function colFromVar(col_) {                      // dynamic column name based on a user column value at 1st record
    var match2 = col_.match(/\*(.*?)\*/)         // bwtween 2*, '*at0*gen' => 'at0'
    if (match2) {
        var col = match2[1]                      // => 'at0'
        var aft = col_.replace(match2[0],'_')    // => _gen
    } else {
        var col = col_.slice(1)                  // at0*gen
        var aft = ''
    }
    var i = spa.data[0].indexOf(col)             // has column 'at0'
    return i ? (spa.data[1][i]+aft) : col        // yes: at0 + '_gen' ('2023-07-01_gen'); no: 'at0*gen''
}

function savePinP(inside = '#output') {
        document.querySelector(inside + ' td .js-plotly-plot').setAttribute('id','pINp1')
        savePlotlyHTml('pINp1')
} //document.querySelector('#output td .js-plotly-plot')
function savePlotlyHTml(cht="chart_2", saveBtton = false) {
    var cdn = {}
    cdn.jQuery = '<script src="https://code.jquery.com/jquery-3.5.1.min.js" integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=" crossorigin="anonymous"></script>' 
    cdn.plotly = ' <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>'
    cdn.d3     = ' <script src="https://syntagmatic.github.io/parallel-coordinates/examples/lib/d3.min.js"></script>'
    cdn.FileSaver = ' <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.0/FileSaver.min.js"></script>'

    cdn.jqxCSS = '<link rel="stylesheet" href="http://prodgrd02/lib/jqwidgets/styles/jqx.base.css" type="text/css" />'
    cdn.jqxCore = '<script type="text/javascript" src="http://prodgrd02/lib/jqwidgets/jqxcore.js"></script>'
    cdn.jqxData = '<script type="text/javascript" src="http://prodgrd02/lib/jqwidgets/jqxdata.js"></script>'
    cdn.jqxButtons = '<script type="text/javascript" src="http://prodgrd02/lib/jqwidgets/jqxbuttons.js"></script>'
    cdn.jqxScrollbar = '<script type="text/javascript" src="http://prodgrd02/lib/jqwidgets/jqxscrollbar.js"></script>'
    cdn.jqxDatatable = '<script type="text/javascript" src="http://prodgrd02/lib/jqwidgets/jqxdatatable.js"></script>'
    cdn.jqxTreeGrid = '<script type="text/javascript" src="http://prodgrd02/lib/jqwidgets/jqxtreegrid.js"></script>'
    cdn.jqxExport = '<script type="text/javascript" src="http://prodgrd02/lib/jqwidgets/jqxdata.export.js"></script>'
    cdn.jQwidget = [cdn.jqxCSS, cdn.jqxCore, cdn.jqxData, cdn.jqxButtons, cdn.jqxScrollbar, cdn.jqxDatatable, cdn.jqxTreeGrid, cdn.jqxExport].join(' ')

    var html = '<html><head> ]cdn[ </head>\
    <body><div id="chart_2" style="height: 90%; width: 100%;" class="plotly-graph-div"></div> \
    <button onclick="saveCSV2()" title="export data to CSV">export data to a csv file</button> \
    <span style = "color:green; font-family: Courier New; font-size:24px"> Created by the Interactive Data Dashboard at: <b>http://prodgrd02/pivot1</b> ( use <b>Chrome</b> to open ) </span> \
    <script> ]data[ </script> <script> ]viz[ </script> <script> ]saveFun[ </script></body> </html>' 
    // html = html + " <script> " + saveCSV2.toString() + " </script>"
    if ($('#chtType_2 option:selected').text() == 'table') {     // table data based on jQwidgets' treegrid
        html = html.replace("]cdn[", cdn.jQuery + cdn.d3 + cdn.FileSaver + cdn.jQwidget)
        html = html.replace("]data[","vizTableData = JSON.parse('" +JSON.stringify(spa.vizTableData) +"')")
        html = html.replace("]viz[", upd_treeGridHM.toString() +  "; upd_treeGridHM('#chart_2',vizTableData.dataFields, vizTableData.columns, vizTableData.data,true)")
        if (saveBtton) html = html.replace("]saveFun[","function saveCSV2() {$('#chart_2').jqxTreeGrid('exportData', 'csv','')}")
    } else {                                                     // data from plotly chart
        html = html.replace("]cdn[", cdn.jQuery + cdn.plotly + cdn.d3 + cdn.FileSaver)
        html = html.replace("]data[", "]ttttrace[; ]llllayout[;")
        html = html.replace("]ttttrace[","traces = JSON.parse('" +JSON.stringify(document.getElementById(cht).data) +"')")
        html = html.replace("]llllayout[","layout = JSON.parse('" +JSON.stringify(document.getElementById(cht).layout) +"')")  
        html = html.replace("]viz[", 'window.PLOTLYENV=window.PLOTLYENV || {};window.PLOTLYENV.BASE_URL="https://plot.ly";Plotly.newPlot("chart_2", traces, layout, {"showLink": false, "linkText": "", scrollZoom: true}) ')      
        var toggleEdit =`$("text:contains('edit...')")[0].addEventListener("click", function () { toggleChtEdit();})` + 
        `;$("text:contains('aggRL')")[0].addEventListener("click", function () { togglAggAxis()})`
        html = html.replace("]saveFun[",saveCSV2.toString() + ';')  

        if (saveBtton) {
            // html = html.replace("]saveFun[",saveCSV2.toString() + "\n" + toggleChtEdit.toString() + "\n" + togglAggAxis.toString()+ ';' + toggleEdit +';' + contains.toString())  
        } else {
            // html = html.replace("]saveFun[",toggleChtEdit.toString() + "\n" + togglAggAxis.toString()+ ';' + toggleEdit +';' + contains.toString())  
            html = html.replace("button onclick=", "button disabled onclick=")
        }
    }
    // save var html as a html file
    var blob = new Blob([html], {type: "text/csv;charset=utf-8"});
    saveAs(blob, 'cht_'+ d3.time.format("%Y%m%d%H%M%S")(new Date()) +'.html');	
}
function saveCSV2(cht="chart_2", fmt = "%Y-%m-%d %H:%M") {
    if (cht=="chart_2" && $('#chtType_2 option:selected').text().includes('table') ) {
        $("#chart_2").jqxTreeGrid('exportData', 'csv','')
    } else {                         // courve
        var data_csv = [];        
        if ($('#chtType_2 option:selected').text() == 'pc') {          // for pc data
            data0 = getBrushedData("chart_2")
            var keys = data0.map((v,i) => {return {i: i, k: v.name}})
            data0[0].v.forEach((v1,i) => {
                var row = {}
                keys.forEach(k => {
                    row[k.k] = data0[k.i].v[i]
                })
                data_csv.push(row)
            })
        } else if ($('#chtType_2 option:selected').text() == 'duration'){    // for duration curve's data
            var data0 = document.getElementById(cht).data
            for (var i = 0; i < data0.length; i++) {
                data0[i].y.forEach((v, i1) => { 
                    if (i == 0) {                                      // init 
                        data_csv[i1]={} 
                    }
                    data_csv[i1][data0[i].name+'_x'] = data0[i].x[i1]; 
                    data_csv[i1][data0[i].name+'_y'] = v; 
                })
            }
        } else {                                                       // for other, with direct data
            var data0 = document.getElementById(cht).data
            data0[0].x.forEach((v, i) => {                             // fo rthe 1st: init & time column, val column 
                data_csv[i] = {}; 
                data_csv[i].time = d3.time.format(fmt)(new Date(data0[0].x[i])); 
                // data_csv[i].time = (new Date(data0[0].x[i])).toLocaleDateString + ' ' + (new Date(data0[0].x[i])).toLocaleTimeString; 
                data_csv[i][data0[0].name] = data0[0].y[i]; 
            })
            for (var i = 1; i < data0.length; i++) {                   // for the rest: val column
                data0[i].y.forEach((v, i1) => { data_csv[i1][data0[i].name] = v; })
            }
        }
        var blob = new Blob([d3.csv.format(data_csv)], {type: "text/csv;charset=utf-8"});
        saveAs(blob, 'data_'+ d3.time.format("%Y%m%d%H%M%S")(new Date()) +'.csv');
    }
}
function saveGeoJson() {
    let data = Object.values(spa.mpid._layers).map(v => {
        return {
            type: "Feature",
            geometry: { 
                type: v._latlng? "Point": (v._arrowheads ? 'LineString' : 'Polygon'), 
                coordinates: v._latlng? [v._latlng.lng, v._latlng.lat] : 
                (v._latlngs[0][0]? v._latlngs.map(d => d.map(e => [e.lng, e.lat])) 
                : v._latlngs.map(d => [d.lng, d.lat]))
            },
            properties: { 
                'stroke' : v.options.color || 'blue',
                'stroke-width':  v.options.weight || 1,
                'stroke-opacity': v.options.opacity || 1,
                'fill': v.options.fillColor,
                'fill-opacity': v.options.fillOpacity,
                'name': v._popup?._content.match(/td.+?\/td/g)?.[1]?.slice(3,-4), // the 2nd <td>
                'description': v._popup?._content
            }
        }
    })
    data = {type:'FeatureCollection',features:data}
    const jsonString = JSON.stringify(data, null, 2);              // 第二个参数为replacer，第三个参数为缩进空格数  
    const blob = new Blob([jsonString], { type: 'application/json' }); // 创建一个Blob对象，类型设置为'application/json'
    saveAs(blob, 'data_'+ d3.time.format("%Y%m%d%H%M%S")(new Date()) +'.json');
}
function saveKML() {      // to be ..................................................
    if (0 == 1) {   // different way, to be ..................................................
        let kml_ = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <kml xmlns="http://earth.google.com/kml/2.1">
        <Document>
            <name>saved_KML</name>
            <open>true</open>
            _Style_
            _Placemark_
        <Document>
        `
    
        let style_ = '<Style id="_styleName"><LineStyle>_linestyle_</LineStyle> <PolyStyle>_polystyle_</PolyStyle> <IconStyle>_iconstyle_</IconStyle> <LabelStyle>_labelstyle_<LabelStyle></Style>'      
        let linestyle_ = '<Style id="_styleName"><LineStyle>_linestyle_</LineStyle> <PolyStyle>_polystyle_</PolyStyle> </Style>'      
        let polystyle_ = '<Style id="_styleName"><IconStyle>_iconstyle_</IconStyle> <LabelStyle>_labelstyle_<LabelStyle></Style>'          
        let placemark_ = "<Placemark><name>_placemarkName_</name><styleUrl>#_lineStyle_</styleUrl><ExtendedData>_extendeddata_</ExtendedData>...</Placemark>"       
        let linestring_ = "<LineString><coordinates>...</coordinates></LineString>"
        let polygon_ = "<Polygon><coordinates>...</coordinates></Polygon>"
        let point_ = "<Point><coordinates>...</coordinates></Point>"
        
        let styleD = []      
        let placemarkD = [] 
    }
    var _placemarks = []
    var _placemark = {Placemark:{}}
    var _styles = {}
     Object.values(spa.mpid._layers).forEach(v => {
         let _type = v._latlng ? "Point" : (v._arrowheads ? 'LineString' : 'Polygon')
         switch (_type) {
             case 'Point':
                 _placemark.Placemark[_type] = { 
                    coordinates:  [v._latlng.lng, v._latlng.lat,0].join(',')
                }
                 break;
             case 'LineString':
                 _placemark.Placemark[_type] = { 
                    coordinates: v._latlngs.map(v => [v.lng,v.lat,0].join(',')).join(' ')
                }
                 break;
             case 'Polygon':
                 _placemark.Placemark[_type] = { outerBoundaryIs: {LinearRing:{
                    coordinates: v._latlngs.map(v => [v.lng,v.lat,0].join(',')).join(' ')
                }}}
                 break;
         }
         _placemark.Placemark.name = ''
         _placemark.Placemark.styleUrl = ''
         _placemark.Placemark.ExtendedData = ''

        let _placemarkName_ = v._popup?._content.match(/td.+?\/td/g)?.[1]?.slice(3,-4) // the 2nd <td>
        // let _type = v._latlng? "Point": (v._arrowheads ? 'LineString' : 'Polygon')
        let _lineStyle_
        let _extendeddata_
        let _detail_

        let _placemark = placemark_.replace('_placemarkName_', _placemarkName_).replace('_lineStyle_', _lineStyle_).replace('_extendeddata_', _extendeddata_).replace('...', _detail_)


        //

        return {
            type: "Feature",
            geometry: { 
                type: v._latlng? "Point": (v._arrowheads ? 'LineString' : 'Polygon'), 
                coordinates: v._latlng? [v._latlng.lng, v._latlng.lat] : 
                (v._latlngs[0][0]? v._latlngs.map(d => d.map(e => [e.lng, e.lat])) 
                : v._latlngs.map(d => [d.lng, d.lat]))
            },
            properties: { 
                'stroke' : v.options.color || 'blue',
                'stroke-width':  v.options.weight || 1,
                'stroke-opacity': v.options.opacity || 1,
                'fill': v.options.fillColor,
                'fill-opacity': v.options.fillOpacity,
                'name': v._popup?._content.match(/td.+?\/td/g)?.[1]?.slice(3,-4), // the 2nd <td>
                'description': v._popup?._content
            }
        }
    })
    data = {type:'FeatureCollection',features:data}
    // const jsonString = JSON.stringify(data, null, 2);                  // 第二个参数为replacer，第三个参数为缩进空格数  
    // const blob = new Blob([jsonString], { type: 'application/json' }); // 创建一个Blob对象，类型设置为'application/json'
    // saveAs(blob, 'data_'+ d3.time.format("%Y%m%d%H%M%S")(new Date()) +'.kml');
}
function saveCSV(transpose = 0, d = spa.data, fix = 3) {
    if (fix >=0) {
        fix = 10**fix
        d = d.slice(1).map(v => d[0].reduce((obj, key, index) => { obj[key] = (typeof(v[index])=='number' ? Math.round(v[index]*fix)/fix : v[index]) ; return obj }, {}))    
    }
    if (transpose === 1) {
        // Transpose the object array
        const keys = Object.keys(d[0]); // Extract keys (column names)
        const transposed = keys.map(key => [key, ...d.map(row => row[key])]); // Transpose rows and columns

        // Convert transposed data to CSV format
        const transposedCSV = transposed.map(row => row.join(",")).join("\n");

        // Save the transposed CSV
        const blob = new Blob([transposedCSV], { type: "text/csv;charset=utf-8" });
        saveAs(blob, 'transposed_data_' + d3.time.format("%Y%m%d%H%M%S")(new Date()) + '.csv');
        return; // Exit after saving transposed data
    }
    try {
        var blob = new Blob([d3.csv.format(d)], { type: "text/csv;charset=utf-8" });
    }
    catch(err) {
        d = d.map(v => Object.fromEntries(Object.entries(v).map(([key, value]) => [key, String(value)])))  // change to string
        var blob = new Blob([d3.csv.format(d)], { type: "text/csv;charset=utf-8" });
    }
    saveAs(blob, 'data_' + d3.time.format("%Y%m%d%H%M%S")(new Date()) + '.csv');
}
function wrapLiDivPairs() {  // this is NOT working
    // const td = document.getElementById('target-cell');
    const td = document.getElementsByClassName('pvtAxisContainer')[0]
    const children = Array.from(td.children);
    const pairs = [];
    let currentLi = null;

    // Iterate over children to pair li and div elements
    children.forEach(child => {
        if (child.tagName === 'LI') {
            currentLi = child;
            pairs.push([currentLi, []]);
        } else if (currentLi && child.tagName === 'DIV') {
            pairs[pairs.length - 1][1].push(child);
        }
    });

    // Clear the td element
    td.innerHTML = '';

    // Wrap each pair in a span and append back to td
    pairs.forEach(pair => {
        const span = document.createElement('span');
        span.className = 'item-pair';
        span.appendChild(pair[0]);
        pair[1].forEach(div => span.appendChild(div));
        td.appendChild(span);
    });
}

const pdf1 = () => {
    const element = document.querySelector('td.pvtRendererArea'); // The element to export

    // Get the width and height of the content
    const contentWidth = element.scrollWidth; // Use scrollWidth to include padding
    const contentHeight = element.scrollHeight; // Use scrollHeight to include padding

    // Define the page size (in inches)
    const pageWidth = 11; // Width of a standard letter page in inches (landscape)
    const pageHeight = 8.5; // Height of a standard letter page in inches (landscape)

    // Calculate the scale to fit the content into the page width and height
    const scaleWidth = pageWidth / (contentWidth / 96); // 96 DPI (pixels per inch)
    const scaleHeight = pageHeight / (contentHeight / 96); // Scale for height
    const scale = Math.min(scaleWidth, scaleHeight)*2; // Use the smaller scale to fit both dimensions

    // Adjust the canvas size to fit the content
    const opt = {
        margin: 0.5, // Adjust margins as needed
        filename: `${new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15)}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: {
            scale: scale, // Dynamically calculated scale
            useCORS: true // Enable cross-origin resource sharing if needed
        },
        jsPDF: {
            unit: 'in',
            format: 'letter',
            orientation: 'landscape'
        }
    };

    // Render the content and save as PDF
    html2pdf().set(opt).from(element).toPdf().get('pdf').then((pdf) => {
        const totalPages = Math.ceil(contentHeight / (pageHeight * 96 / scale)); // Calculate total pages
        for (let i = 1; i < totalPages; i++) {
            pdf.addPage(); // Add a new page for each overflow
            pdf.setPage(i + 1);
        }
    }).save();
};
function add2pdf(ord = '1st',pagebreaker=0) {
    spa.vizArea = document.querySelector('td.pvtRendererArea')
    spa.clonedVizArea = spa.vizArea.cloneNode(true); // 'true' means deep clone (includes children)
    let pdfDiv = document.getElementById('pdf')
    if (ord == '1st') {
        if (pdfDiv.innerHTML === '') {
            pdfDiv.appendChild(spa.clonedVizArea)
        } else {
            if (pagebreaker == 0) {
                pdfDiv.insertBefore(document.createElement('br'), pdfDiv.firstChild);
            } else {
                const pageBreak = document.createElement('div');
                pageBreak.className = 'page-break';
                pdfDiv.insertBefore(pageBreak, pdfDiv.firstChild);
            }
            pdfDiv.insertBefore(spa.clonedVizArea, pdfDiv.firstChild);
        }
    } else {
        if (pagebreaker == 0) {
            pdfDiv.appendChild(document.createElement('br'))
        } else {
            const pageBreak = document.createElement('div');
            pageBreak.className = 'page-break';
            pdfDiv.appendChild(pageBreak);
        }
        pdfDiv.appendChild(spa.clonedVizArea)
    }
}
function clr_pdf() {
    document.getElementById('pdf').innerHTML = ''
}
const pdf = (back=0,path ='', exName='',tname=1,newPath='y') => {
    // const element = document.querySelector('td.pvtRendererArea'); // The element to export
    const element = document.getElementById('pdf'); // The element to export
    if (element.innerHTML =='') add2pdf()
    // Get the width and height of the content
    const contentWidth = element.scrollWidth; // Use scrollWidth to include padding
    const contentHeight = element.scrollHeight; // Use scrollHeight to include padding

    // Define the page size (in inches)
    const pageWidth = 11; // Width of a standard letter page in inches (landscape)
    const pageHeight = 8.5; // Height of a standard letter page in inches (landscape)

    // Calculate the scale to fit the content into the page width
    // const scaleWidth = pageWidth / (contentWidth / 96); // 96 DPI (pixels per inch)
    // const scaleHeight = pageHeight / (contentHeight / 96); // Scale for height
    // const scaleWidth =  (contentWidth / 96) / pageWidth; // 96 DPI (pixels per inch)
    // const scaleHeight = (contentHeight / 96) / pageHeight; // Scale for height
    // const scale = Math.min(scaleWidth, scaleHeight) * 2; // Slightly reduce the scale to ensure it fits
    let pdfName //= `${new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15)}${eName}.pdf`
    if (tname == 1) {
        pdfName = `${new Date().toString().replace(/[-:.]/g, '')}${exName}.pdf`
    } else {
        pdfName = `${exName}.pdf`
    }
    const opt = {
        margin: 0.5, // Adjust margins as needed
        filename: pdfName,
        image: { type: 'jpeg', quality: 1},
        // html2canvas: { scale: Math.max(2, scale) }, // Dynamically calculated scale
        html2canvas: { scale: 1 }, // Dynamically calculated scale
        jsPDF: { unit: 'in', format: 'A3', orientation: 'landscape' }
    };
    if (back!=2) html2pdf().set(opt).from(element).save();
    if (back!=0) {
        port = getUrlVars()['port']||'8188'
        let subFolder = path.split('/').slice(0,-1).join('/')
        const networkFolderParam = encodeURIComponent(subFolder);
        html2pdf().set(opt).from(element).outputPdf('blob').then(function (pdfBlob) {
            const formData = new FormData();
            formData.append('file', pdfBlob, path.split('/').slice(-1)[0]);
            fetch(`http://prodgrd02:${port}/upload-file?network_folder=${networkFolderParam}&newPath=${newPath}`, {
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
                .then(result => {
                    console.log('Server response:', result);
                })
                .catch(error => {
                    console.error('Upload failed:', error);
                });
        });
    }

};
    
if (getUrlVars()["font"] == '1') {

    const style = document.createElement('style');
    style.type = 'text/css';

    // Define the CSS rules
    const css = `
                th {  
                font-weight: normal !important;
                padding: 3px !important;}` // th, td
    //Add the CSS rules to the style element
    style.appendChild(document.createTextNode(css));
    // Append the style element to the head of the document
    document.head.appendChild(style);

}

// function addUDF(data, udf) {


//     if (Array.isArray(data[0])) {  // key in 1st row

//     } else {                       // each row with key

//     }

      
// }

// tagname = [tag].split('EMS:')[1]?.split('@')[0];
// measure = [tagname]? (([tagname].split('.').length == 4)? [tagname].split('.')[3] : '---').replace(/[0-9]/g,'') : '---'

// {
//     "user columns" : "prefix = [tag].includes(':')? ([tag].includes('Disk(') ? [tag].split(')_')[1] : ([tag].includes('_Scheduled_Scans:') ? [tag].split(':')[1]: [tag].split(':')[0])   ) : '___';prefix_grp = [tag].includes(':')? ([tag].includes('Disk(') ? '_Disk_Status': ([tag].includes('_Scheduled_Scans:') ? '_Scheduled_Scans': [tag].split(':')[0]).replace(/[0-9]{1,4}/g,'#').replace(/\\s/g,'') ) : '___';substation = [tag].includes('EMS:')? [tag].split(':')[1].split('.')[0] : '---';station_grp = [substation].split('_')[0].replace(/^SS[0-9].*/,'SS#').replace(/^A?([0-9])([0-9]*)S?P?/, '$1-S|P');where=[tag].split('@')[1]?.split('!')[0];suffix = [tag].split('@')[1]?.split('!')[1]"
//     }
// setTimeout(wrapLiDivPairs, 5000) not working