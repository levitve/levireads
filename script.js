// This script adds interactivity to your LeviReads website

document.addEventListener('DOMContentLoaded', function() {
    // Navigation functionality
    const navItems = document.querySelectorAll('.nav-items li');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Book carousel functionality
    const booksGrid = document.querySelector('.books-grid');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    let scrollAmount = 0;
    const scrollStep = 320; // Approximately the width of one book item plus margin

    if (prevBtn && nextBtn && booksGrid) {
        prevBtn.addEventListener('click', function() {
            scrollAmount = Math.max(scrollAmount - scrollStep, 0);
            booksGrid.scrollTo({
                left: scrollAmount,
                behavior: 'smooth'
            });
        });

        nextBtn.addEventListener('click', function() {
            scrollAmount = Math.min(scrollAmount + scrollStep, booksGrid.scrollWidth - booksGrid.clientWidth);
            booksGrid.scrollTo({
                left: scrollAmount,
                behavior: 'smooth'
            });
        });
    }

    // Search functionality
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const bookItems = document.querySelectorAll('.book-item');
            
            bookItems.forEach(book => {
                const title = book.querySelector('h3').textContent.toLowerCase();
                const author = book.querySelector('.author').textContent.toLowerCase();
                const description = book.querySelector('.description').textContent.toLowerCase();
                
                if (title.includes(searchTerm) || author.includes(searchTerm) || description.includes(searchTerm)) {
                    book.style.display = 'block';
                } else {
                    book.style.display = 'none';
                }
            });
        });
    }

    // Read more functionality
    const readMoreLinks = document.querySelectorAll('.read-more');
    readMoreLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const bookItem = this.closest('.book-item');
            const description = bookItem.querySelector('.description');
            
            if (description.style.webkitLineClamp === 'none') {
                description.style.webkitLineClamp = '3';
                this.textContent = 'Read more';
            } else {
                description.style.webkitLineClamp = 'none';
                this.textContent = 'Read less';
            }
        });
    });

    // Continue reading button functionality
    const continueBtn = document.querySelector('.continue-btn');
    if (continueBtn) {
        continueBtn.addEventListener('click', function() {
            // This would typically open the e-reader with the book
            alert('Opening e-reader. This feature will be implemented in the next version.');
        });
    }

    // Start reading button functionality
    const startReadingBtn = document.querySelector('.primary-btn');
    if (startReadingBtn) {
        startReadingBtn.addEventListener('click', function() {
            // This would typically continue from the last book
            const continueReadingSection = document.querySelector('.continue-reading');
            if (continueReadingSection) {
                continueReadingSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Make books grid horizontally scrollable on mobile
    function adjustBooksGrid() {
        if (window.innerWidth <= 768) {
            booksGrid.style.display = 'flex';
            booksGrid.style.overflowX = 'auto';
            booksGrid.style.scrollSnapType = 'x mandatory';
            
            const bookItems = document.querySelectorAll('.book-item');
            bookItems.forEach(book => {
                book.style.minWidth = '250px';
                book.style.scrollSnapAlign = 'start';
            });
        } else {
            booksGrid.style.display = 'grid';
            booksGrid.style.overflowX = 'visible';
            
            const bookItems = document.querySelectorAll('.book-item');
            bookItems.forEach(book => {
                book.style.minWidth = 'auto';
                book.style.scrollSnapAlign = 'none';
            });
        }
    }

    // Run on load and resize
    adjustBooksGrid();
    window.addEventListener('resize', adjustBooksGrid);
});
