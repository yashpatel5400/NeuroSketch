from flask import Flask, render_template, request
import json
import networkx as nx

import keras.optimizers
from keras.models import Sequential

from lookup import name_to_layer

app = Flask(__name__)
app.config.from_object('config')

@app.route('/')
def home():
    return render_template('index.html')

def convert(model, df):
    model.save("./model.h5")
    command = """mmconvert \
        --srcFramework keras \
        --inputWeight ./model.h5 \
        --dstFramework {} \
        --outputModel ./model_{}""".format(df, df)
    subprocess.Popen(command, shell=True)

@app.route('/compile', methods=['GET','POST'])
def compile():
    raw_graph_data = request.get_data()
    raw_graph = json.loads(raw_graph_data.decode('utf-8'))

    # networkX is the canonical Python graph library, so convert to this
    G = nx.DiGraph() 

    for node, properties in zip(raw_graph['nodes'], raw_graph['nodeProps']):
        G.add_node(node, args=properties['args'], name=properties['name'])

    for link in raw_graph['edges']:
        src, dst = link
        G.add_edge(src, dst)

    # seqential ordering of nodes is its topological sort
    sequential_order = list(nx.topological_sort(G))
    
    model = Sequential()
    for node_id in sequential_order:
        keras_node_args = {}
        for arg in G.node[node_id]["args"]:
            keras_node_args[arg] = G.node[node_id]["args"][arg]["value"]
        name = G.node[node_id]["name"]
        model.add(name_to_layer[name](**keras_node_args))

    # # standard optimizer and loss function (assuming categorical data)
    # opt = keras.optimizers.rmsprop(lr=0.0001, decay=1e-6)
    # model.compile(loss='categorical_crossentropy',
    #               optimizer=opt,
    #               metrics=['accuracy'])
    # convert(model, "tensorflow")

    # draws the graph (for debugging purposes)
    # nx.draw_networkx(G)
    # plt.savefig("test.png")
    # plt.clf()


if __name__ == '__main__':
    app.run()
