from flask import Flask, render_template, request
import json
import networkx as nx
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

app = Flask(__name__)
app.config.from_object('config')

@app.route('/')
def home():
    return render_template('index.html')


@app.route('/compile', methods=['GET','POST'])
def compile():
    raw_graph_data = request.get_data()
    raw_graph = json.loads(raw_graph_data.decode('utf-8'))
    print(raw_graph)
    # networkX is the canonical Python graph library, so convert to this
    G = nx.DiGraph() 
    for node, properties in zip(raw_graph['nodes'], raw_graph['nodeProps']):
        G.add_node(node, name=properties)

    for link in raw_graph['edges']:
        src, dst = link
        G.add_edge(src, dst)

    nx.draw_networkx(G)
    plt.savefig("test.png")
    plt.clf()


if __name__ == '__main__':
    app.run()
