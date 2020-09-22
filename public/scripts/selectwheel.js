const strapiurl = 'http://localhost:1337';

jQuery(document).ready(function ($) {
    if(localStorage.getItem("YEAR")) { document.getElementById("year").innerHTML = localStorage.getItem("YEAR"); }
    if(localStorage.getItem("MAKE")) { document.getElementById("make").innerHTML = localStorage.getItem("MAKE"); }
    if(localStorage.getItem("MODEL")) { document.getElementById("model").innerHTML = localStorage.getItem("MODEL"); }
    // var elems = document.getElementsByClassName("addButton");
    // for (var i=0, len=elems.length; i < len; i++) elems[i].addEventListener("click", addWheelOnClickSubmit);
    const queryString = getMatchInfo().then(res => {
        const wheels = getWheels(res).then(wheels =>{
            localStorage.setItem("wheels", JSON.stringify(wheels));
            //make table rows
            wheels.forEach(makeRow);
        });
    });
});

async function makeRow(wheel, i) {
    //make table objects
    // <tr>
    //     <th scope="row">1</th>
    //     <td>Mark</td>
    //     <td>Otto</td>
    //     <td><button type="button" class="btn btn-info addButton">Add</button></td>
    // </tr>
    const basepartno = wheel.basepartno;
    const supplier = wheel.supplier;
    const size = wheel.diameter + "x" + wheel.width;
    const wheel_variations = wheel.wheel_variations;
    const pcd = wheel.pcd;
    const cb = wheel.cb;
    var colorsString = "";
    var qtyString = "";
    for await (const wheel_variation of wheel_variations) {
        var p =  await getColor(wheel_variation.color).then(res => {
            colorsString += res;
            colorsString += " | ";
        })
        qtyString += wheel_variation.qty;
        qtyString += " | ";
    }
    var tr = document.createElement("tr");
    var th = document.createElement("th");
    th.setAttribute("scope","row");
    th.appendChild(document.createTextNode(i+1));
    var basepartnoTd = document.createElement("td");
    basepartnoTd.appendChild(document.createTextNode(basepartno));
    var sizeTd = document.createElement("td");
    var colorsStringTd = document.createElement("td");
    var qtyStringTd = document.createElement("td");
    var pcdTd = document.createElement("td");
    var cbTd = document.createElement("td");
    var buttonTd = document.createElement("td");
    var button = document.createElement("button");
    button.appendChild(document.createTextNode("Add"));
    button.setAttribute("type", "button");
    button.setAttribute("class", "btn btn-info addButton");
    button.setAttribute("id", i);
    button.addEventListener("click", addWheelOnClickSubmit)
    buttonTd.appendChild(button);
    sizeTd.appendChild(document.createTextNode(size));
    pcdTd.appendChild(document.createTextNode(pcd));
    cbTd.appendChild(document.createTextNode(cb));
    colorsStringTd.appendChild(document.createTextNode(colorsString));
    qtyStringTd.appendChild(document.createTextNode(qtyString));

    tr.appendChild(th);
    tr.appendChild(basepartnoTd);
    tr.appendChild(sizeTd);
    tr.appendChild(pcdTd);
    tr.appendChild(cbTd);
    tr.appendChild(colorsStringTd);
    tr.appendChild(qtyStringTd);
    tr.appendChild(buttonTd);
    //add tr to table
    var tbody = document.getElementById("tbody");
    tbody.appendChild(tr);
}

async function getMatchInfo() {
    const PCD = localStorage.getItem("BPMET");
    const PCDString = `pcd=${PCD}`;
    const hub = await getHub(localStorage.getItem("HUB"));
    const hubString = `cb=${hub}`;
    const offsetmin = await getOffsetMin(localStorage.getItem("OFFSETMM"));
    const offsetmax = await getOffsetMax(localStorage.getItem("OFFSETMM"));
    const offsetString = `cb_gte=${offsetmin}&cb_lte=${offsetmax}`;
    const sizesString = await getAllSizesString();
    const queryString = `?${PCDString}&${hubString}&${offsetString}&${sizesString}`;
    return queryString;
}


async function getAllSizesString() {
    let sizes = [];
    const tiresize1 = await getSize(localStorage.getItem("TIRESIZE1"));
    if(tiresize1) { sizes.push(tiresize1) };
    const tiresize2 = await getSize(localStorage.getItem("TIRESIZE2"));
    if(tiresize2) { sizes.push(tiresize2) };
    const tiresize3 = await getSize(localStorage.getItem("TIRESIZE3"));
    if(tiresize3) { sizes.push(tiresize3) };
    const tiresize4 = await getSize(localStorage.getItem("TIRESIZE4"));
    if(tiresize4) { sizes.push(tiresize4) };
    const tiresize5 = await getSize(localStorage.getItem("TIRESIZE5"));
    if(tiresize5) { sizes.push(tiresize5) };
    const tiresize6 = await getSize(localStorage.getItem("TIRESIZE6"));
    if(tiresize6) { sizes.push(tiresize6) };
    const tiresize7 = await getSize(localStorage.getItem("TIRESIZE7"));
    if(tiresize7) { sizes.push(tiresize7) };
    const tiresize8 = await getSize(localStorage.getItem("TIRESIZE8"));
    if(tiresize8) { sizes.push(tiresize8) };
    const tiresize9 = await getSize(localStorage.getItem("TIRESIZE9"));
    if(tiresize9) { sizes.push(tiresize9) };
    const tiresize10 = await getSize(localStorage.getItem("TIRESIZE10"));
    if(tiresize10) { sizes.push(tiresize10) };
    const tiresize11 = await getSize(localStorage.getItem("TIRESIZE11"));
    if(tiresize11) { sizes.push(tiresize11) };
    let sizesSet = Array.from(new Set(sizes));
    let sizesString = "";
    var count = 0; 
    for await (const tiresize of sizesSet) {
        sizesString += await `width=${tiresize}`;
        count++; 
        if(count == sizesSet.length) {
            return sizesString;
        } else {
            sizesString += "&";
        }
    }

    // sizesSet.forEach(function(tiresize) {
    //     sizesString += `width=${tiresize}`;
    //     count++; 
    //     if(count == sizesSet.length) {
    //         return sizesString;
    //     } else {
    //         sizesString += "&";
    //     }
    // });
}

async function getSize(wheelsize) {
    // sample tiresize: '215/45-17'
    try {
        if(wheelsize) {
            // sample tiresize: 215/45-17
            let arr1 = wheelsize.split('/', 2)
            let arr2 = arr1[1].split('-', 2)
            let wheel_diam_in = arr2[1];
            let width = wheel_diam_in;

            return width;
        } else {
            return null;
        }
    } catch (error) {
        console.log("Error at getSize " + error);
    }
}

async function getHub(hub) {
    try {
        // sample hub1: 66.56 
        let r1 = new RegExp('[0-9]+\.[0-9]+');
        // sample hub2: 66
        let r2 = new RegExp('[0-9]+');
        // sample hub3: F-57.1/R-66.56
        let r3 = new RegExp('[A-Z]-[0-9]+\.[0-9]+/[A-Z]-[0-9]+\.[0-9]+');
        // hub1
        if (hub && (r1.test(hub) || r2.test(hub)))
        {
            return hub;
        } else if (hub && r3.test(hub))
        {
        // hub2
            let arr1 = hub.split('/', 2);
            let arr2 = arr1[0].split('-', 2);
            let arr3 = arr1[1].split('-', 2);
            let front = arr2[1];
            let rear = arr3[1];
            // print('front: ' + str(front) + '     Rear: ' + str(rear))
            return max(front, rear);
        } else {
            return null;
        }
    } catch (error) {
        console.log('Error at getHub ' + error);
        return null;
    }
}

async function getOffsetMin(offsetmm) {
    try {
        //example offsetmm: 40-50
        let r = new RegExp('.*.*-.*.*');
        if (offsetmm && r.test(offsetmm)){
            // sample offsetmm: '35-45'
            // split offset into min and max
            let arr = offsetmm.split('-', 2);
            let offsetmm_min = arr[0];
            return offsetmm_min;
        } else {
            return null;
        }
    } catch (error) {
        console.log('Error at getOffsetMin ' + error);
        return null;
    }
}

async function getOffsetMax(offsetmm) {
    try {
        //example offsetmm: 40-50
        let r = new RegExp('.*.*-.*.*');
        if (offsetmm && r.test(offsetmm)){
            // sample offsetmm: '35-45'
            // split offset into min and max
            let arr = offsetmm.split('-', 2);
            // before the hyphen -
            let offsetmm_max = arr[1];
            return offsetmm_max;
        } else {
            return null;
        }
    } catch (error) {
        console.log('Error at getOffsetMin ' + error);
        return null;
    }
}

async function getWheels(queryString) {
    let fullQueryString = strapiurl + "/base-wheels" ;
    console.log(fullQueryString);
    try {
        const { data } = await axios.get( fullQueryString, {
            headers: {
                Authorization:
                  'Bearer ' + localStorage.getItem("jwt"),
              },
            });
        if(data) {
            console.log(data);
            return data;
        }
    } catch (error) {
        console.log("Error getting wheels from strapi " + error);
        return null;
    } 
}

async function getColor(id) {
    let fullQueryString = strapiurl + `/colors/${id}`;
    try {
        const { data } = await axios.get( fullQueryString, {
            headers: {
                Authorization:
                  'Bearer ' + localStorage.getItem("jwt"),
              },
            });
        if(data) {
            console.log("color " + data.name);
            return data.name;
        }
    } catch (error) {
        console.log("Error getting colors from strapi " + error);
        return null;
    } 
}

function addWheelOnClickSubmit() {
    var wheel = JSON.parse(localStorage.getItem("wheels"))[this.id];
    localStorage.setItem("wheel", JSON.stringify(wheel));
    window.location.href = '../views/selecttire.html';
}