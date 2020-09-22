const strapiurl = 'http://localhost:1337';
const wpurl = 'https:35.183.120.240/wp-json/wc/v3';
const cons_key = 'ck_3b1c92a7187183d91853b2594e4c123c0624ac8a';
const cons_sec = 'cs_4c5078fcd654deef5abd3d0c2926a056d0acf30c';
const MARKUP = 1.30;
const REG_MARKUP = 1.40;

//https:35.183.120.240/wp-json/wc/v3/products?consumer_key=ck_3b1c92a7187183d91853b2594e4c123c0624ac8a&consumer_secret=cs_4c5078fcd654deef5abd3d0c2926a056d0acf30c
jQuery(document).ready(function ($) {
    var year = localStorage.getItem("YEAR");
    var make = localStorage.getItem("MAKE");
    var model = localStorage.getItem("MODEL");
    var wheel = JSON.parse(localStorage.getItem("wheel"));
    var tire = JSON.parse(localStorage.getItem("tire"));
    //console.log(wheel);
    //console.log(tire);
    const wheel_variations = wheel.wheel_variations;
    controller(year, make, model, tire, wheel, wheel_variations);
});

async function controller(year, make, model, tire, wheel, wheel_variations) {
    var isExists = false;
    var variationIds = [];
    var temp;
    var categoryId;
    var singleId;
    //get colors
    var colors = []
    try {
        for await (const wheel_variation of wheel_variations) {
            var p = await getColor(wheel_variation.color).then(res => {
                colors.push(res);
            })
        }
        //check if product already exists
        var p1 = await checkProductExists(year, make, model, tire, wheel).then((res) => {
            //if id exists, return true
            if (res.length > 0) {
                console.log("Product already exists");
                isExists = true;
            } else {
                console.log("Product doesn't already exist.")
                isExists = false;
            }
        });
        if (!isExists) {
            //check if category exists, if not, create it
            var categorySlug = `${year}-${make}-${model}`.toLowerCase();
            var p2 = await getWoo(`/products/categories/?slug=${categorySlug}`).then(async (res) => {
                if (res.data.length > 0) {
                    //assign existing category id
                    categoryId = res.data[0].id;
                    console.log("category already exists. id: " + categoryId);
                } else {
                    //make new category 
                    console.log("need to make category");
                    var name = `${year} ${make} ${model}`;
                    var data = {
                        "name": name
                    }
                    const p3 = await postWoo(`/products/categories/?`, data).then(async (res) => {
                        categoryId = res.data.id;
                        console.log("new category id: " + categoryId);
                    });
                }
            })
            //make single variable product
            singleId = await makeVariableSingle(year, make, model, wheel, tire, categoryId);
            console.log("VariableSingleProductId: " + singleId);
            //add single product variations

            for await (const wheel_variation of wheel_variations) {
                const p = await makeVariationSingle(singleId, year, make, model, tire, wheel, wheel_variation).then(res => {
                    temp = res;
                });
                variationIds[temp] = wheel_variation;
                console.log("VariationId: ", temp);
            }

            //make grouped variable product - SQUARE configuration
            var groupedId = await makeVariableGroupedSquare(year, make, model, wheel, tire, categoryId);
            //make grouped product variations - SQUARE configuration
            for await (const [productVariationId, wheel_variation] of Object.entries(variationIds)) {
                const p = await makeVariationGroupedSquare(productVariationId, groupedId, year, make, model, tire, wheel, wheel_variation);
            }

            document.getElementById("title").innerHTML = "Success!";
            document.getElementById("message").innerHTML =
                `Created product and square configuration for: </br>
                Car: ${year} ${make} ${model} </br>
                Tire: ${tire.name}</br>
                Wheel: ${wheel.basepartno}</br>`;

            //delete for testing
            //var p = await deleteWoo(`/products/${singleId}?force=true`);
        } else { throw new Error('car/wheel/tire combination already exists'); }
    } catch (error) {
        document.getElementById("title").innerHTML = "An error occured";
        document.getElementById("message").innerHTML = error;
        console.log(error);
        //var p = await deleteWoo(`/products/${singleId}?force=true`);
    }

}

async function checkProductExists(year, make, model, tire, wheel) {
    var name = `${year} ${make} ${model} ${tire.name} ${wheel.basepartno}`
    var slug = name.replace(/ +(?= )/g, '').replace(/\s/g, '-').toLowerCase();
    console.log(slug);
    var product = await getWoo(`/products/?slug=${slug}`);
    return product.data;
}

async function makeVariableSingle(year, make, model, wheel, tire, categoryId) {
    //calculate price and regular price with markup const
    var price = tire.price;
    var dPrice = Number(price.replace(/[^0-9\.]+/g, ""));
    var regPrice = dPrice * REG_MARKUP.toFixed(2);
    var salePrice = dPrice * MARKUP.toFixed(2);
    var name = `${year} ${make} ${model} ${tire.name} ${wheel.basepartno}`
    name = name.replace(/ +(?= )/g, '').toUpperCase();
    var sku = name.replace(/\s/g, '-');
    var slug = sku.toLowerCase();
    //get color attribute strings and add to attributes
    const wheel_variations = await wheel.wheel_variations;
    var seasonAttribute = {
        "id": 5,
        "name": "Season",
        "visible": true,
        "options": []
    };

    if (tire.season.name) {
        seasonAttribute.options.push(tire.season.name);
    } else {
        seasonAttribute.options.push("None");
    }
    var inchesAttribute = {
        "id": 9,
        "name": "Inches",
        "visible": true,
        "options": [
            wheel.diameter.toString() + " inch"
        ]
    };
    var colorsAttribute = {
        "id": 4,
        "name": "Color",
        "variation": true,
        "visible": true,
        "options": []
    };
    for await (const wheel_variation of wheel_variations) {
        var p = await getColor(wheel_variation.color).then(res => {
            colorsAttribute.options.push(res);
        })
    }
    // var category = await getWoo('/products/categories/?slug=')

    var data = {
        "type": "variable",
        "sku": sku,
        "slug": slug,
        "name": name,
        "description": tire.description,
        "regular_price": regPrice.toString(),
        "sale_price": salePrice.toString(),
        "tax_status": "taxable",
        "attributes": [
        ],
        "categories": [
            {
                "id": categoryId
            }
        ]
    };
    data.attributes.push(colorsAttribute);
    data.attributes.push(inchesAttribute);
    data.attributes.push(seasonAttribute);
    var product = await postWoo('/products/?', data);
    return product.data.id;
}

async function makeVariationSingle(parentId, year, make, model, tire, wheel, wheel_variation) {
    var price = tire.price;
    var dPrice = Number(price.replace(/[^0-9\.]+/g, ""));
    var regPrice = dPrice * REG_MARKUP.toFixed(2);
    var salePrice = dPrice * MARKUP.toFixed(2);
    var wheelQty = wheel_variation.qty;
    var tireQty = tire.qty;
    var qty = Math.min(wheelQty, tireQty);
    var color, sku, name, slug;

    //get color
    var p = await getColor(wheel_variation.color).then(res => {
        color = res;
        name = `${year} ${make} ${model} ${tire.name} ${wheel.basepartno} ${color}`;
        name = name.replace(/ +(?= )/g, '').toUpperCase();
        sku = name.replace(/\s/g, '-')
        slug = sku.toLowerCase();
    });

    //check if car category exists, if not make it
    var colorAttribute = {
        "id": 4,
        //"name" : "Color",
        "option": color.toString()
    };
    var data = {
        "name": name,
        "sku": sku,
        "slug": slug,
        "regular_price": regPrice.toString(),
        "sale_price": salePrice.toString(),
        "attributes": [],
        "manage_stock": true,
        "stock_quantity": parseInt(qty),
        "stock_status": "instock",
        "parent_id": parseInt(parentId)
    };
    data.attributes.push(colorAttribute);
    var product = await postWoo(`/products/${parentId}/variations/?`, data);
    return product.data.id;
}

async function makeVariableGroupedSquare(year, make, model, wheel, tire, categoryId) {
    //calculate price and regular price with markup const
    var name = `${year} ${make} ${model} ${tire.name} ${wheel.basepartno} PACKAGE SQUARE`
    name = name.replace(/ +(?= )/g, '').toUpperCase();
    var sku = name.replace(/\s/g, '-');
    var slug = sku.toLowerCase();
    //get color attribute strings and add to attributes
    const wheel_variations = await wheel.wheel_variations;
    var seasonAttribute = {
        "id": 5,
        "name": "Season",
        "visible": true,
        "options": []
    };
    if (tire.season.name) {
        seasonAttribute.options.push(tire.season.name);
    } else {
        seasonAttribute.options.push("None");
    }
    var inchesAttribute = {
        "id": 9,
        "name": "Inches",
        "visible": true,
        "options": [
            wheel.diameter.toString() + " inch"
        ]
    };
    var colorsAttribute = {
        "id": 4,
        "name": "Color",
        "variation": true,
        "visible": true,
        "options": []
    };
    var configurationAttribute = {
        "id": 11,
        "name": "Color",
        "visible": true,
        "options": []
    };
    for await (const wheel_variation of wheel_variations) {
        var p = await getColor(wheel_variation.color).then(res => {
            colorsAttribute.options.push(res);
        })
    }

    var data = {
        "type": "variable",
        "sku": sku,
        "slug": slug,
        "name": name,
        "description": tire.description,
        "tax_status": "taxable",
        "attributes": [
        ],
        "categories": [
            {
                "id": categoryId
            }
        ]
    };
    data.attributes.push(colorsAttribute);
    data.attributes.push(inchesAttribute);
    data.attributes.push(seasonAttribute);
    data.attributes.push(configurationAttribute);
    var product = await postWoo('/products/?', data);
    return product.data.id;
}

async function makeVariationGroupedSquare(productId, parentId, year, make, model, tire, wheel, wheel_variation) {
    var price = tire.price;
    var dPrice = Number(price.replace(/[^0-9\.]+/g, ""));
    var regPrice = dPrice * REG_MARKUP.toFixed(2);
    var salePrice = dPrice * MARKUP.toFixed(2);
    var wheelQty = wheel_variation.qty;
    var tireQty = tire.qty;
    var qty = Math.min(wheelQty, tireQty);
    var finalqty = parseInt(qty/4);
    var sku, name, slug, color, singleName;

    //get color
    var p = await getColor(wheel_variation.color).then(res => {
        color = res;
        singleName = `${year} ${make} ${model} ${tire.name} ${wheel.basepartno} ${color}`;
        name = `${year} ${make} ${model} ${tire.name} ${wheel.basepartno} PACKAGE SQUARE ${color}`;
        name = name.replace(/ +(?= )/g, '').toUpperCase();
        sku = name.replace(/\s/g, '-')
        slug = sku.toLowerCase();
    });
    var colorAttribute = {
        "id": 4,
        "name" : "Color",
        "option": color.toString()
    };
    var data = {
        "name": name,
        "sku": sku,
        "slug": slug,
        // "regular_price": regPrice.toString(),
        // "sale_price": salePrice.toString(),
        "attributes": [],
        "manage_stock": true,
        "stock_quantity": parseInt(finalqty),
        "stock_status": "instock",
        "parent_id": parseInt(parentId),
        "regular_price": regPrice.toString(),
        "sale_price": salePrice.toString(),
        "tax_status": "taxable",
        "meta_data" : [
            {
                "key": "_chained_product_detail",
                "value": {
                    [productId] : {
                        "unit" : "4",
                        "priced_individually": "yes",
                        "product_name": singleName + " ( Color: " + color + " )"
                    }
                }
            },
            {
                "key": "_chained_product_ids",
                "value": [
                    productId,
                    parseInt(productId)
                ]
            },
            {
                "key": "_chained_product_manage_stock",
                "value": "yes"
            }
        ]
    };
    data.attributes.push(colorAttribute);
    var product = await postWoo(`/products/${parentId}/variations/?`, data);
    return product.data.id;
}

////////////////////////////////////////////////////////////////////
//CRUD FUNCTIONS
////////////////////////////////////////////////////////////////////

async function postWoo(endpoint, data) {
    let fullendpoint = wpurl + endpoint + '&consumer_key=' + cons_key + '&consumer_secret=' + cons_sec;
    console.log(fullendpoint);
    let result;
    try {
        const res = await axios.post(fullendpoint, data)
            .then((res) => {
                if (res) {
                    console.log(res);
                    result = res;
                }
            });
        return result;
    } catch (error) {
        console.log("Error posting args " + error);
        return null;
    }
}

async function getWoo(endpoint, data) {
    let fullendpoint = wpurl + endpoint + '&consumer_key=' + cons_key + '&consumer_secret=' + cons_sec;
    console.log(fullendpoint);
    let result;
    try {
        const res = await axios.get(fullendpoint)
            .then((res) => {
                if (res) {
                    console.log(res);
                    result = res;
                }
            });
        return result;
    } catch (error) {
        console.log("Error posting args " + error);
        return null;
    }
}

async function deleteWoo(endpoint) {
    let fullendpoint = wpurl + endpoint + '&consumer_key=' + cons_key + '&consumer_secret=' + cons_sec;
    console.log(fullendpoint);
    let result;
    try {
        const res = await axios.delete(fullendpoint)
            .then((res) => {
                if (res) {
                    console.log(res);
                    result = res;
                }
            });
        return result;
    } catch (error) {
        console.log("Error at deleteWoo " + error);
        return null;
    }
}

async function getStrapi(endpoint) {
    var fullendpoint = strapiurl + endpoint;
    console.log(fullendpoint);
    let result;
    try {
        const { res } = await axios.get(fullendpoint, {
            headers: {
                Authorization:
                    'Bearer ' + localStorage.getItem("jwt"),
            }
        }).then((res) => {
            if (res) {
                console.log(res);
                result = res;
            }
        });
        return result;
    } catch (error) {
        console.log("Error getting wheels from strapi " + error);
        return null;
    }
}

async function getColor(id) {
    let fullQueryString = strapiurl + `/colors/${id}`;
    try {
        const { data } = await axios.get(fullQueryString, {
            headers: {
                Authorization:
                    'Bearer ' + localStorage.getItem("jwt"),
            },
        });
        if (data) {
            //console.log(data.name);
            return data.name;
        }
    } catch (error) {
        console.log("Error getting colors from strapi " + error);
        return null;
    }
}