import tensorflow as tf

__weights_dict = dict()

is_train = False

def load_weights(weight_file):
    import numpy as np

    if weight_file == None:
        return

    try:
        weights_dict = np.load(weight_file).item()
    except:
        weights_dict = np.load(weight_file, encoding='bytes').item()

    return weights_dict


def KitModel(weight_file = None):
    global __weights_dict
    __weights_dict = load_weights(weight_file)

    activation_1_input = tf.placeholder(tf.float32,  shape = (None, 784), name = 'activation_1_input')
    activation_1    = tf.nn.relu(activation_1_input, name = 'activation_1')
    dense_1         = tf.layers.dense(activation_1, 10, kernel_initializer = tf.constant_initializer(__weights_dict['dense_1']['weights']), bias_initializer = tf.constant_initializer(__weights_dict['dense_1']['bias']), use_bias = True)
    return activation_1_input, dense_1

