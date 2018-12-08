"""
mmconvert:
  --srcFramework {caffe,caffe2,cntk,mxnet,keras,tensorflow,tf,pytorch}, 
    -sf {caffe,caffe2,cntk,mxnet,keras,tensorflow,tf,pytorch}
                        Source toolkit name of the model to be converted.
  --inputWeight INPUTWEIGHT, 
    -iw INPUTWEIGHT
                        Path to the model weights file of the external tool
                        (e.g caffe weights proto binary, keras h5 binary
  --inputNetwork INPUTNETWORK, 
    -in INPUTNETWORK
                        Path to the model network file of the external tool
                        (e.g caffe prototxt, keras json
  --dstFramework {caffe,caffe2,cntk,mxnet,keras,tensorflow,coreml,pytorch,onnx}, 
    -df {caffe,caffe2,cntk,mxnet,keras,tensorflow,coreml,pytorch,onnx}
                        Format of model at srcModelPath (default is to auto-
                        detect).
  --outputModel OUTPUTMODEL, 
    -om OUTPUTMODEL
                        Path to save the destination model
  --dump_tag {SERVING,TRAINING}
                        Tensorflow model dump type
"""

import keras
from keras.models import Sequential
from keras.layers import Dense, Dropout, Activation, Flatten
from keras.layers import Conv2D, MaxPooling2D

import subprocess

def convert(model, df):
    model.save("./model.h5")
    command = """mmconvert \
        --srcFramework keras \
        --inputWeight ./model.h5 \
        --dstFramework {} \
        --outputModel ./model_{}""".format(df, df)
    subprocess.Popen(command, shell=True)


if __name__ == "__main__":
    model = Sequential()
    model.add(Conv2D(32, (3, 3), padding='same',
                     input_shape=(32,32,3)))
    model.add(Activation('relu'))
    model.add(Conv2D(32, (3, 3)))
    model.add(Activation('relu'))
    model.add(MaxPooling2D(pool_size=(2, 2)))
    model.add(Dropout(0.25))

    model.add(Conv2D(64, (3, 3), padding='same'))
    model.add(Activation('relu'))
    model.add(Conv2D(64, (3, 3)))
    model.add(Activation('relu'))
    model.add(MaxPooling2D(pool_size=(2, 2)))
    model.add(Dropout(0.25))

    model.add(Flatten())
    model.add(Dense(512))
    model.add(Activation('relu'))
    model.add(Dropout(0.5))
    model.add(Dense(10))
    model.add(Activation('softmax'))

    # initiate RMSprop optimizer
    opt = keras.optimizers.rmsprop(lr=0.0001, decay=1e-6)

    # Let's train the model using RMSprop
    model.compile(loss='categorical_crossentropy',
                  optimizer=opt,
                  metrics=['accuracy'])

    save_keras(model, "tensorflow")