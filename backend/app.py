from flask import Flask, render_template, request
import json
import networkx as nx

app = Flask(__name__)
app.config.from_object('config')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/compile', methods=['GET','POST'])
def compile():
    raw_graph_data = request.get_data()
    raw_graph = json.loads(raw_graph_data.decode('utf-8'))

    # networkX is the canonical Python graph library, so convert to this
    G = nx.Graph() 
    for node in raw_graph['nodes']:
        G.add_node(node['id'])
    for link in raw_graph['links']:
        G.add_edge(link['source'], link['target'])

if __name__ == '__main__':
    app.run()
