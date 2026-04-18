var sqlExample = {
    pi: [
        "\n\n====== example sql ======",
        "SELECT time, value FROM [piarchive]..[piavg] WHERE tag = 'EMS:AIES.INST_SYS_LOAD@GEN!AVN' and timestep = '1h' AND time BETWEEN '2021-01-01' AND '2021-01-11'",
        "SELECT time, value FROM [piarchive]..[piinterp2] WHERE tag = 'EMS:AIES.INST_SYS_LOAD@GEN!AVN' and timestep = '1h' AND time BETWEEN '2021-01-01' AND '2021-01-11'",
        "SELECT time, value FROM [piarchive]..[picomp] WHERE tag = 'EMS:AIES.INST_SYS_LOAD@GEN!AVN' AND time BETWEEN '2021-01-01' AND '2021-01-01 1:00'",
        "SELECT tag,changedate,creationdate,exdesc,instrumenttag,engunits,shutdown FROM [pipoint].[classic] WHERE (tag like 'EMS:ASSET.%.MC.INUSE@GEN!AVN') and changedate >= '2020-01-01'"
    ],    
    aurora: [
        "\n\n====== example sql ======",
        "SELECT *  FROM [CA_EMMA201_output_2021LTO_Flex_CT_0830_6hfc_EoYLeapAdj].[dbo].[_Input_Resources1]",
        "SELECT *  FROM [CA_EMMA201_output_2021LTO_Flex_CT_0830_6hfc_EoYLeapAdj].[dbo].[ResourceGroupYear1]",
        "SELECT [Name],[Capability],[Capacity],[Nameplate_Capacity],[Full_Load_Heat_Rate],[Minimum_Capacity],[Output_MWH],[Report_Year],[Report_Month],[Report_Day],[Report_Hour],[Run_ID],[Risk_Iteration],[ID],[Rpt_AssetType],[Rpt_ASN],[Rpt_Inertia] FROM [CA_EMMA201_output_2021LTO_Flex_CT_0830_6hfc_EoYLeapAdj].[dbo].[ResourceHour1] where [Report_Year] = 2021 and [Rpt_AssetType] in ('CC') and [ID] like '%'",
        "EXEC SPA_mhu.dbo.emmo @db = 'CA_EMMA201_output_2021LTO_Flex_CT_0830_6hfc_EoYLeapAdj', @prd='2021_01_01%'"
    ],
    aurorarbasql: [
        "\n\n====== example sql ======",
        "SELECT *  FROM [NS_CAT211Q3_P2566 _P2569_20220831_input].[dbo].[2021LTO_RB_0416]"     
    ]
}


function getData0(url) {
    return new Promise ((resolve, reject) => {
        $.ajax({
            type: "get",
            url: url,
            success: function (returnval) {
                resolve(returnval)
            },
            error: function(returnval) {
                reject(0)
            }
        })
    })
}

async function queryData(cbFun = null){
    spa_cfg_default = spa.cfg?.default? spa.cfg.default : {}
    var db = document.getElementById('database').value.toLowerCase() || spa.db
    if (db == '...') {
        if (spa.db) {
            document.getElementById('database').value = spa.db.toUpperCase()
            queryData()
        }
        // document.getElementById('sqlText').value = ''
        return
    }
    var sql = document.getElementById('sqlText').value.replaceAll('\n',' ')
    var renderers = $.extend(
        $.pivotUtilities.renderers,
        $.pivotUtilities.plotly_renderers,
        $.pivotUtilities.d3_renderers,
        $.pivotUtilities.export_renderers
        );
        spa.renderers = renderers
    if (sql.length <= 10) {  // no input or <=10 length input, put sample query
        if (db == "pi") sql = "SELECT time, value FROM [piarchive]..[piavg] WHERE tag = 'EMS:AIES.INST_SYS_LOAD@GEN!AVN' and timestep = '1h' AND time BETWEEN '2021-01-01' AND '2021-01-11'" + sqlExample.pi.join('\n')
        if (db == "aurora") sql = "SELECT *  FROM [CA_EMMA201_output_2021LTO_Flex_CT_0830_6hfc_EoYLeapAdj].[dbo].[ResourceGroupYear1]" + sqlExample.aurora.join('\n')
        if (db == "aurorarbasql") sql = "SELECT *  FROM [NS_CAT211Q3_P2566 _P2569_20220831_input].[dbo].[2021LTO_RB_0416]" + sqlExample.aurora.join('\n')
        if (db == "mhuBE") sql = 'http://prodgrd02:8188/getFile/fth?id=all&path=B:/mhu/python/dataQulity/past_6month.fth'
        // if (db == "api") sql = 'http://prodgrd02:8188/getFile/fth?id=all&path=B:/mhu/python/dataQulity/past_6month.fth'


        'http://prodgrd02:8188/getFile/fth?id=all&path=B:/mhu/python/txu/2019.fth'
        document.getElementById('sqlText').value = sql
    } else {
        if (!sql.match(/^(select)|^(exec spa_mhu)/i)  && (db == "aurora")) {   //checking SQL injection for aurora
            document.getElementById('sqlText').value = "please check you SQL & be :)"
            return
        }
    }
    $("#output").html("<p align='center' style='color:grey;'>(...querying...)</p>")
    if (sql.includes('http://prodgrd02:') || sql.includes('http://devgrd02')) {
        if (sql.match(/^http:\/\/[A-z0-9]{4,20}:[0-9]+\/ddb/i)) {
            var url0 = sql
        } else if (sql.match(/__.{0,50}__/)) {
            var url0 = "http://prodgrd02:8188/apis/?api=" +sql.replaceAll('&','0000_0000').replaceAll('?','1111_1111')
        } else {
            var url0 = sql
        }
    } else {
        var url0 = "http://prodgrd02:8188/sql/?db="+db+"&sql="+sql.split('===')[0]
    }
    try {        //async & await
        if (getUrlVars()['port']) url0 = url0.replaceAll(':8188',':'+getUrlVars()['port'])
        url0 = url0.replaceAll(`\\\\\aeso`,'//aeso').replace(/ $/,'')
        url0 = url0.replaceAll(' ','%20').replaceAll('+','%2B')
        console.log('getData0 start: ' + (new Date().toLocaleTimeString()))
        var d = await getData0(url0)
        console.log('getData0   end: ' + (new Date().toLocaleTimeString()))
        // if (!d.data[1]) d.data[1] = d.data[0].map((v,i) => '')  // if no header, add index as header
        // spa.data = spa.cfg?.unpivot? unpivotUser(d.data) :  d.data
        if (!d.data) d = {data: d}
        spa.data = spa.cfg?.unpivot? unpivotUser(d.data) : (spa.cfg?.pivot? pivotCols(d.data, spa.cfg.pivot) : d.data)  
        _ = {}    
        Object.keys(d).filter(k => k!='data').forEach((k1,i) => {
            _[['m'+i]]=d[k1] 
        }) 
        if (window.dataReady_) {  // excute code in UDF
            await dataReady_()
            if (getUrlVars()['scsv']) {
                document.getElementById("scsv").checked = true 
                document.getElementById("scsv").disabled = true
            } 
            if (document.getElementById("scsv").checked) saveCSV()
        }
        $("#output").html("<p align='center' style='color:grey;'>(...data returned...)</p>")
        if (document.getElementById('dynamicDropdown') && (getUrlVars()['data0']||5)!=5) spa.data0 = spa.data.slice(0).map(v => [...v])  // URL parameter data0, make a copy of data after UDF.js
        $("#output").pivotUI(await prcsData(spa.data), 
        { 
            renderers: renderers , 
            onRefresh: async function(config) {
                toggleTotals()
                var config_copy = JSON.parse(JSON.stringify(config));
                spa.cfg_copy = config_copy;
                if (!spa.cfg) spa.cfg = {}
                if (config_copy.cols.length + config_copy.rows.length > 0) {
                    spa.cfg.user = config_copy
                    if (spa.cfg.user.inclusions?.value) delete(spa.cfg.user.inclusions.value)
                } else {
                    config_copy = spa.cfg.default
                }
                if (config_copy) {
                    //delete some values which are functions
                    delete config_copy["aggregators"];
                    delete config_copy["renderers"];
                    //delete some bulky default values
                    delete config_copy["rendererOptions"];
                    delete config_copy["localeStrings"];
                    if (config_copy.inclusions?.value) delete(config_copy.inclusions.value)
                    console.log(JSON.stringify(config_copy, undefined, 2));
                }
                if (window.vizReady_) {  // excute code in UDF
                    // const divViz = document.querySelector('td.pvtRendererArea')
                    // let elm = await vizReady_()
                    // divViz.insertBefore(elm, divViz.firstChild)
                    // // divViz.appendChild(document.createElement('br'))
                    // // divViz.appendChild(elm)
                    await vizReady_()
                }
                if (spa.cfg?.vizHead) {
                    let div = document.createElement('div')
                    div.innerHTML = spa.cfg.vizHead
                    const divViz = document.querySelector('td.pvtRendererArea')
                    divViz.insertBefore(div, divViz.firstChild)
                }
                if (spa.cfg?.vizFoot) {
                    let div = document.createElement('div')
                    div.innerHTML = spa.cfg.vizFoot
                    const divViz = document.querySelector('td.pvtRendererArea')
                    divViz.appendChild(div) // divViz.insertBefore(div, null)       
                }                
            },
            ...(spa.cfg?.user||spa_cfg_default) // keep the on-the-fly layout
        }, true);
    } catch (err) {
        $("#output").html("<p align='center' style='color:grey;'>(...data error... from query0.js => queryData() => line@117)</p>")
    }      
    // try{
    //     wrapLiDivPairs() 
    // } catch {}
    
}   

function pivotUpdate(div = "#output", data = $.pivotUtilities.tipsData, rendererSize = {}
    , rows = [null], cols = [null], vals = [null], aggregatorName = 'Count',   //Average
    rendererName = "Table") {
    if (data.length==0) return  
    var renderers = $.extend(
        $.pivotUtilities.renderers,
        $.pivotUtilities.plotly_renderers,
        $.pivotUtilities.d3_renderers,
        $.pivotUtilities.export_renderers
        );
    $(div).pivotUI(
        data, {
        renderers: renderers,
        rows: rows,
        cols: cols,
        vals: vals,
        aggregatorName: aggregatorName,
        rendererName: rendererName,
        rendererOptions: rendererSize //{ plotly: {width: 600, height: 600} }
    });
}
function pivotCols_old(d, pivotHow) {
    if (!pivotHow?.length) {
        return d
    } else if (pivotHow[0].includes('?')) return d
    var arrOnly = false
    if (d[0].length) {
        d = d.slice(1).map(dd => {
            return Object.fromEntries(d[0].map((v,i) => [v, dd[i]]))
        })
        var arrOnly = true
    }    
    var col1 = pivotHow[0]
    var col2 = pivotHow[1]
    var c12 = [col1, ...col2]
    var d_ = {}
    d.forEach(it => {
        it_ = Object.entries(it)
        var k = it_.reduce((acc, e) => [acc, (c12.includes(e[0]) ? '' : e[1])].join('_'), '')
        if (!d_[k]) d_[k] = Object.fromEntries(it_.filter(v => !c12.includes(v[0])))
        d_[k]['pvt#Col'] = d_[k]['pvt#Col'] ? d_[k]['pvt#Col'] : 0
        col2.forEach(c => {
            var k1 = String(it[col1]).replace(/^.*:/g, '').replace(/@.*!/g, '_')
            d_[k][k1] = it[c]
            d_[k]['pvt#Col'] = d_[k]['pvt#Col'] + 1
        })
    })
    if (arrOnly) {
       _d = Object.values(d_)
       var d0 = Object.keys(_d[0])
       var d1 = _d.map(v => {
            return d0.map(k => v[k])        
       })
       return [d0, ...d1]
    }
    return Object.values(d_)
}
function pivotCols(d, pivotHow, short=1) {   // pivotHow['name1', ['value']]
    if (!pivotHow?.length) {
        return d
    } else if (pivotHow[0].includes('?')) return d

    var arrOnly = false
    if (d[0].length) {
        d = d.slice(1).map(dd => {
            return Object.fromEntries(d[0].map((v,i) => [v, dd[i]]))
        })
        var arrOnly = true
    }  

    var col1 = pivotHow[0]      // 'name1'
    var col2 = pivotHow[1]      // ['value', ...]
    var c12 = [col1, ...col2]   // ['name1','value', ...]
    var d_ = {}
    d.forEach(it => {
        it_ = Object.entries(it)
        var k = it_.reduce((acc, e) => [acc, (c12.includes(e[0]) ? '' : e[1])].join('_'), '')  // key by join the value in other columns
        if (!d_[k]) d_[k] = Object.fromEntries(it_.filter(v => !c12.includes(v[0])))
        // d_[k]['pvt#Col'] = d_[k]['pvt#Col'] ? d_[k]['pvt#Col'] : 0                         // count repeat of k
        col2.forEach((c,i) => {       // loop ['value', ...]
            var k1 = String(it[col1]).replace(/^.*:/g, '').replace(/@.*!/g, '_') + ((i==0 && short==1) ? '' : '_' + c)     // simplyfy the PI tag
            d_[k][k1] = it[c]
            // d_[k]['pvt#Col'] = d_[k]['pvt#Col'] + 1                                         // count repeat of k
        })
    })
    if (arrOnly) {
        _d = Object.values(d_)
        var d0 = Object.keys(_d[0])
        var d1 = _d.map(v => {
             return d0.map(k => v[k])        
        })
        return [d0, ...d1]
     }    
    return Object.values(d_)
}
//pivotCols(brkDateTime(d), spa.pivot)