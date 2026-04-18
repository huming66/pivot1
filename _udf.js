Date.prototype.getWeekNumber = function(){
  var d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
  var dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d - yearStart) / 86400000) + 1)/7)
};
Date.prototype.toStr = function(){
  const year = this.getFullYear();
  const month = String(this.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(this.getDate()).padStart(2, '0');
  const hours = String(this.getHours()).padStart(2, '0');
  const minutes = String(this.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};
Date.prototype.between = function(v1,v2) {return (this >= new Date(v1) && this <=new Date(v2))}
// Array1.prototype.subArray = function(subArray) {
  // const array = this; // Reference to the current array (the 'this' context)

  // // Ensure subArray is not empty
  // if (subArray.length === 0) return -1;

  // // Iterate over possible starting points in the main array
  // for (let i = 0; i <= array.length - subArray.length; i++) {
  //     let match = true;
  //     // Check if the sub-array matches the slice of the main array
  //     for (let j = 0; j < subArray.length; j++) {
  //         if (array[i + j] !== subArray[j]) {
  //             match = false;
  //             break;
  //         }
  //     }
  //     if (match) return i;
  // }
  
  // return -1; // Sub-array not found
// };
function _brkDateTime(d) { // indentify teh colum of datatime, break into year / month / day / hour
  if (1 == 0) {
    timePtn = ['####-##-##T##:##:##', '####-##-##HE##', '####-##-## ##:##:##', '##/##/#### #:##', '##/##/#### ##:##']
    var k = Object.keys(d[0])
    var ptn = ''
    var keyTime = ''
    k.some(kk => {
      ptn = String(d[0][kk]).replace(/[0-9]/g, '#').replace(/ /g, '')
      if (timePtn.includes(ptn)) {
        keyTime = kk
        return true
      }
    })
    if (keyTime == '') return d
	withMinute = d.some(v => +v[keyTime].slice(14,16) > 0)
    d.forEach((r, i) => {
      if (ptn.match(/[#-]{10}.[#:]{1,8}/)) {  //"2021-01-01T00:00:00", "2021-01-01T00:00:00" , "2021-01-01 2"
        d[i] = {
          ...Object.fromEntries([
            ['year', r[keyTime].slice(0, 4)],
            ['season', _season(r[keyTime].slice(5, 7))],
            ['month', String(+r[keyTime].slice(5, 7) + 0)],
            ['day', r[keyTime].slice(8, 10)],
            ['wDay', _wDay(r[keyTime].slice(0, 10))],
            ['hour', r[keyTime].slice(11, 13)],
			['minute',r[keyTime].slice(14,16)||'0']
            // [[timeKey],i]
          ].slice(0, withMinute? 7 : 6)), ...r
        }
        delete d[i][keyTime]
      } else if (ptn == '####-##-##HE##') { //2020-01-01 HE01
        d[i] = {
          ...Object.fromEntries([
            ['year', r[keyTime].slice(0, 4)],
            ['season', _season(r[keyTime].slice(5, 7))],
            ['month', r[keyTime].slice(5, 7)],
            ['day', r[keyTime].slice(8, 10)],
            ['wDay', _wDay(r[keyTime].slice(0, 10))],
            ['HE', r[keyTime].slice(14, 16)],
          ]), ...r
        }
        delete d[i][keyTime]
      }
    })
  }
  // timePtn_ = ['####-##-##T##:##:##','####-##-##HE##','####-##-## ##:##:##','##/##/#### #:##', '##/##/#### ##:##', '##/##/#### #:##']
  timePtn = /^[0-9]{1,4}[\-\/][0-9]{1,4}[\-\/][0-9]{1,4}[t ]?[0-9:]*$/i
  var k = d[0]
  var keyIdx
  var ptn
  d[3].some((v, i) => {   // using d[3] 
    ptn = String(v).match(timePtn)
    if (ptn) {
      keyIdx = i
      ptn = String(v).replace(/[0-9]/g, '#')
      return true

    }
  })
  if (!ptn) return d               // not matching
  var d0 = ['year', 'month', 'day']  // date part
  var withTime = ptn.includes(' ') || ptn.includes('T') || ptn.includes('HE')
  if (withTime) {
    var time_ = ptn.split(/[ tT]/)[1]    // 
    if (ptn.split(/[ tT]+/).length > 1) {  //with time
      d0 = [...d0, 'hour']
      time_ = ptn.split(/[ tT]/)[1]
      var HE = 0
    } else if (ptn.includes('HE')) {       // with HE
      d0 = [...d0, 'HE']
      time_ = time_ = ptn.split(/HE/i)[1]
      var HE = 1
    }
    var suf = time_.includes(':') ? '' : ':00' //add 00 minute for HE
	withMinute = d.some(v => +v[keyIdx].slice(14,16) > 0)
	if (withMinute) d0 =[...d0, 'minute']
  }
  d.forEach((row, i) => {
    if (i == 0) {
      d[0] = [...row.slice(0, keyIdx), ...d0, ...row.slice(keyIdx + 1)]
    } else {
      var dateTime_ = row[keyIdx].replace('HE', ' ').replace('T', ' ') + suf
      if (!dateTime_.includes(' ')) dateTime_ = dateTime_ + ' ' // date part only, add space for local time
      if (withTime) {
        if (HE == 0) {
          dateT = new Date(dateTime_)
          hr = dateT.getHours()
		  mn = dateT.getMinutes()
        } else {                      // for HE
          dateT = new Date(new Date(dateTime_) - 3600000)
          hr = dateT.getHours() + 1   // for HE
        }
        var dateTcmp = [dateT.getFullYear(), dateT.getMonth() + 1, dateT.getDate(), hr, mn].slice(0, withMinute? 5 : 4)
      } else {
        var dateTcmp = [dateT.getFullYear(), dateT.getMonth() + 1, dateT.getDate()]
      }
      d[i] = [...row.slice(0, keyIdx), ...dateTcmp, ...row.slice(keyIdx + 1)]
    }
  })
  return d
}
function _wDay(dateStr, gmt = false) {
  var dayOrder = [1, 2, 3, 4, 5, 6, 0]
  try {
    return dayOrder.indexOf(new Date(dateStr + (gmt ? '' : ' ')).getDay()) + 1
  } catch { return 0 }
}
function _season(mth) {
  return +mth < 5 ? 'winter' : (+mth > 10 ? 'winter' : 'summer')
}
function m(v, i = 0, j = 1, k = 'm0') {
  var r = ''
  if (typeof (i) == 'string') {i= _[k][0].indexOf(i)}
  if (typeof (j) == 'string') {j= _[k][0].indexOf(j)}
  _[k].some(mm => {
    if (mm[i] == v) {
      r = mm[j]
      return true
    }
  })
  return r
}
function _m(v, i = 0, j = 1, all = 0, k = 'm0') {
  var r
  if (typeof (i) == 'string') {i= _[k][0].indexOf(i)}
  if (typeof (j) == 'string') {j= _[k][0].indexOf(j)}
  if (typeof (v) == 'string') {
    var v1 = v.split(',')
    v1.reverse()
    v1 = v1.join(',')
  } else {
    v1 = v
  }
  if (all == 0) {
    r = _[k].find(mm => (mm[i] == v || mm[i] == v1))
    r = r ? r[j] : ''
  } else {
    r = _[k].filter(mm => (mm[i] == v || mm[i] == v1)).map(m1 => m1[j]).join(';')
    r = [... new Set(r.split(';'))].join(';')
  }
  return r
}
function ___subPair() {  // for coding dev & testing
  spa.data.forEach((v, i) => {
    if (!v['subPair']) {
      otherSub = spa.data.slice(i + 1).find(v1 => v1[7] == v[7])
      if (otherSub) v['subPair'] = v[14] + ',' + otherSub[14]
    }
  })
}
function __subPair(d) {  // for line segment mapping called at line 254 in function prcsData(data)
  n = d[0].length

  d.forEach((v, i) => {
    if (i == 0) {
      d[0][n] = 'subPair'
    } else if (!v[n]) {
      var otherSub = d.find((v1, i1) => (v1[7] == v[7] && i1 != i))
      if (otherSub) v[n] = v[14] + ',' + otherSub[14]
      v[n] = v[14] + ',' + (otherSub ? otherSub[14] : '_')
    }
  })
  return d
}
function __unMapped(d) { // for line segment mapping, called at line 254 in function prcsData(data), append a list of un-mapped at the end
  var basPairs = [... new Set(spa.data.slice(1).reduce((a, v, i) => [a, v[12]].join(';'), '').split(';'))].slice(1)
  _['m0'].slice(1).filter(v => !basPairs.includes(v[4]) && !basPairs.includes(v[4].split(';').slice().reverse().join(','))).map(v => {
    var newRow = Array(18).fill('____')
    newRow[0] = '____' + v[0]   // ____sgm
    newRow[11] = v[2]   // line
    newRow[17] = v[4]   // busPair
    newRow[16] = v[5]   // subPair
    d.push(newRow)
  })
  return d
}
// function __unMapped(d) { // for line segment mapping, called at line 254 in function prcsData(data), append a list of un-mapped at the end
//   var basPairs = [... new Set(spa.data.slice(1).reduce((a, v, i) => [a, v[12]].join(';'), '').split(';'))].slice(1)
//   _['m0'].slice(1).filter(v => !basPairs.includes(v[4]) && !basPairs.includes(v[4].split(';').slice().reverse().join(','))).map(v => {
//     var newRow = Array(18).fill('____')
//     newRow[0] = '____' + v[0]   // ____sgm
//     newRow[11] = v[2]   // line
//     newRow[17] = v[4]   // busPair
//     newRow[16] = v[5]   // subPair
//     d.push(newRow)
//   })
//   return d
// }
// #### 2024 for generation mapping
function __gMM(d) {
  n = d[0].length

  d.forEach((v, i) => {
    if (i == 0) {
      d[0][n] = 'mapping'
    } else if (!v[n]) {
      var otherSub = d.find((v1, i1) => (v1[7] == v[7] && i1 != i))
      if (otherSub) v[n] = v[14] + ',' + otherSub[14]
      v[n] = v[14] + ',' + (otherSub ? otherSub[14] : '_')
    }
  })
  return d
}
// #### end 2024 for generation mapping
function __stack(d) {    // for MPID cross checking
  var dd = [['Source', 'MPID', 'ATTR', 'Attr', 'Value']]
  var col_ = _.m0.slice(1).reduce((acc, [key, ...values]) => { acc[key] = values; return acc; }, {})
  d.slice(1).forEach(v => {
    d[0].forEach((k, j) => {
      if (col_[k]) {
        dd.push([col_[k][1], v[0], col_[k][0], k, v[j]])
      }
    })
  })
  return dd
}
function __mpidMap(d) {  // for MPID, real meater & reference MPID  (from Access)
  if (!spa['__mpidMap']) {
    d[0] = [...d[0], 'rMPID', 'rMPID_', 'refMPID']
    d.slice(1).forEach((v, i) => {
      var rMPID = _.m0.filter(r => r[0] == v[0]).map(v => v[1]).join(', ')
      var rMPID_ = _.m0.filter(r => r[0] == v[0]).map(v => v[3]).join(',')
      rMPID_ = [...new Set(rMPID_.split(','))].join(',')
      try {
        refMPID = rMPID.match(/^(.*?RMP)[0-9]{1,3}/)[1]
        refMPID = [...new Set(_.m0.filter(r => r[0] != v[0] && r[1].includes(refMPID)).map(v => v[0]))].join(',')
        d[i + 1] = [...d[i + 1], rMPID, rMPID_, refMPID]
      } catch {
        d[i + 1] = [...d[i + 1], rMPID, rMPID_, '_']
      }
    })
    // _updPivot('__mpidMap')  // __mpidMap takes too long ... dispatchEvent a refresh event    
  }
  return d

}
function __mvAvg(d,col,size) {
  if (typeof(col) == 'string') {col = d[0].indexOf(col)}
  d[0].push('mv' + size + d[0][col])
  let result = d.slice(1).map((row,i) => {
    let i0 = Math.max(0, i-step/2)
    let i1 = Math.max(0, i+step/2)
    let _arr = d[col].slice(i0,i1)
    return Math.sum(_arr) / _arr.length
  })
}
function _updPivot(id) {      // to trigger an pivot update ... not being used
  spa[id] = 'done'
  const textarea = document.getElementById('userCol');  // Create a new 'change' event
  const event = new Event('change');
  // Trigger the 'change' event on the textarea
  textarea.dispatchEvent(event);
}

async function eval1(funCall) {  //amsyn version for eval()
  if (funCall.trim().match(/await/)) {
    var fun = funCall.replace(/ *await */,'')
    fun = fun.trim().match(/(.*)\(/)[1]
    var para = funCall.match(/\((.*)\)/)[1]      //.replace(/'[^']*(,)[^']*'/, '______')
    para = para.split(',').map(v => v.trim()) //.replace(/^'|'$/g,""))
    if (fun == '_getPIData') {
      return await _getPIData(...para.map(v => eval(v)))
    } else if (fun == '__getPIData') {
      a =  await __getPIData(...para.map((v,i) => {
        if (i == 3) {                          // run if *at0*__ is true
          j = spa.data[0].indexOf(eval(para[1])+'__')
          return d[j]? 1 : 0
        }
        return eval(v)
      }))
      return a
      // return await __getPIData(...para.map(v => eval(v)))
    }
  }
  // console.log(funCall)
  return eval(funCall)
}
// for PI, get PI archieved data by tag(s) and time-stamp, can be merged with  __getPIData
async function _getPIData(tag = 'EMS:AIES.INST_SYS_LOAD@GEN!AVN', t0 = '2023-07-17 08:15', exec = 1) {
  if (exec == 0) return ''
  sqlInterp0 = "SELECT value FROM [piarchive]..[piinterp] WHERE tag in ('tagggg') AND time = 't0000'"
  url0 = spa.gbe + 'sql/?db=pi&sql='
  
  tags = tag.split(/[\*,;|]/)
  if (tags.length == 1) {           // single
    sqlInterp = sqlInterp0.replace('tagggg', tags[0]).replace('t0000', t0)
    var url0 = spa.gbe + 'sql/?db=pi&sql=' + sqlInterp
    try {        //async & await
      var d = await getData0(url0)
      return d['data'][1][0].toFixed(2)
    } catch (err) {
      $("#output").html("warning ... to get PI data 1.1 ... " + tags)
      return ''
    }
  } else {                          // miltiple
    tags = tags.map(v => "'"+v+"'").join(",")
    sqlInterp = sqlInterp0.replace("'tagggg'", tags).replace('t0000', t0)
    var url0 = spa.gbe + 'sql/?db=pi&sql=' + sqlInterp
    try {        //async & await
      var d = await getData0(url0)
      return d['data'].slice(1).reduce((acc,v) => acc+v[0], 0).toFixed(2)
    } catch (err) {
      $("#output").html("warning ... to get PI data 1.2 ... " + tags)
      return ''
    }
  }
}
// for PI, get PI archieved data by tag(s) and time-stamp, using pattern 1st
async function __getPIData(tag = 'EMS:AIES.INST_SYS_LOAD@GEN!AVN', t0 = '2023-07-17 08:15', ptn = 'EMS:ASSET.*.NET.P@GEN!AVN', exec = 1) {
  if (exec == 0) return ''
  if (!spa['____']) spa['____'] = {}

  if (ptn!='n') {                                               // get by patterns
    if (!spa['____'][ptn+t0]) {
      await ____getPIDataByPtn(ptn, t0)
    }
    var idx = spa.____[ptn+t0].data.map(v => v[0]).indexOf(tag)  // find in patterns
    if (idx > 0) {                                               // found
      var v = spa.____[ptn+t0].data.map(v => v[1])[idx]
      if (v =='') return ''
      return (+v).toFixed(1)
    }                                                            // no found
  }                                                            // no found
  sqlInterp0 = "SELECT value FROM [piarchive]..[piinterp] WHERE tag in ('tagggg') AND time = 't0000'"
  url0 = spa.gbe + 'sql/?db=pi&sql='
  
  tags = tag.split(/[\*,;|]/)
  if (tags.length == 1) {               // single
    var listSpc = [                     // using status other than value
      'EMS:AIES.TOTAL_CUR_GEN@GEN!AVN',
      'EMS:AIES.TOTAL_BIOM_GEN@GEN!AVN',
      'EMS:AIES.TOTAL_COAL_GEN@GEN!AVN',
      'EMS:AIES.TOTAL_ESR_GEN@GEN!AVN',
      'EMS:AIES.TOTAL_GAS_GEN@GEN!AVN',
      'EMS:AIES.TOTAL_HYDR_GEN@GEN!AVN',
      'EMS:AIES.TOTAL_SOLR_GEN@GEN!AVN',
      'EMS:AIES.TOTAL_WIND_GEN@GEN!AVN'
    ]

    if (listSpc.includes(tags[0])) {
      sqlInterp0 = sqlInterp0.replace('SELECT value','SELECT status')
    } 
    sqlInterp = sqlInterp0.replace('tagggg', tags[0]).replace('t0000', t0)
    var url0 = spa.gbe + 'sql/?db=pi&sql=' + sqlInterp
    try {        //async & await
      var d = await getData0(url0)
      return d['data'][1][0].toFixed(2)
    } catch (err) {
      $("#output").html("warning ... to get PI data 2.1 ... ___" + tags)
      return ''
    }
  } else {                               // miltiple
    tags = tags.map(v => "'"+v+"'").join(",")
    sqlInterp = sqlInterp0.replace("'tagggg'", tags).replace('t0000', t0)
    var url0 = spa.gbe + 'sql/?db=pi&sql=' + sqlInterp
    try {        //async & await
      var d = await getData0(url0)
      return d['data'].slice(1).reduce((acc,v) => acc+v[0], 0).toFixed(2)
    } catch (err) {
      $("#output").html("warning ... to get PI data 2.2 ... " + tags)
      return ''
    }
  }
}
// for PI, get PI archieved data by tags' pattern and time-stamp
async function ____getPIDataByPtn(ptn = 'EMS:ASSET.*.NET.P@GEN!AVN', t0 = '2023-07-17 08:15') {
  if (!spa['____']) spa['____'] = {}
  sqlInterp0 = "SELECT tag, value FROM [piarchive]..[piinterp] WHERE tag like ('tagggg') AND time = 't0000'"
  url0 = spa.gbe + 'sql/?db=pi&sql='

  sqlInterp = sqlInterp0.replace('tagggg', ptn).replace('t0000', t0)
  var url0 = spa.gbe + 'sql/?db=pi&sql=' + sqlInterp
  try {        //async & await
    var d = await getData0(url0)
    spa['____'][ptn + t0] = d
  } catch (err) {
    $("#output").html("warning ... to get PI data 3.0 ... " + ptn)
  }
  return 'ok'
}
// example:
// ____ = ____getPIDataByPtn('EMS:ASSET.*.NET.P@GEN!AVN',|at0|)
// *at0*gen = await __getPIData(|NET_GENERATION_PI_TAG|,|at0|,'EMS:ASSET.*.NET.P@GEN!AVN')
// *at0*gen = await _getPIData(|NET_GENERATION_PI_TAG|,|at0|)
function __diff(col) {
  let idx = spa.data[0].indexOf(col)
  let idx1 = spa.data[0].length
  spa.data[0].push(...['diff'+ col+'-', 'pstRampErr'])
  let n = 0, j = 0
  spa.data.forEach((v,i) => {   
    if (i == 0) return 
    if (spa.data[i][0] != spa.data[i-1][0]) {  // new AHEAD
      j = 0                                    
      n = n+1
    } else {                                   // check new period due to missing data
      let diffMN = (new Date(spa.data[i][1]) - new Date(spa.data[i-1][1])) / 60000
      j = (diffMN==10)? j : 0                 
    }  
    if (j >= n) {    // for PI diff change
      spa.data[i].push( spa.data[i-n][idx] - v[idx] )
    } else {spa.data[i].push( null )}
    
    if (j >= n*2) {  // for persistent-ramp error, diff-diff
      spa.data[i].push( spa.data[i][idx1] - spa.data[i-n][idx1] )
    }  else {spa.data[i].push( null )}
    j = j+1
  })
}
function __lookback(col, mth = 'diff', n = 1, ord='', item = '',prt='') {
  if (typeof(col) == 'string') {
    var idx = spa.data[0].indexOf(col)
  } else {
    idx = col
  }
  if (ord !='') {
    if (typeof(ord) == 'string') {
      var idxOrd = spa.data[0].indexOf(ord)
    } else {
      idxOrd = ord
    }  
  }

  if (item == '') item = col +'-' + mth + '_' + n
  spa.data[0].push(item)
  if (mth == 'diff') {
    if (ord == '') {
      spa.data.forEach((v,i) => {   
        if (i == 0) return 
        if (n==0) {   // diff_0: always based on 1st point
          spa.data[i].push( v[idx] - spa.data[1][idx] )          
        } else {      // diff_n
          if (i >= n+1) {    // for PI diff change
            spa.data[i].push( v[idx] - spa.data[i-n][idx] )
          } else {spa.data[i].push( null )}          
        }
      })
    } else {  // by partition
      var grp = [ ...new Set(spa.data.slice(1).map(v => v.filter((v1, i) => ![idx,idxOrd].includes(i)).join('|')))]
      var grpData = {}
      var data1 = spa.data.map((v,i)=> [...v, i])
      var _idx = data1[0].length-1
      grp.forEach(g => {
        var gData = data1.filter(v => v.filter((v1, i) => ![idx,idxOrd,_idx].includes(i)).slice(0,-1).join('|') == g) // filter
        gData = gData.map(v => [v[idxOrd], v[idx],v[v.length-1]]) // 3 columns [ord, value, idxLocal]
        if (typeof(gData[0][0]) == 'string') {
          gData.sort((a,b) => a[0].replace(/[^0-9]/g,'') - b[0].replace(/[^0-9]/g,'') )
        } else {
          gData.sort((a,b) => a[0]- b[0])
        }

        grpData[g] = gData
      })
      spa.data.forEach((v,i) => {   
        if (i == 0) return 
        var g = spa.data[i].filter((v1, j) => ![idx,idxOrd].includes(j)).join('|')  // group excluding value and order
        var idx0 = grpData[g].map(v => v[0]).indexOf(v[idxOrd])                     // get index of current order
        var idxP = n==0 ? 0: (idx0 - n)                                             // get index of previous period or the 1st period ... as the base to substract
        if (idxP >= 0) {    // for PI diff change
          spa.data[i].push( v[idx] - spa.data[grpData[g][idxP][2]][idx] )
        } else {spa.data[i].push( null )}
      })      
    }

  }
  if (mth == 'avg') {
    spa.data.forEach((v,i) => {   
      if (i == 0) return 
      if (i >= n+1) {    // for PI diff change
        spa.data[i].push( (v[idx] + spa.data[i-n][idx] ) / 2)
      } else {spa.data[i].push( null )}
    })
  }
  if (mth == 'mva') {
    let _sum = 0
    spa.data.forEach((v,i) => {   
      if (i == 0) return
      _sum = _sum + v[idx]
      if (i > n+1) {    // for PI diff change
        _sum = _sum - spa.data[i-n-1][idx]
        spa.data[i].push( _sum / (n+1))
      } else {
        spa.data[i].push( _sum / Math.min(i,n+1))
      }
    })
  }
  if (mth == 'mvmx') {
    spa.data.forEach((v,i) => {   
      if (i == 0) return
      if (i > 0) {
        _max = d3.max(spa.data.slice(Math.max(0,i+1-n),i+1))
      } else {
        _max = d3.max(spa.data.slice(i, i-n))
      }
      spa.data[i].push( _max )
    })
  }  
  if (mth == 'mvmn') {
    spa.data.forEach((v,i) => {   
      if (i == 0) return
      if (i > 0) {
        _min = d3.min(spa.data.slice(Math.max(0,i+1-n),i+1))
      } else {
        _min = d3.min(spa.data.slice(i, i-n))
      }
      spa.data[i].push( _min )
    })
  } 
  if (mth == 'offset') {
    if (ord == '') {
      spa.data.forEach((v,i) => {   
        if (i == 0) return
        if (i <= n) {
          spa.data[i].push(v[idx]*2 - spa.data[i+n][idx])
        } else {
          spa.data[i].push(spa.data[i-n][idx])
        }
      })
    } else {// by partition
      var grp = [ ...new Set(spa.data.slice(1).map(v => v.filter((v1, i) => ![idx,idxOrd].includes(i)).join('|')))]
      var grpData = {}
      var data1 = spa.data.map((v,i)=> [...v, i])
      var _idx = data1[0].length-1
      grp.forEach(g => {
        var gData = data1.filter(v => v.filter((v1, i) => ![idx,idxOrd,_idx].includes(i)).slice(0,-1).join('|') == g) // filter
        gData = gData.map(v => [v[idxOrd], v[idx],v[v.length-1]]) // 3 columns [ord, value, idxLocal]
        if (typeof(gData[0][0]) == 'string') {
          gData.sort((a,b) => a[0].replace(/[^0-9]/g,'') - b[0].replace(/[^0-9]/g,'') )
        } else {
          gData.sort((a,b) => a[0]- b[0])
        }
        grpData[g] = gData
      })
      spa.data.forEach((v,i) => {   
        if (i == 0) return 
        var g = spa.data[i].filter((v1, j) => ![idx,idxOrd].includes(j)).join('|')  // group excluding value and order
        var idx0 = grpData[g].map(v => v[0]).indexOf(v[idxOrd])                     // get index of current order
        var idxP = n==0 ? 0: (idx0 - n)                                             // get index of previous period or the 1st period ... as the base to substract
        if (idxP >= 0) {    // for PI diff change
          spa.data[i].push(spa.data[grpData[g][idxP][2]][idx] )
        } else {spa.data[i].push( null )}
      })      
    }

  }
}
// KML related
function objectToXml(obj,xmlVer=1.0,root=true) {
  let xml = xmlVer>0? '<?xml version="1.0" encoding="UTF-8"?>\n' : '';
  xml += root ? '<root>\n' : '';
  xml += objectToXmlRecursive(obj, 1); // Start recursion with indentation level 1
  xml += root ? '</root>' : '';
  return xml;
}
function objectToXmlRecursive(obj, indentLevel) {
  let xml = '';
  const indentSpaces = ' '.repeat(indentLevel * 2);
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'object') {
        xml += `${indentSpaces}<${key}>\n`;
        xml += objectToXmlRecursive(obj[key], indentLevel + 1);
        xml += `${indentSpaces}</${key}>\n`;
      } else {
        xml += `${indentSpaces}<${key}>${obj[key]}</${key}>\n`;
      }
    }
  }
  return xml;
}
function colorNameToHex(colorName) {
  // Create a temporary element for CSS color conversion
  let tempElem = document.createElement('div');
  tempElem.style.color = colorName;
  document.body.appendChild(tempElem);
  let computedColor = window.getComputedStyle(tempElem).color;
  document.body.removeChild(tempElem);
  
  // Convert computed color to RGB format
  let rgbMatch = computedColor.match(/\d+/g);
  if (rgbMatch) {
      let r = parseInt(rgbMatch[0]);
      let g = parseInt(rgbMatch[1]);
      let b = parseInt(rgbMatch[2]);
      return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  } else {
      return null; // Unable to parse color
  }
}
function dom2json(node) {
  const obj = {};
  for (const child of node.children) {
      if (child.children.length > 0) {
          obj[child.tagName.toLowerCase()] = dom2json(child);
      } else {
          obj[child.tagName.toLowerCase()] = isNaN(child.textContent) ? child.textContent : Number(child.textContent);
      }
  }
  return obj;
}
function tag2dom(htmlString = "<a><b><c>dfdfs</c></b><b1>678</b1></a>") {
  // Create a DOM parser
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  // Get the root element
  const root = doc.body.firstElementChild;
  // Convert the DOM to JSON
  const result = {};
  result[root.tagName.toLowerCase()] = dom2json(root);
  return result
}
function getRgbFromColorName(colorName) {
  // Create a temporary element
  const tempElement = document.createElement('div');
  tempElement.style.color = colorName;
  document.body.appendChild(tempElement);

  // Get the computed color value
  const computedColor = window.getComputedStyle(tempElement).color;
  document.body.removeChild(tempElement);

  // Extract RGB values from the computed color string
  const match = computedColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (match) {
      return [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10)];
  }
  return null; // In case the color name is not recognized
}

// call backend to save
function csvFilename() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');  // Month is 0-indexed
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
  
  return `${year}${month}${day}_${hours}${minutes}${seconds}_${milliseconds}.csv`;
}
function arrayToCSV(arr) {
  timeStamp = new Date().toISOString().slice(0,-2)
  return arr.map((row,i) =>  [(i==0 ? 'version': timeStamp), ...row].join(",")).join("\n");
}
// Send data to the backend
async function sendCSVToBackend(csvData, filePath) {
  port = getUrlVars()['port']||'8188'
  try {
      const response = await fetch(`http://prodgrd02:${port}/save-csv`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              csv_data: csvData,
              path: filePath,
          }),
      });

      const result = await response.json();
      console.log(result.message);
  } catch (error) {
      console.error('Error:', error);
  }
}
const trsp = (array) => array[0].map((_, colIndex) => array.map(row => row[colIndex]))
const mmIdx = (list) => { // [min, max]
  let listS = list.slice().sort((a,b) => a-b)
  let idxs = [listS[0],listS.slice(-1)[0]].map(v => list.indexOf(v))
  return idxs
}
const avgIdx = (list) => {
  let avg = list.reduce((s,v) =>  s + +v, 0) / list.length
  let listM = list.map(v => Math.abs(+v - avg))
  let idx = listM.indexOf(listMs[0])
  return idx
}
const mdIdx = (list) => {
  let listS = list.slice().sort((a,b) => a-b)
  let len = list.length
  let mIdx = Math.floor(len/2)
  if (len%2 == 1) { 
    idx = list.indexOf(listS[mIdx])
  } else {
    let avg = list.reduce((s,v) =>  s + +v, 0) / len
    let v2 = list.slice(mIdx, mIdx+2)
    let v2_ = v2.map(v => Math.abs(+v - avg))   
    let vIdx = v2_.indexOf(Math.min(...v2_))
    idx = list.indexOf(v2[vIdx])
  }
  return idx
}
//   // Trigger download and send data to the backend
//   document.getElementById('downloadBtn').addEventListener('click', () => {
//     const csvContent = arrayToCSV(arr);
//     const networkPath = '\\\\aeso.ca\\dfs\\Technical\\te\\97\\SystemPerformence\\Transmission\\csv\\mhu\\2024\\eea\\lineup\\7d\\sta\\result\\data.csv';  // Network path where the file should be saved
//     sendCSVToBackend(csvContent, networkPath);
//   });
function _getMnMx(col, data = spa.data) {
  let idx, min, max
  if (Array.isArray(data[0])) {  // if data is in array of arrays
    idx = data[0].indexOf(col)
    min = Math.min(...data.slice(1).map(v => Math.abs(v[idx])))
    max = Math.max(...data.slice(1).map(v => Math.abs(v[idx])))
  } else {                       // if data is in array of objects
    min = Math.min(...data.filter(v => !isNaN(v[col])).map(v => Math.abs(v[col])))
    max = Math.max(...data.filter(v => !isNaN(v[col])).map(v => Math.abs(v[col])))
  }
  return [min, max]
} // __run__spa.rg = _getMnMx('cdgMW_');

function _getR(v, vmin, vmax, rmin=2, rmax=10) {
  const range = vmax - vmin;
  const scale = Math.max(Math.abs(vmax), 1);
  // 1️⃣ amplified for small values
  if (range / scale < 0.01) {
    if (range === 0) {
      return (rmin + rmax) / 2;
    }
    const t = (v - vmin) / range;
    const amplification = 2; // adjustable
    const mid = (rmin + rmax) / 2;
    return mid + (t - 0.5) * amplification * (rmax - rmin);
  }
  // 2️⃣ normal（log + sqrt）
  const v2 = Math.log(v + 1);
  const vmin2 = Math.log(vmin + 1);
  const vmax2 = Math.log(vmax + 1);
  const t = (v2 - vmin2) / (vmax2 - vmin2);
  return rmin + (rmax - rmin) * Math.sqrt(t);
}
