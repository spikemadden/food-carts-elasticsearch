from flask import Flask, request, jsonify, render_template
from elasticsearch import Elasticsearch
import json

app = Flask(__name__)

es = Elasticsearch()

def load_data():
    with open('yelp/carts.json') as json_data:
        d = json.load(json_data)

        for id, cart in enumerate(d):
            response = es.index(index="yelp_data", doc_type="cart", id=id, body=cart)

        print "total carts loaded: ", len(d)

    es.indices.refresh(index="yelp_data")

@app.route("/")
def index():
    return render_template('map.html')

@app.route("/search")
def search():
    query_string = request.args.get('q')
    if not query_string:
        return jsonify({
            "status": "failure",
            "msg": "Please provide a query"
        })
    try:
        ########################################################################

        # PROBABLY NEED TO FIX THIS TO USE NGRAMS
        # WILDCARD MATCH IS PROBABLY GOING TO BE TOO SLOW

        ########################################################################

        # query = json.dumps({
        #     "query": {
        #         "multi_match": {
        #             "query": "newamerican",
        #             "fields": ["name", "categories.alias", "categories.title"]
        #         }
        #     }
        # })
        param = "*" + query_string + "*"

        query = json.dumps({
            "query": {
                "query_string": {
                    "query": param,
                    "fields": ["name", "categories.alias", "categories.title"]
                }
            }
        })

        res = es.search(index="yelp_data", size=1000, body=query)

    except Exception as e:
        return jsonify({
            "status": "failure",
            "msg": "error in reaching elasticsearch"
        })

    print("Got %d Hits:" % res['hits']['total'])

    results = {"carts": []}

    for hit in res['hits']['hits']:
        cart = {
            "name": hit["_source"]["name"],
            "address": hit["_source"]["location"]["address1"],
            "latitude": hit["_source"]["coordinates"]["latitude"],
            "longitude": hit["_source"]["coordinates"]["longitude"]
        }

        results["carts"].append(cart)

    return jsonify({
        "status": "success",
        "hits": res['hits']['total'],
        "carts": results["carts"],
    })


if __name__ == "__main__":
    load_data()
    app.run(host = 'localhost', port = 8000)
