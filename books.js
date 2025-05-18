/**
 * books.js - BookShelf Affiliate Website JavaScript
 * Handles loading book data, displaying books, and managing user interactions
 */

// Configuration
const AMAZON_TRACKING_ID = 'youraffiliateID-20'; // Update with your actual affiliate ID
const BOOKS_DATA_PATH = 'data/books.csv';
const IMAGE_PLACEHOLDER = '/api/placeholder/150/220';

// State tracking
let allBooks = [];
let featuredBooks = [];
let categories = {};

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

/**
 * Initialize the application
 */
async function initializeApp() {
    try {
        // Show loading indicators
        setLoadingState(true);
        
        // Load books data
        await loadBooks();
        
        // Setup various UI components
        setupBookCarousel();
        setupRecentAdditions();
        setupCategoryBrowser();
        setupFeaturedAuthor();
        
        // Remove loading indicators
        setLoadingState(false);
        
        // Show affiliate notification
        showAffiliateNotification();
        
    } catch (error) {
        console.error('Error initializing app:', error);
        handleError('Failed to load books. Please try again later.');
    }
}

/**
 * Set loading state for different sections
 */
function setLoadingState(isLoading) {
    const loadingIndicators = document.querySelectorAll('.loading-indicator');
    
    loadingIndicators.forEach(indicator => {
        indicator.style.display = isLoading ? 'block' : 'none';
    });
    
    // If there are no loading indicators, add them
    if (loadingIndicators.length === 0 && isLoading) {
        const sections = ['.book-carousel', '#recent .book-grid', '.category-list'];
        sections.forEach(selector => {
            const section = document.querySelector(selector);
            if (section) {
                section.innerHTML = '<div class="loading-indicator">Loading...</div>';
            }
        });
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Search functionality
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    // Menu toggle for mobile
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMobileMenu);
    }
    
    // Navigation tabs
    const navItems = document.querySelectorAll('.nav-items li a');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            // Only prevent default if it's a hash link
            if (targetId && targetId.startsWith('#')) {
                e.preventDefault();
                
                // Update active state
                navItems.forEach(navItem => {
                    navItem.parentElement.classList.remove('active');
                });
                this.parentElement.classList.add('active');
                
                // Scroll to section
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
    
    // Newsletter form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            if (emailInput && emailInput.value) {
                // Here you would typically send this to your newsletter service
                alert(`Thank you for subscribing with ${emailInput.value}! You'll receive our book recommendations soon.`);
                emailInput.value = '';
                
                // Save to localStorage to remember the user subscribed
                localStorage.setItem('newsletter_subscribed', 'true');
            }
        });
    }
}

/**
 * Load books data from CSV
 */
async function loadBooks() {
    try {
        const response = await fetch(BOOKS_DATA_PATH);
        if (!response.ok) {
            throw new Error(`Failed to load books: ${response.status}`);
        }
        
        const csvData = await response.text();
        allBooks = parseCSV(csvData);
        
        // Process books data
        processBooks();
        
        return allBooks;
    } catch (error) {
        console.error('Error loading books:', error);
        throw error;
    }
}

/**
 * Parse CSV data into book objects
 */
function parseCSV(csvData) {
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',');
    
    return lines.slice(1).filter(line => line.trim()).map(line => {
        // Handle commas within quoted fields
        let values = [];
        let inQuotes = false;
        let currentValue = '';
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(currentValue);
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        
        // Add the last value
        values.push(currentValue);
        
        // Create book object
        const book = {};
        headers.forEach((header, index) => {
            // Clean up the header and value
            const cleanHeader = header.trim().replace(/^"|"$/g, '');
            const value = values[index] ? values[index].trim().replace(/^"|"$/g, '') : '';
            book[cleanHeader] = value;
        });
        
        return book;
    });
}

/**
 * Process loaded books data
 */
function processBooks() {
    // Ensure affiliate IDs are applied to all links
    allBooks.forEach(book => {
        book.affiliate_link = ensureAffiliateId(book.affiliate_link);
        
        // Set default image if none provided
        if (!book.image_url || book.image_url === '') {
            book.image_url = IMAGE_PLACEHOLDER;
        }
    });
    
    // Extract featured books
    featuredBooks = allBooks.filter(book => book.featured === 'true');
    
    // Group books by category
    categories = {};
    allBooks.forEach(book => {
        const genre = book.genre;
        if (!categories[genre]) {
            categories[genre] = [];
        }
        categories[genre].push(book);
    });
}

/**
 * Ensure Amazon links have affiliate ID
 */
function ensureAffiliateId(url) {
    if (!url || !url.includes('amazon.com')) {
        return url;
    }
    
    // Add affiliate ID if missing
    if (url.includes('tag=')) {
        // Replace existing tag
        return url.replace(/tag=[^&]+/, `tag=${AMAZON_TRACKING_ID}`);
    } else if (url.includes('?')) {
        return `${url}&tag=${AMAZON_TRACKING_ID}`;
    } else {
        return `${url}?tag=${AMAZON_TRACKING_ID}`;
    }
}

/**
 * Set up book carousel
 */
function setupBookCarousel() {
    const carousel = document.querySelector('.book-carousel');
    if (!carousel) return;
    
    // Clear existing content
    carousel.innerHTML = '';
    
    // Decide which books to show - prioritize featured books
    const carouselBooks = featuredBooks.length > 0 ? 
        [...featuredBooks, ...allBooks.filter(b => !featuredBooks.includes(b))] : 
        [...allBooks];
    
    // Limit to reasonable number for carousel
    const booksToShow = carouselBooks.slice(0, 12);
    
    // Add books to carousel
    booksToShow.forEach(book => {
        const bookElement = createBookElement(book);
        carousel.appendChild(bookElement);
    });
    
    // Setup carousel navigation
    setupCarouselNavigation(carousel);
}

/**
 * Setup carousel navigation (prev/next buttons)
 */
function setupCarouselNavigation(carousel) {
    const prevBtn = document.querySelector('.nav-prev');
    const nextBtn = document.querySelector('.nav-next');
    
    if (prevBtn && nextBtn && carousel) {
        // Calculate scroll amount based on carousel item width
        const scrollAmount = carousel.querySelector('.book-item')?.offsetWidth + 20 || 160;
        
        prevBtn.addEventListener('click', () => {
            carousel.scrollBy({
                left: -scrollAmount * 3,
                behavior: 'smooth'
            });
        });
        
        nextBtn.addEventListener('click', () => {
            carousel.scrollBy({
                left: scrollAmount * 3,
                behavior: 'smooth'
            });
        });
    }
}

/**
 * Setup recent additions section
 */
function setupRecentAdditions() {
    const recentSection = document.querySelector('#recent .book-grid');
    if (!recentSection) return;
    
    // Clear existing content
    recentSection.innerHTML = '';
    
    // Sort by release date (newest first)
    const recentBooks = [...allBooks]
        .sort((a, b) => new Date(b.release_date) - new Date(a.release_date))
        .slice(0, 6); // Show only 6 most recent
    
    // Add books to recent section
    recentBooks.forEach(book => {
        const bookElement = createBookElement(book);
        recentSection.appendChild(bookElement);
    });
}

/**
 * Setup category browser section
 */
function setupCategoryBrowser() {
    const categoryList = document.querySelector('.category-list');
    if (!categoryList) return;
    
    // Clear existing content
    categoryList.innerHTML = '';
    
    // Add category items
    Object.keys(categories).forEach(genre => {
        const count = categories[genre].length;
        const genreSlug = genre.toLowerCase().replace(/ /g, '-');
        
        const categoryItem = document.createElement('a');
        categoryItem.href = `categories/${genreSlug}.html`;
        categoryItem.className = 'category-item';
        categoryItem.innerHTML = `
            <span class="category-name">${genre}</span>
            <span class="category-count">${count}</span>
        `;
        
        categoryList.appendChild(categoryItem);
    });
}

/**
 * Setup featured author section with rotation
 */
function setupFeaturedAuthor() {
    // This is already handled in the HTML template
    // but could be enhanced to load author data dynamically
}

/**
 * Create a book element for display
 */
function createBookElement(book) {
    const div = document.createElement('div');
    div.className = 'book-item';
    
    if (book.featured === 'true') {
        div.classList.add('featured');
    }
    
    div.innerHTML = `
        <a href="${book.affiliate_link}" class="book-link" target="_blank" rel="nofollow">
            <div class="book-cover">
                <img src="${book.image_url}" alt="${book.title}" loading="lazy" />
                <div class="book-overlay">
                    <span class="buy-now">Buy Now</span>
                </div>
            </div>
            <h3>${book.title}</h3>
            <p class="publisher">${book.author}</p>
            <span class="price">${book.price}</span>
        </a>
    `;
    
    return div;
}

/**
 * Handle search functionality
 */
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    
    // If search field is empty, restore original display
    if (!searchTerm) {
        setupBookCarousel();
        setupRecentAdditions();
        return;
    }
    
    // Filter books based on search term
    const filteredBooks = allBooks.filter(book => {
        return book.title.toLowerCase().includes(searchTerm) || 
               book.author.toLowerCase().includes(searchTerm) ||
               book.genre.toLowerCase().includes(searchTerm) ||
               (book.tags && book.tags.toLowerCase().includes(searchTerm));
    });
    
    // Update book carousel with search results
    const carousel = document.querySelector('.book-carousel');
    if (carousel) {
        carousel.innerHTML = '';
        
        if (filteredBooks.length === 0) {
            carousel.innerHTML = `<p class="no-results">No books found matching "${searchTerm}"</p>`;
        } else {
            filteredBooks.forEach(book => {
                carousel.appendChild(createBookElement(book));
            });
        }
    }
    
    // Update recent additions section
    const recentSection = document.querySelector('#recent .book-grid');
    if (recentSection) {
        recentSection.innerHTML = '';
        
        if (filteredBooks.length > 0) {
            filteredBooks.slice(0, 6).forEach(book => {
                recentSection.appendChild(createBookElement(book));
            });
        } else {
            recentSection.innerHTML = `<p class="no-results">No recent books found matching "${searchTerm}"</p>`;
        }
    }
}

/**
 * Toggle mobile menu
 */
function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('expanded');
    }
}

/**
 * Handle errors gracefully
 */
function handleError(message) {
    const sections = ['.book-carousel', '#recent .book-grid', '.category-list'];
    sections.forEach(selector => {
        const section = document.querySelector(selector);
        if (section) {
            section.innerHTML = `<div class="error-message">${message}</div>`;
        }
    });
}

/**
 * Show affiliate notification
 */
function showAffiliateNotification() {
    // Only show if not previously dismissed
    if (localStorage.getItem('affiliate_notice_dismissed') !== 'true') {
        const notification = document.createElement('div');
        notification.className = 'affiliate-notification';
        notification.innerHTML = `
            <p>This site uses affiliate links to recommend products</p>
            <button class="close-notification">✕</button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            notification.remove();
            localStorage.setItem('affiliate_notice_dismissed', 'true');
        }, 3000);
        
        // Allow manual dismissal
        notification.querySelector('.close-notification').addEventListener('click', () => {
            notification.remove();
            localStorage.setItem('affiliate_notice_dismissed', 'true');
        });
    }
}
