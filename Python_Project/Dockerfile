# Use an official Python runtime as a parent image
FROM python:3.8

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
# (you can adapt this based on your dependencies)
RUN pip install --no-cache-dir -r requirements.txt

# Make port 80 available to the world outside this container
# (update this if your script uses a different port)
EXPOSE 80

# Define environment variable
ENV NAME World

# Run silk_bacahlau_bulk_data_upload_tool.py when the container launches
CMD ["python", "./silk_bacahlau_bulk_data_upload_tool.py"]