const strapiurl = 'http://localhost:1337';

jQuery(document).ready(function ($) {
    if(localStorage.getItem("YEAR")) { document.getElementById("year").innerHTML = localStorage.getItem("YEAR"); }
    if(localStorage.getItem("MAKE")) { document.getElementById("make").innerHTML = localStorage.getItem("MAKE"); }
    if(localStorage.getItem("MODEL")) { document.getElementById("model").innerHTML = localStorage.getItem("MODEL"); }
    if(localStorage.getItem("wheel")) {
        var wheelJSON = JSON.parse(localStorage.getItem("wheel"));
        document.getElementById("wheel").innerHTML = wheelJSON.basepartno;
    }
    const queryString = `?width=${JSON.parse(localStorage.getItem("wheel")).width}`;
    const tires = getTires(queryString).then(tires => {
        localStorage.setItem("tires", JSON.stringify(tires));
        tires.forEach(makeRow);
    });
});

async function makeRow(tire, i) {
    //make table objects
    // <th scope="col">Name</th>
    // <th scope="col">SKU</th>
    // <th scope="col">Size</th>
    // <th scope="col">price</th>
    // <th scope="col">qty</th>
    // <th scope="col">Image</th>
    const name = tire.name;
    const supplier = tire.supplier;
    const sku = tire.sku;
    const size = tire.size;
    const price = tire.price;
    const qty = tire.qty;
    const imageurl = strapiurl + tire.images[0].url;
    var qtyString = "";
    // for await (const wheel_variation of wheel_variations) {
    //     var p =  await getColor(wheel_variation.color).then(res => {
    //         colorsString += res;
    //         colorsString += " | ";
    //     })
    //     qtyString += wheel_variation.qty;
    //     qtyString += " | ";
    // }
    var tr = document.createElement("tr");
    var th = document.createElement("th");
    th.setAttribute("scope","row");
    th.appendChild(document.createTextNode(i+1));
    var nameTd = document.createElement("td");
    var skuTd = document.createElement("td");
    var sizeTd = document.createElement("td");
    var priceTd = document.createElement("td");
    var qtyTd = document.createElement("td");
    var imageTd = document.createElement("td");
    var image = new Image();
    image.src = imageurl;
    image.setAttribute("style","height:100px");
    
    var buttonTd = document.createElement("td");
    var button = document.createElement("button");
    nameTd.appendChild(document.createTextNode(name));
    skuTd.appendChild(document.createTextNode(sku));
    sizeTd.appendChild(document.createTextNode(size));
    priceTd.appendChild(document.createTextNode(price));
    qtyTd.appendChild(document.createTextNode(qty));
    imageTd.appendChild(image);
    button.appendChild(document.createTextNode("Add"));
    button.setAttribute("type", "button");
    button.setAttribute("class", "btn btn-info addButton");
    button.setAttribute("id", i);
    button.addEventListener("click", addWheelOnClickSubmit)
    buttonTd.appendChild(button);
    
    tr.appendChild(th);
    tr.appendChild(nameTd);
    tr.appendChild(skuTd);
    tr.appendChild(sizeTd);
    tr.appendChild(priceTd);
    tr.appendChild(qtyTd);
    tr.appendChild(imageTd);
    tr.appendChild(buttonTd);
    //add tr to table
    var tbody = document.getElementById("tbody");
    tbody.appendChild(tr);
}

function addWheelOnClickSubmit() {
    var tire = JSON.parse(localStorage.getItem("tires"))[this.id];
    localStorage.setItem("tire", JSON.stringify(tire));
    window.location.href = '../views/submit.html';
}

async function getTires(queryString) {
    let fullQueryString = strapiurl + "/tires/";
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