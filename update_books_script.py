#!/usr/bin/env python
"""
update_books.py - Script to update book inventory from external sources
"""

import os
import csv
import json
import pandas as pd
import requests
from bs4 import BeautifulSoup
import logging
from datetime import datetime

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("book_updates.log"),
        logging.StreamHandler()
    ]
)

# Configuration
BOOK_CSV_PATH = 'books.csv'
SPREADSHEET_PATH = 'master_inventory.xlsx'  # You can also use Google Sheets API
AMAZON_AFFILIATE_ID = 'youraffiliateID-20'  # Replace with your actual affiliate ID

def load_existing_books():
    """Load existing books from CSV file"""
    try:
        if os.path.exists(BOOK_CSV_PATH):
            df = pd.read_csv(BOOK_CSV_PATH)
            logging.info(f"Loaded {len(df)} existing books from {BOOK_CSV_PATH}")
            return df
        else:
            logging.warning(f"No existing book CSV found at {BOOK_CSV_PATH}")
            return pd.DataFrame()
    except Exception as e:
        logging.error(f"Error loading existing books: {e}")
        return pd.DataFrame()

def load_master_inventory():
    """Load the master inventory from Excel or Google Sheets"""
    try:
        if os.path.exists(SPREADSHEET_PATH):
            df = pd.read_excel(SPREADSHEET_PATH)
            logging.info(f"Loaded {len(df)} books from master inventory")
            return df
        else:
            logging.error(f"Master inventory file not found at {SPREADSHEET_PATH}")
            return None
    except Exception as e:
        logging.error(f"Error loading master inventory: {e}")
        return None

def create_affiliate_link(amazon_url, affiliate_id=AMAZON_AFFILIATE_ID):
    """Add or update affiliate ID in Amazon URL"""
    if not amazon_url or 'amazon.com' not in amazon_url:
        return amazon_url
    
    # Handle different URL formats
    if 'tag=' in amazon_url:
        # Replace existing tag
        parts = amazon_url.split('tag=')
        base_url = parts[0] + 'tag='
        rest = parts[1]
        if '&' in rest:
            rest = rest.split('&', 1)[1]
            return base_url + affiliate_id + '&' + rest
        else:
            return base_url + affiliate_id
    elif '?' in amazon_url:
        return amazon_url + f'&tag={affiliate_id}'
    else:
        return amazon_url + f'?tag={affiliate_id}'

def update_book_inventory():
    """Main function to update the book inventory"""
    existing_books = load_existing_books()
    master_inventory = load_master_inventory()
    
    if master_inventory is None:
        return False
    
    # Process and merge data
    master_inventory['affiliate_link'] = master_inventory['amazon_url'].apply(
        lambda url: create_affiliate_link(url)
    )
    
    # Ensure all required columns exist
    required_columns = ['book_id', 'title', 'author', 'publisher', 'genre', 
                       'price', 'image_url', 'description', 'affiliate_link', 
                       'featured', 'tags', 'release_date', 'rating']
    
    for col in required_columns:
        if col not in master_inventory.columns:
            master_inventory[col] = ""
    
    # Save updated inventory
    master_inventory.to_csv(BOOK_CSV_PATH, index=False, quoting=csv.QUOTE_NONNUMERIC)
    logging.info(f"Successfully updated {BOOK_CSV_PATH} with {len(master_inventory)} books")
    
    # Optional: Generate category pages or other derived content
    generate_category_pages(master_inventory)
    
    return True

def generate_category_pages(df):
    """Generate individual HTML pages for each category/genre"""
    genres = df['genre'].unique()
    
    for genre in genres:
        genre_books = df[df['genre'] == genre]
        genre_slug = genre.lower().replace(' ', '-')
        
        # Create directory if it doesn't exist
        os.makedirs('categories', exist_ok=True)
        
        # Simple template for category page
        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{genre} Books - BookShelf</title>
    <meta name="description" content="Browse our collection of {genre} books at BookShelf. Find bestsellers and hidden gems.">
    <link rel="stylesheet" href="../style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div class="app-container">
        <!-- Include navigation from a template -->
        <div id="nav-placeholder"></div>
        
        <main class="main-content">
            <header class="category-header">
                <h1>{genre} Books</h1>
                <p>Discover our collection of {len(genre_books)} {genre} books</p>
            </header>
            
            <div class="book-grid">
                <!-- Books will be loaded dynamically -->
            </div>
        </main>
    </div>
    
    <script>
        // Load navigation
        fetch('../nav-template.html')
            .then(response => response.text())
            .then(data => {
                document.getElementById('nav-placeholder').innerHTML = data;
            });
        
        // Load books for this category
        document.addEventListener('DOMContentLoaded', function() {{
            const categoryBooks = {genre_books[['book_id', 'title', 'author', 'price', 'image_url', 'affiliate_link']].to_json(orient='records')};
            const bookGrid = document.querySelector('.book-grid');
            
            categoryBooks.forEach(book => {{
                const bookElem = document.createElement('div');
                bookElem.className = 'book-item';
                bookElem.innerHTML = `
                    <a href="${{book.affiliate_link}}" class="book-link" target="_blank" rel="nofollow">
                        <div class="book-cover">
                            <img src="../${{book.image_url}}" alt="${{book.title}}" />
                            <div class="book-overlay">
                                <span class="buy-now">Buy Now</span>
                            </div>
                        </div>
                        <h3>${{book.title}}</h3>
                        <p class="publisher">${{book.author}}</p>
                        <span class="price">${{book.price}}</span>
                    </a>
                `;
                bookGrid.appendChild(bookElem);
            }});
        }});
    </script>
</body>
</html>"""
        
        # Write to file
        with open(f'categories/{genre_slug}.html', 'w') as f:
            f.write(html_content)
        
        logging.info(f"Generated category page for {genre} with {len(genre_books)} books")

if __name__ == "__main__":
    logging.info("Starting book inventory update process")
    success = update_book_inventory()
    if success:
        logging.info("Book inventory update completed successfully")
    else:
        logging.error("Book inventory update failed")
