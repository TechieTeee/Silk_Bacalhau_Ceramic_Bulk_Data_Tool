import os
import pandas as pd
import pyarrow as pa
from pyarrow import parquet
from flask import Flask, render_template, request
import psutil

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    # Check if the 'file' key is in the request files
    if 'file' not in request.files:
        return 'No file part'

    file = request.files['file']

    # Check if the file has a name
    if file.filename == '':
        return 'No selected file'

    # Save the file to the 'input' folder
    input_folder = 'input'
    if not os.path.exists(input_folder):
        os.makedirs(input_folder)

    file_path = os.path.join(input_folder, file.filename)
    file.save(file_path)

    # Read the CSV data from the file
    df = pd.read_csv(file_path)

    # Print memory usage before conversion
    print(f"Memory usage before conversion: {psutil.Process().memory_info().rss / 1024 / 1024:.2f} MB")

    # Convert to PyArrow Table
    table = pa.Table.from_pandas(df)

    # Write to Parquet with Snappy compression
    output_folder = 'output'
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    output_path = os.path.join(output_folder, 'output.parquet')
    pa.parquet.write_table(table, output_path, compression="snappy")

    # Print memory usage after conversion
    print(f"Memory usage after conversion: {psutil.Process().memory_info().rss / 1024 / 1024:.2f} MB")

    return 'File uploaded and converted successfully!'

if __name__ == '__main__':
    app.run(debug=True)
