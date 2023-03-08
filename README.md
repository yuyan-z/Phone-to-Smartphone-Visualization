# Phone-to-Smartphone-Visualization
My course project for INF552-Data Visualization with D3.js

## Dataset
The dataset selected is a publicly available dataset on Kaggle about mobile phones
released from 1994 to the third quarter of 2021. https://www.kaggle.com/datasets/mahipalsingh/phone-to-smartphone

## Data Pre-processing
As many of these features contain a very large number of null values, and the format of the records is not uniform, I use Python Pandas to extract the information needed. The processed data is stored in ./data

## Design

### Slider
- To facilitate the observation of the evolution of the phone, I created a double-ended slider. By dragging its start and end points, we can visualize data for a period or a year.

### Visualization of Brands
Bar Chart
- Each bar represents a brand and is identified by color. 
- Its height indicates the cumulative number of phones produced by the brand. 
- To clearly observe the difference in the number of phones produced by different brands, we made the bars sorted from highest to lowest. 
- A tooltip is added, which could display detailed information including brand name, production and ranking, when the mouse is hovering over a bar.

Stream Chart
- Each stream represents a brand and its area indicates production. 
- Also sorted to facilitate observation.
- As both of the bar chart and stream chart use data about brands and production, I create an interaction between them by classing the bars and streams corresponding to the same brand. When we select a bar or a stream, the corresponding part in the other char will be also selected.

![Screenshot1](https://user-images.githubusercontent.com/64955334/220603338-64db2d72-24e0-4240-ac78-4d468b486e59.jpg)

## Visualization of the Size
Line Chart
- Illuste the average length, width, thickness and weight of phones.

Scatter Chart
- Illuste the length, width, thickness and weight of each phone.
- For a more detailed view, When a point is selected, the information about this phone is displayed at the right of the chart, including the name, the brand and a photo of it.

![Screenshot2](https://user-images.githubusercontent.com/64955334/220603359-d2686323-3347-4578-89a5-2991e9871d62.jpg)

### Visualization of Other Features
Bubble Chart
-  Each bubble represents a color of phone and is filled with it. 
-  The size of the bubble indicates the number of phone produced with the corresponding color.

Word Cloud
- Since our dataset has 68 features and most of their values have little diversity or are null, I decide to process them all together with the word cloud.
- It can describe the information in text and reflect its frequency in font size.

![Screenshot3](https://user-images.githubusercontent.com/64955334/220603381-b0c6d7db-3eb4-48c8-8238-f8347b6e8c7b.jpg)
