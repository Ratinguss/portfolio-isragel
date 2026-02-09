# Sales Analytics Dashboard Feature

## Overview
The Sales Analytics Dashboard is an interactive data visualization tool built into the portfolio website. It allows visitors to upload CSV files and automatically generates appropriate charts based on the data structure.

## Features

### 1. CSV Upload
- Click on the "Sales Analytics Dashboard" card in the Portfolio section
- Upload CSV files via:
  - Click "Browse Files" button
  - Drag and drop files onto the upload area
- Supported format: CSV files with headers

### 2. Automatic Chart Generation
The dashboard intelligently analyzes uploaded data and creates appropriate visualizations:
- **Line Charts**: For time-series data (dates + numeric values)
- **Bar Charts**: For categorical comparisons
- **Pie/Doughnut Charts**: For distribution analysis

### 3. Data Type Detection
The system automatically detects:
- **Date columns**: Recognizes date formats and creates time-series visualizations
- **Numeric columns**: Identifies numerical data for calculations and charts
- **Categorical columns**: Detects categories for grouping and distribution

### 4. Data Persistence
- Uploaded data is stored in browser localStorage
- Data persists across page refreshes during the session
- Click "Reset to Demo Data" to clear uploaded data

### 5. Demo Data
When no file is uploaded, the dashboard displays sample data showcasing:
- Sales over time (line chart)
- Top products (bar chart)
- Product category distribution (pie chart)

## How to Use

### Opening the Dashboard
1. Navigate to the Portfolio section of the website
2. Click on the "Sales Analytics Dashboard" card
3. The dashboard modal will open

### Uploading Data
1. Click "Browse Files" or drag and drop a CSV file
2. Wait for the data to process
3. View the automatically generated charts

### Testing with Sample Data
A sample CSV file (`sample-data.csv`) is included in the repository for testing:
- Contains sales data with Date, Product, Category, Sales, and Quantity columns
- Demonstrates time-series, categorical, and distribution analysis

### Resetting Data
1. Click "Reset to Demo Data" button
2. Uploaded data is removed from localStorage
3. Dashboard returns to displaying demo data

## Technical Implementation

### Libraries Used
- **Chart.js v4.4.0**: For rendering interactive charts
- **PapaParse v5.4.1**: For CSV parsing

### Browser Compatibility
- Modern browsers with localStorage support
- Chrome, Firefox, Safari, Edge (latest versions)

### Data Storage
- Uses browser localStorage for session persistence
- No server-side storage or backend required
- Data remains private on the user's device

## Styling
- Dark theme matching the portfolio design
- Purple/blue accent colors (#6366f1, #10b981)
- Smooth animations and transitions
- Fully responsive design for mobile and desktop

## Code Structure
- `index.html`: Modal structure and HTML elements
- `styles.css`: Dashboard styling and animations
- `script.js`: Data processing, chart generation, and interactions

## Future Enhancements
- Export charts as images
- Support for more file formats (Excel, JSON)
- Advanced filtering and data manipulation
- Multiple chart types per dataset
- Custom color schemes