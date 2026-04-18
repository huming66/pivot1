function toggleMapOn() {
    var x = document.getElementById("output");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

function toggleMapPosition() {
    var x = document.getElementById('mpid').style.position;
    if (x == "") {
        document.getElementById('mpid').style.position = "relative";
    } else {
        document.getElementById('mpid').style.position = "";
    }
}

async function switchCfg(cfg, refresh = true) { // to merge with getCfg() in privot.js
    let cfg0 = spa.cfg_file.split('/').slice(-1)[0]
    spa.cfg_file = spa.cfg_file.replace(cfg0, cfg + '.json')
    spa.cfg = await getData0(spa.cfg_file)
    if (spa.cfg['user columns']) {
        if (typeof (spa.cfg['user columns']) == 'object') { spa.cfg['user columns'] = spa.cfg['user columns'].join(';') }
        document.getElementById('userCol').value = spa.cfg['user columns'].replace(/[;\n]{1,3} */g, ';\n') + '\n==========='
        // document.getElementById("usrCol").open = true    
    }
    if (spa.dPrc) {   // data pre-processing function exists in dataReady(), before user processing
        if (spa.data0) {     // already saved, use it
            spa.data = spa.data0.slice(0).map(v => [...v])
        } else {             // not saved, make a copy of the data before user processing (below)
            spa.data0 = spa.data.slice(0).map(v => [...v])
        }
    }   // 
    if (spa.cfg?.hideTotal) {  // same code in _gui.js // pivot.js
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
    if (refresh) $("#output").pivotUI(await prcsData(spa.data, 0), { 
        renderers: spa.renderers, 
        ...spa.cfg.default, 
        onRefresh: $("#output").data("pivotUIOptions").onRefresh  // defined at query0.js
    }, true)
}
function cfgList(items) {
    // Find the button with text "wrapTitle"
    const button = Array.from(document.getElementsByTagName('button')).find(btn => btn.textContent.trim() === 'CSV_All');
    if (!button) {
        console.error("Button with text 'wrapTitle' not found.");
        return;
    }

    // Create a dropdown element
    const dropdown = document.createElement('select');
    dropdown.id = 'dynamicDropdown';
    dropdown.style.marginLeft = '10px';
    dropdown.style.backgroundColor = 'lightgreen';

    // Populate the dropdown with items
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        dropdown.appendChild(option);
    });

    // Add the dropdown after the button
    button.insertAdjacentElement('afterend', dropdown);

    // Add an action function for the dropdown
    dropdown.addEventListener('change',
        function () {
            switchCfg(this.value)
            //     // const selectedValue = this.value;
            //     // console.log(`Selected value: ${selectedValue}`);
            //     // // Add your custom action logic here
            //     // alert(`You selected: ${selectedValue}`);
        }
    );
}

function hideBtn(list) {
    list.forEach(el => {
        const btn = Array.from(document.getElementsByTagName('button')).find(btn => btn.textContent.trim() === el)
        if (btn) btn.style.display = 'none'
    })
}

document.getElementById('vizOut').addEventListener('change', (event) => {
    if (!spa.vizArea) {
        spa.vizArea = document.querySelector('td.pvtRendererArea')
        spa.vizTable = spa.vizArea.closest('table')
        spa.vizParent = spa.vizTable.parentElement
        spa.vizPre = document.querySelector('td.pvtAxisContainer.pvtRows.pvtUiCell.ui-sortable')
    }
    if (event.target.checked) {
        spa.vizParent.appendChild(spa.vizArea)
    } else {
        spa.vizPre.parentNode.insertBefore(spa.vizArea, spa.vizPre.nextSibling)
    }
});
document.getElementById('scsv').addEventListener('change', (event) => {
if (getUrlVars()['scsv']) {
    
}
});
function _addAfter(ref='CSV_ALL', elm) {
    // Find the button with text "CSV_All"
    const button = Array.from(document.getElementsByTagName('button')).find(btn => btn.textContent.trim() === 'CSV_All');
    if (!button) {
        console.error("Button with text 'wrapTitle' not found.");
        return;
    }
    // Add the dropdown after the button
    button.insertAdjacentElement('afterend', elm);
}
function _dropdown(items,f = () => {},bcolor = 'lightgreen',v0) {
    const dropdown = document.createElement('select');  // Create a dropdown element
    // dropdown.id = 'dynamicDropdown1';
    dropdown.style.marginLeft = '10px';
    dropdown.style.backgroundColor = bcolor
    // dropdown.multiple = true  
    items.forEach(item => {                             // Populate the dropdown with items
        const option = document.createElement('option');
        option.value = typeof(item) == 'string' ? item : item[0];
        option.textContent = typeof(item) == 'string' ? item : item[1];
        dropdown.appendChild(option);
    });
    dropdown.addEventListener('change',                 // Add an action function for the dropdown
        f.length == 0? f : function () { f(this.value) }
    );
    dropdown.value = v0 || dropdown.value
    // _addAfter('CSV_ALL', dropdown)                      // incert after
    document.getElementById('toolbar').appendChild(dropdown)
}
function _dropdown_(items,f = () => {},bcolor = 'lightgreen',v0) {
    const dropdown = document.createElement('select');  // Create a dropdown element
    // dropdown.id = 'dynamicDropdown1';
    dropdown.style.marginLeft = '10px';
    dropdown.style.backgroundColor = bcolor
    // dropdown.multiple = true  
    items.forEach(item => {                             // Populate the dropdown with items
        const option = document.createElement('option');
        option.value = typeof(item) == 'string' ? item : item[0];
        option.textContent = typeof(item) == 'string' ? item : item[1];
        dropdown.appendChild(option);
    });
    dropdown.addEventListener('change',                 // Add an action function for the dropdown
        f
    );
    dropdown.value = v0 || dropdown.value
    // _addAfter('CSV_ALL', dropdown)                      // incert after
    document.getElementById('toolbar').appendChild(dropdown)
}


function _button(txt = 'ok',f = () => {},bcolor = 'lightgreen',) {
    const buttonElement = document.createElement('button');
    buttonElement.innerHTML = txt; // Set button text
    buttonElement.style.backgroundColor = bcolor; // Set background color
    buttonElement.addEventListener('click',                 // Add an action function for the dropdown
        f.length == 0? f : function () { f(this.value) }
    );
    // _addAfter('CSV_ALL', buttonElement)   
    document.getElementById('toolbar').appendChild(buttonElement)   
}
function _txt(txt = '20240101', f = () => {},bcolor = 'lightgreen',size = 0) {
    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.value = txt;
    // inputElement.id = 'myInput';
    inputElement.style.backgroundColor = bcolor; // Set background color
    if (size > 0) {
        inputElement.size = size
    } else {
        inputElement.style.width = '50px'
    }
    inputElement.addEventListener('change',                 // Add an action function for the dropdown
        f.length == 0? f : function () { f(this.value) }
    );
    // _addAfter('CSV_ALL', inputElement)  
    document.getElementById('toolbar').appendChild(inputElement)
}
function _check(txt = '20240101', f = () => {},bcolor = 'lightgreen') {
    const label = document.createElement('label');
    label.htmlFor = 'myCheckbox'; // associate label with checkbox
    label.textContent = 'Subscribe to newsletter';
    label.style.backgroundColor = bcolor; // Set background color
    const inputElement = document.createElement('input');
    inputElement.type = 'checkbox';
    inputElement.id = label.htmlFor;
    inputElement.addEventListener('change',                 // Add an action function for the dropdown
        function () { f(this.value) }
    );
    // _addAfter('CSV_ALL', inputElement)  
    document.getElementById('toolbar').appendChild(inputElement).appendChild(label)
}
function _date(txt = '20240101', f = () => {},bcolor = 'lightgreen') {
    const inputElement = document.createElement('input');
    inputElement.type = 'date';
    inputElement.value = txt;
    // // inputElement.id = 'myInput';
    inputElement.style.backgroundColor = bcolor; // Set background color
    inputElement.addEventListener('change',                 // Add an action function for the dropdown
        f.length == 0? f : function () { f(this.value) }
    );
    // _addAfter('CSV_ALL', inputElement)  
    document.getElementById('toolbar').appendChild(inputElement)
}
function _dateTime(txt = '20240101 01:00', f = () => {},bcolor = 'lightgreen') {
    const inputElement = document.createElement('input');
    inputElement.type = 'datetime-local';
    inputElement.value = txt;
    // // inputElement.id = 'myInput';
    inputElement.style.backgroundColor = bcolor; // Set background color
    inputElement.addEventListener('change',                 // Add an action function for the dropdown
        f.length == 0? f : function () { f(this.value) }
    );
    // _addAfter('CSV_ALL', inputElement)  
    document.getElementById('toolbar').appendChild(inputElement)
}
function _dateTime_(txt = '20240101 01:00', f = () => {},bcolor = 'lightgreen') {
    const inputElement = document.createElement('input');
    inputElement.type = 'datetime-local';
    inputElement.value = txt;
    // // inputElement.id = 'myInput';
    inputElement.style.backgroundColor = bcolor; // Set background color
    inputElement.addEventListener('change',                 // Add an action function for the dropdown
       f
    );
    document.getElementById('toolbar').appendChild(inputElement)
}
function _tree(d = [],f = () => {},f1=()=>{}, f2=()=>{}, label = 'drag2move', opt = {}) {
    let opt0 = {
        plugins: ['search','sort']
    }
    opt = {...opt0, ...opt}
    const grpDiv = document.createElement('div');
    grpDiv.id = 'grpTree';
    grpDiv.classList.add('topLayer')
    // const grpDtl = document.createElement('details');
    // grpDtl.open = true
    // const grpSmy = document.createElement('summary');
    // grpSmy.textContent = 'drag to move';
    const searchTxt = document.createElement('input');
    searchTxt.type = 'text'
    searchTxt.id = 'searchField'
    searchTxt.placeholder = 'search anything ...'
    // searchTxt.value = 'hhhhhh'
    searchTxt.style.width = '100px'
    const searchChk = document.createElement('input');
    searchChk.type = 'checkbox';
    searchChk.checked = true;
    searchChk.addEventListener("change", function () {
        this.previousElementSibling.disabled = !this.checked
        var event = new Event('keyup');
        searchTxt.dispatchEvent(event);
    })
    const movelabel = document.createElement('label');
    movelabel.textContent = 'drag2move';    
    movelabel.id="grpTreeheader"
    grpDiv.appendChild(searchTxt);
    grpDiv.appendChild(searchChk)
    grpDiv.appendChild(movelabel)

    const treeDiv = document.createElement('div');
    treeDiv.id = 'treeAll';
    document.body.appendChild(grpDiv);
    grpDiv.appendChild(treeDiv);


    $('#treeAll').jstree({
        'core': {
            'data': [
                {
                    "text": label, "children": arr2tree(d[0],d[1])
                }
            ],
            "themes": {
                "icons": false,
                // "dots": true
            },
        },
        'plugins': opt['plugins'] || ['search','sort'], //"checkbox"
        // 'sort': function (a, b) {
        //     return this.get_text(a).toLowerCase() > this.get_text(b).toLowerCase() ? 1 : -1;
        //   }
        "search": {
            "case_insensitive": true,
            "show_only_matches": true,
            "search_callback" : function (str, node) { try { return node.text.match(new RegExp(str, 'i')); } catch(ex) { return false; } }
        }
    });
    $('#treeAll').on('changed.jstree', function (e, data) {
            if (data.node.children.length == 0) {
                f.length == 1? f(data.node.text) : f(data.node.text,data)              
            }
          // $('#event_result').html('Selected: ' + r.join(', '));
    })
    // if (hoverInfo) {
        $('#treeAll').on('hover_node.jstree', function (e, data) {
            if (data.node.children.length == 0) {
                // document.getElementById('msg').textContent = spa.hoverInfo[data.node.text]
                f1.length == 1? f1(data.node.text): f1(data.node.text,data) 
            }
        })
        $('#treeAll').on('dehover_node.jstree', function (e, d) {
                f2()
        })    
    // }
    // free text search for PI tag
    $('#grpTree input').keyup(function (k) {
        var v = $('#grpTree input').val();
        if (v.length == 0 || !this.nextSibling.checked) {
            $('#treeAll').jstree(true).show_all()
            $('#treeAll').jstree("close_all")
        } else
        if (v.length > 0 && this.nextSibling.checked) {                     //disable search form less then 3 char, without enter
         // if (v.length >= 0 || k.key == "Enter") {                     //disable search form less then 3 char, without enter
                $('#treeAll').jstree(true).search(v);
            }
    });


    // dragElement(document.getElementById("grpTree"))      
}

// arr to tree
function arr2tree(arr,keyList) {
    if (Array.isArray(arr[0])) {
        arr = arr.slice(1).map(v => Object.fromEntries(arr[0].map((k,i) => [k,v[i]])))
    }
    var tree = [];
    var key = keyList[0]; //keys(arr[0]);
    var vList 
    var k = keyList[0];
    vList = [...new Set(arr.map(obj => obj[k]))];
    vList.forEach((v,i) => { 
        if (keyList.length > 1) {
            tree.push({ 'text': v, 'type':k, 'children': [] });
            // var arr1 = arr.filter((value, index, self) => self[index][k] == v); // self[index][k] is same as value[k]
            var arr1 = arr.filter((value) => value[k] == v);  
            tree[i].children = arr2tree(arr1,keyList.slice(1,));
        } else {
            tree.push({ 'text': v, 'type':k});
        } 
    })
    return tree; 
}
function togglePivotFrame() {
    const cells = document.querySelectorAll("#output tbody td");
    if (cells[0].style.display == "none") {
        cells.forEach(cell => cell.style.display = "")
    } else {
        cells.forEach(cell => cell.style.display = "none");
        const bottomRight = document.querySelector("#output tbody tr:last-child td:last-child");
        bottomRight.style.display = "table-cell";
    }
}