import pandas as pd
import pyarrow as pa
from pyarrow import parquet
from flask import Flask, render_template, request
import psutil
import io

# Create a simple Flask app to simulate file upload
app = Flask(__name__)

@app.route('/upload', methods=['POST'])
def upload():
    file = request.files['file']
    if file:
        # Read the CSV data from the uploaded file
        df = pd.read_csv(file.stream)

        # Print memory usage before conversion
        print(f"Memory usage before conversion: {psutil.Process().memory_info().rss / 1024 / 1024:.2f} MB")

        # Convert to PyArrow Table
        table = pa.Table.from_pandas(df)

        # Write to Parquet with Snappy compression
        pa.parquet.write_table(table, "output.parquet", compression="snappy")

        # Print memory usage after conversion
        print(f"Memory usage after conversion: {psutil.Process().memory_info().rss / 1024 / 1024:.2f} MB")

        return "File uploaded and converted successfully!"

    return "No file provided."

if __name__ == '__main__':
    app.run(debug=True)
