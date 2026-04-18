// ==== load cfg.js
var getUrlVars = function () {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    return vars;
}
let udf = getUrlVars()['udf']
if (udf) {
    let path = getUrlVars()['path']
    udf = 'http://prodgrd02:2222/' + path +  (path.slice(-1) == '/' ? '' : '/') + udf
    var script2 = document.createElement('script'); // to load the mapdata.js after
    script2.src = udf;
    document.head.appendChild(script2)  
}
