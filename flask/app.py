from flask import Flask, request, jsonify, render_template
from elasticsearch import Elasticsearch
import json

app = Flask(__name__)
es = Elasticsearch('es')

def load_data():
    with open('yelp/carts.json') as json_data:
        d = json.load(json_data)

        for id, cart in enumerate(d):
            es.index(index="yelp_data", doc_type="cart", id=id, body=cart)

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
    skipped = 0

    for hit in res['hits']['hits']:
        # if the name or address isn't listed
        # skip it
        if not hit["_source"]["name"] or not hit["_source"]["location"]["address1"]:
            skipped += 1
        else:
            cart = {
                "name": hit["_source"]["name"],
                "address": hit["_source"]["location"]["address1"],
                "latitude": hit["_source"]["coordinates"]["latitude"],
                "longitude": hit["_source"]["coordinates"]["longitude"],
                "url": hit["_source"]["url"]
            }

            results["carts"].append(cart)

    return jsonify({
        "status": "success",
        "hits": res['hits']['total'] - skipped,
        "carts": results["carts"],
    })


if __name__ == "__main__":
    load_data()
    app.run(host='0.0.0.0', port=8000)
