import re
import json
from urllib.request import urlopen
from bs4 import BeautifulSoup

def get_args(url):
    html = urlopen(url)
    soup = BeautifulSoup(html.read().decode('utf8'), 'html.parser')
    args = soup.findAll(text="Arguments")
    titles = [arg.find_previous("h3").contents[0] for arg in args]
    lis = []
    for arg in args:
        try:
            lis.append(arg.find_next("ul").contents)
        except:
            continue
    layer_to_args = {}
    for title, li in zip(titles, lis):
        args_desc = {}
        for l in li:
            if len(str(l).strip()) == 0:
                continue
            arg = l.find("strong").contents[0]
            contents = str(l)[str(l).find("</strong>:") + 11:]
            args_desc[arg] = contents
        layer_to_args[title] = args_desc 
    print("Finished: {}".format(url))
    return layer_to_args

def get_required_params(url):
    html = urlopen(url)
    soup = BeautifulSoup(html.read().decode('utf8'), 'html.parser')
    headers = soup.findAll("h3")
    codes = [header.find_next("code").contents[0] for header in headers]
    layer_to_args = {}
    split_by_commas_not_in_parens = re.compile(",(?![^()]*\))")
    for header, code in zip(headers, codes):
        layer_name = header.contents[0]
        cleaned_args_list = code.split(layer_name)[1].strip()[1:-1]
        args_list = split_by_commas_not_in_parens.split(cleaned_args_list)
        required_args = []
        optional_args = []
        for arg in args_list:
            if "=" in arg:
                optional_args.append(arg.split("=")[0].strip())
            else:
                required_args.append(arg.strip())
        layer_to_args[layer_name] = [required_args, optional_args]
    print("Finished: {}".format(url))
    return layer_to_args

# URLs to be scraped for documentation
urls = [
    "https://keras.io/layers/core/",
    "https://keras.io/layers/convolutional/",
    "https://keras.io/layers/pooling/",
    "https://keras.io/layers/local/",
    "https://keras.io/layers/recurrent/", 
    "https://keras.io/layers/embeddings/",
    "https://keras.io/layers/merge/",
    "https://keras.io/layers/advanced-activations/",
    "https://keras.io/layers/normalization/",
    "https://keras.io/layers/noise/",
    "https://keras.io/layers/wrappers/"
]

layer_docs = {}
for url in urls:
    layer_docs.update(get_required_params(url))

with open("arg_split.json", "w") as f:
    json.dump(layer_docs, f, indent=4, sort_keys=True)