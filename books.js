// Book data for different categories
const booksData = {
    featured: [
        {
            title: "Healing Meals",
            author: "G. Blakemore Evans",
            price: "€40.00",
            originalPrice: "€45.00",
            image: "/api/placeholder/180/270",
            category: "Health & Wellness"
        },
        {
            title: "NANI",
            author: "G. Blakemore Evans", 
            price: "€35.00",
            originalPrice: "€40.00",
            image: "/api/placeholder/180/270",
            category: "Fashion"
        },
        {
            title: "The Nani Fashion Issue",
            author: "G. Blakemore Evans",
            price: "€30.00", 
            originalPrice: "€35.00",
            image: "/api/placeholder/180/270",
            category: "Fashion"
        },
        {
            title: "Dirty Vegan",
            author: "Matthew Kenney",
            price: "€28.00",
            originalPrice: "€32.00", 
            image: "/api/placeholder/180/270",
            category: "Cookbook"
        }
    ],
    classics: [
        {
            title: "City of Ashes",
            author: "Cassandra Clare",
            price: "€25.00",
            image: "/api/placeholder/120/180"
        },
        {
            title: "City of Glass", 
            author: "Cassandra Clare",
            price: "€24.00",
            image: "/api/placeholder/120/180"
        },
        {
            title: "City of Fallen Angels",
            author: "Cassandra Clare", 
            price: "€26.00",
            image: "/api/placeholder/120/180"
        },
        {
            title: "City of Lost Souls",
            author: "Cassandra Clare",
            price: "€27.00", 
            image: "/api/placeholder/120/180"
        },
        {
            title: "City of Heavenly Fire",
            author: "Cassandra Clare",
            price: "€28.00",
            image: "/api/placeholder/120/180"
        }
    ],
    romance: [
        {
            title: "The Seven Husbands of Evelyn Hugo",
            author: "Taylor Jenkins Reid",
            price: "€22.00",
            image: "/api/placeholder/120/180"
        },
        {
            title: "Beach Read",
            author: "Emily Henry", 
            price: "€20.00",
            image: "/api/placeholder/120/180"
        },
        {
            title: "The Song of Achilles",
            author: "Madeline Miller",
            price: "€24.00", 
            image: "/api/placeholder/120/180"
        },
        {
            title: "Red, White & Royal Blue",
            author: "Casey McQuiston",
            price: "€23.00",
            image: "/api/placeholder/120/180"
        },
        {
            title: "The Invisible Life of Addie LaRue", 
            author: "V.E. Schwab",
            price: "€25.00",
            image: "/api/placeholder/120/180"
        }
    ],
    recent: [
        {
            title: "Tomorrow, and Tomorrow, and Tomorrow",
            author: "Gabrielle Zevin",
            price: "€26.00",
            image: "/api/placeholder/120/180"
        },
        {
            title: "The Thursday Murder Club",
            author: "Richard Osman",
            price: "€24.00", 
            image: "/api/placeholder/120/180"
        },
        {
            title: "Klara and the Sun",
            author: "Kazuo Ishiguro",
            price: "€25.00",
            image: "/api/placeholder/120/180"
        },
        {
            title: "The Midnight Library",
            author: "Matt Haig", 
            price: "€22.00",
            image: "/api/placeholder/120/180"
        },
        {
            title: "Project Hail Mary",
            author: "Andy Weir",
            price: "€27.00",
            image: "/api/placeholder/120/180"
        }
    ]
};

// Function to create featured book HTML
function createFeaturedBookHTML(book) {
    return `
        <div class="featured-book">
            <img src="${book.image}" alt="${book.title}" />
            <h3>${book.title}</h3>
            <p class="author">by: ${book.author}</p>
            <div class="rating">
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
            </div>
            <p class="description">On the other hand, we denounce with righteous indignation and...</p>
            <div class="price">
                <span class="current-price">${book.price}</span>
                ${book.originalPrice ? `<span class="original-price">${book.originalPrice}</span>` : ''}
            </div>
            <button class="add-to-cart">Add to Cart</button>
        </div>
    `;
}

// Function to create regular book HTML
function createBookHTML(book) {
    return `
        <div class="book-item">
            <img src="${book.image}" alt="${book.title}" />
            <h3>${book.title}</h3>
            <p class="author">by: ${book.author}</p>
            <div class="price">${book.price}</div>
        </div>
    `;
}

// Function to load books into a container
function loadBooks(containerId, books, isFeatured = false) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const booksHTML = books.map(book => 
        isFeatured ? createFeaturedBookHTML(book) : createBookHTML(book)
    ).join('');
    
    container.innerHTML = booksHTML;
}

// Function to initialize all book sections
function initializeBooks() {
    // Load featured books
    loadBooks('featured-carousel', booksData.featured, true);
    
    // Load category books
    loadBooks('classics-grid', booksData.classics);
    loadBooks('romance-grid', booksData.romance);
    loadBooks('recent-grid', booksData.recent);
}

// Initialize books when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeBooks();
    
    // Add click handlers for "Add to Cart" buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart')) {
            e.preventDefault();
            const bookTitle = e.target.closest('.featured-book').querySelector('h3').textContent;
            
            // Create notification
            showNotification(`"${bookTitle}" added to cart!`);
        }
    });
    
    // Add click handlers for book items (regular books)
    document.addEventListener('click', function(e) {
        if (e.target.closest('.book-item') && !e.target.classList.contains('add-to-cart')) {
            const bookItem = e.target.closest('.book-item');
            const bookTitle = bookItem.querySelector('h3').textContent;
            showNotification(`You clicked on "${bookTitle}"`);
        }
    });
});

// Function to show notifications
function showNotification(message) {
    // Remove existing notification
    const existingNot
