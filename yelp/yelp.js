'use strict';

const fs = require('fs');
const yelp = require('yelp-fusion');

const client = yelp.client("iDrgAYLs1IoftcP-0EGE2nq7b0e8xdnqQosfV5dGpUewvVUutDAGY_k5NGgKdpaM5p2uHIOBtOcJIXN8_z2aNiFN-O-N0l_u6XK2TeU3G1gle0PLUQAODWdCcwSfWXYx");

console.log("make a request to yelp api to get json");
// maybe only make call if last modified of yelp.json is longer than a week

let results = [];
let offset = 0;

// we can only get 1000 results
while (offset <= 450) {

  let search_request = {
    term:'food carts',
    longitude: -122.653942,
    latitude: 45.523062,
    //location: 'portland, or',
    radius: 2300,
    limit: 50,
    offset: offset
  };

  console.log("sending request to yelp");

  results.push(client.search(search_request));

  offset += 50;
}

Promise.all(results).then(values => {
  let yelp_json = values[0].jsonBody.businesses;

  for (let promise_index = 1; promise_index < values.length; promise_index++) {
    yelp_json = yelp_json.concat(values[promise_index].jsonBody.businesses);
    //console.log(values[promise_index].jsonBody.businesses[0].name);
  }

  //console.log(yelp_json);
  write_file('carts.json', JSON.stringify(yelp_json, null, 2)).then((success) => {
    console.log(success);
  }, (error) => {
    console.log(error);
  });
})

function write_file(file_name, file_content) {
  return new Promise((resolve, reject) => {
    fs.writeFile(file_name, file_content, err => {
      if(err) {
        reject("didn't work");
      }
      else {
        resolve("wrote to file");
      }
    })
  });
}
