from flask import Flask, render_template, request, send_file
import json
import os
import subprocess
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
    model_dir = os.path.join(os.path.dirname(__file__), app.config['UPLOAD_FOLDER'])
    keras_path = os.path.join(model_dir, "model.h5")
    model.save(keras_path)
    command = ("mmconvert "
        f"--srcFramework keras "
        f"--inputWeight {keras_path} "
        f"--dstFramework {df} "
        f"--outputModel {model_dir}/model_{df}"
    )
    subprocess.Popen(command, shell=True)

@app.route('/compile', methods=['POST'])
def compile():
    raw_graph_data = request.get_data()
    raw_graph = json.loads(raw_graph_data.decode('utf-8'))

    # networkX is the canonical Python graph library, so convert to this
    G = nx.DiGraph() 

    export_type = raw_graph['exportModelType'].lower()
    for node, properties in zip(raw_graph['nodes'], raw_graph['nodeProps']):
        G.add_node(node, args=properties['args'], name=properties['name'])

    for link in raw_graph['edges']:
        src, dst = link
        G.add_edge(src, dst)

    # seqential ordering of nodes is its topological sort
    sequential_order = list(nx.topological_sort(G))
    
    model = Sequential()
    for i, node_id in enumerate(sequential_order):
        keras_node_args = {}
        for arg in G.node[node_id]["args"]:
            # need to determine how to interpret ajax args for keras layers
            description = G.node[node_id]["args"][arg]["description"].lower()
            if "float" in description:
                arg_type = float
            elif "integer" in description:
                arg_type = int
            elif "boolean" in description:
                arg_type = bool
            else:
                arg_type = str

            raw_arg_value = G.node[node_id]["args"][arg]["value"]
            if G.node[node_id]["args"][arg]["value"] == "None":
                arg_value = None
            else:
                arg_value = arg_type(raw_arg_value)
            keras_node_args[arg] = arg_value
        name = G.node[node_id]["name"]
        
        # need to specify input dimension for the first layer
        if i == 0:
            keras_node_args["input_shape"] = (784,)
        model.add(name_to_layer[name](**keras_node_args))

    # # standard optimizer and loss function (assuming categorical data)
    opt = keras.optimizers.rmsprop(lr=0.0001, decay=1e-6)
    model.compile(loss='categorical_crossentropy',
                  optimizer=opt,
                  metrics=['accuracy'])
    
    convert(model, export_type)
    keras.backend.clear_session() # ignoring this causes crash in consecutive runs
    return render_template('index.html')

@app.route("/download/<model_type>", methods=['POST'])
def download_model(model_type=None):
    model_dir = os.path.join(os.path.dirname(__file__), app.config['UPLOAD_FOLDER'])
    path = os.path.join(model_dir, f"model_{model_type}")
    print(path)
    if model_type is None:
        self.Error(400)
    print("??")
    return send_file(path, as_attachment=False)

if __name__ == '__main__':
    app.run()
