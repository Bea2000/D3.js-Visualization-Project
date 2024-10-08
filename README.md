# D3.js Visualization Project

## Context

This project was developed as part of the Information Visualization course in the second semester of 2022 at Pontificia Universidad Católica de Chile. The focus of this project was to analyze and visualize the impact of the British boy band One Direction through various datasets.

## Objectives

The main objectives of this project are:

- To provide a dynamic and engaging visualization of One Direction's music popularity across different countries and time periods.
- To allow users to explore the band's streaming data on Spotify, including the number of plays and chart performance.
- To enable comparisons of song and album success based on streaming counts and chart positions.

## Data Sources

The project utilizes three datasets:

1. **Song Streams**: Number of streams for each song on Spotify.
2. **Album Streams**: Number of streams for each album on Spotify.
3. **Top Charts**: Duration that songs and albums spent in the top 200 charts on Spotify, categorized by country.

The datasets were extracted from [Kworb](https://kworb.net/spotify/artist/4AK6F7OLvEQ5QYCBNiQWHq.html), and necessary data cleaning was performed, including adding ISO codes for each country and removing unnecessary columns.

## Target Users

This visualization is primarily aimed at fans of One Direction and individuals interested in the band's musical history and impact.

## Usage

The visualization allows users to interactively explore One Direction's music trends. Users can navigate through the visualizations to understand the statistics related to the band's popularity across different regions and timeframes.

## How to Run

1. Clone this repository:

   ```bash
   git clone <repository-url>
    ```

2. Navigate to the project directory:

   ```bash
   cd <repository-name>
   ```

3. Open the `index.html` file located in the `visualization` folder in your preferred browser or use a local server to run the project with:

    ```bash
    python -m http.server
    ```

    Then, open your browser and go to `http://ip:port/visualization/`.

## Visualizations

- The first visualization employs a geographic projection to represent countries based on the duration they had One Direction in the top 200 charts, using color coding for clarity.
- The second visualization features an interactive bar chart representing the number of streams for each song, which updates the geographic map based on user interaction.
- The third visualization presents a similar bar chart for albums, allowing users to filter songs based on album selection.
