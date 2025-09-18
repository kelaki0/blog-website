// Dynamic Post Loading
document.addEventListener('DOMContentLoaded', () => {
    // Select .load-more button
    const loadMoreBtn = document.querySelector('.load-more');
    // Select #post-grid (index.html) or .posts-grid (posts.html)
    const postGrid = document.querySelector('#post-grid') || document.querySelector('.posts-grid');

    // Ensure both elements exist
    if (!loadMoreBtn || !postGrid) {
        console.error('Load More button or post grid not found');
        return;
    }

    // Set postIndex to the number of existing posts
    let postIndex = postGrid.querySelectorAll('.post-card, .posts-card').length;
    // Set postsPerLoad: 2 for index.html, 3 for posts.html
    const postsPerLoad = postGrid.id === 'post-grid' ? 2 : 3;

    // Load posts.json
    fetch('/assets/data/posts.json')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load posts');
            return response.json();
        })
        .then(posts => {
            loadMoreBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const nextPosts = posts.slice(postIndex, postIndex + postsPerLoad);
                nextPosts.forEach(post => {
                    const postCard = document.createElement('article');
                    postCard.className = postGrid.id === 'post-grid' ? 'post-card' : 'posts-card';
                    postCard.dataset.topic = post.topic;
                    postCard.innerHTML = `
                        <img src="${post.image}" alt="${post.alt}" width="300" height="200" loading="lazy">
                        <h3>${post.title}</h3>
                        <p class="meta">Posted on ${post.date}</p>
                        <p>${post.summary}</p>
                        <a href="/posts/${post.topic}.html" class="read-more" aria-label="Read full ${post.title} post">Read More</a>
                    `;
                    postGrid.appendChild(postCard);
                });
                postIndex += postsPerLoad;
                if (postIndex >= posts.length) {
                    loadMoreBtn.style.display = 'none';
                }
            });
        })
        .catch(error => {
            console.error('Error loading posts:', error);
            loadMoreBtn.textContent = 'Error Loading Posts';
        });
});


// Search Bar Functionality
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('#search-input');
    const searchButton = document.querySelector('#search-button');
    const postGrid = document.querySelector('#post-grid') || document.querySelector('#posts-grid');
    const noResults = postGrid ? postGrid.querySelector('.no-results') : null;
    const featuredPost = document.querySelector('#featured-post'); // Select featured section (index.html only)

    if (!searchInput || !searchButton || !postGrid || !noResults) {
        console.error('Search bar or post grid elements not found');
        return;
    }

    const filterPosts = () => {
        const query = searchInput.value.trim().toLowerCase();
        const posts = postGrid.querySelectorAll('.post-card, .posts-card');
        let hasMatches = false;

        posts.forEach(post => {
            const title = post.querySelector('h3').textContent.toLowerCase();
            const topic = post.dataset.topic.toLowerCase();
            const isMatch = title.includes(query) || topic.includes(query);
            post.style.display = isMatch ? '' : 'none';
            if (isMatch) hasMatches = true;
        });

        // Toggle featured section and no-results message (index.html only)
        if (featuredPost) {
            featuredPost.style.display = query && hasMatches ? 'none' : '';
        }
        noResults.style.display = query && !hasMatches ? 'block' : 'none';

        // Show all posts if query is empty
        if (!query) {
            posts.forEach(post => {
                post.style.display = '';
            });
        }
    };

    searchButton.addEventListener('click', filterPosts);
    searchInput.addEventListener('input', filterPosts);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            filterPosts();
        }
    });
});