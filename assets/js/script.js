// get the current URL path
const currentPath = window.location.pathname;
// select all navigation links
const navLinks = document.querySelectorAll('.nav-links li a');
// loop through each link
navLinks.forEach(link => {
    //check if the link's href matches the current URL path
    if (link.pathname === currentPath) {
        // add the active class to the current link
        link.classList.add('active');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('#search-input');
    const clearButton = document.querySelector('#clear-search');
    const postsGrid = document.querySelector('#posts-grid') || document.querySelector('#post-grid');
    const noResults = document.querySelector('.no-results');

    if (searchInput && clearButton) {
        clearButton.addEventListener('click', () => {
            searchInput.value = ''; // Clear input
            searchInput.focus(); // Refocus input
            clearButton.style.display = 'none'; // Hide clear button
            if (postsGrid && noResults) {
                // Reset posts (show all, hide no-results)
                postsGrid.querySelectorAll('.posts-card, .post-card').forEach(card => {
                    card.style.display = '';
                });
                noResults.style.display = 'none';
            }
        });

        // Show/hide clear button based on input value
        searchInput.addEventListener('input', () => {
            clearButton.style.display = searchInput.value ? 'block' : 'none';
        });
    }
});

// Mobile hamburger toggle
const hamburger = document.querySelector('.hamburger');
const nav = document.querySelector('nav');
const dropdown = document.querySelector('.dropdown');

if (hamburger && nav && dropdown) {
    hamburger.addEventListener('click', () => {
        nav.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', nav.classList.contains('active'));
        dropdown.classList.toggle('active');
    });
}

// Topic Filter Functionality

// Add an event listener to the document object that triggers when the DOM (Document Object Model) is
// fully loaded and parsed. This ensures the script runs only after all HTML elements are available.
document.addEventListener('DOMContentLoaded', () => {
    const postGrid = document.querySelector('#posts-grid');
    const topicLinks = document.querySelectorAll('.topic-links a, .footer-links a');
    const noResults = postGrid ? postGrid.querySelector('.no-results') : null;
    const loadMoreBtn = document.querySelector('.load-more');

    if (!postGrid || !noResults || !topicLinks.length || !loadMoreBtn) {
        console.error('Topic filter elements not found');
        return;
    }

    let currentTopic = 'all'; // Track current topic

    const filterPostsByTopic = (topic, clickedLink) => {
        currentTopic = topic; // Update current topic
        fetch('/assets/data/posts.json')
            .then(response => {
                if (!response.ok) throw new Error('Failed to load posts');
                return response.json();
            })
            .then(posts => {
                // Clear current posts
                postGrid.querySelectorAll('.posts-card').forEach(post => post.remove());

                // Filter posts by topic
                const filteredPosts = topic === 'all' ? posts : posts.filter(post => post.topic === topic);

                // Display filtered posts
                filteredPosts.forEach(post => {
                    const postCard = document.createElement('article');
                    postCard.className = 'posts-card';
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

                // Update active state
                topicLinks.forEach(link => link.classList.remove('active'));
                clickedLink.classList.add('active');

                // Show no-results if no matches
                noResults.style.display = filteredPosts.length === 0 ? 'block' : 'none';

                // Disable load-more if no more posts for this topic
                loadMoreBtn.disabled = topic !== 'all' && filteredPosts.length === posts.filter(post => post.topic === topic).length;
                loadMoreBtn.style.display = filteredPosts.length === 0 ? 'none' : '';
            })
            .catch(error => {
                console.error('Error loading posts:', error);
                noResults.textContent = 'Error loading posts';
                noResults.style.display = 'block';
            });
    };

    topicLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (window.location.pathname.includes('posts.html')) {
                e.preventDefault();
                const topic = link.dataset.topic;
                filterPostsByTopic(topic, link);
            }
            // Else, allow navigation to /posts/[topic].html
        });
    });

    // dynamic post loading functionality
    fetch('/assets/data/posts.json')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load posts');
            return response.json();
        })
        .then(posts => {
            let postIndex = postGrid.querySelectorAll('.posts-card').length;
            const postsPerLoad = 3;

            loadMoreBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const availablePosts = currentTopic === 'all' ? posts : posts.filter(post => post.topic === currentTopic);
                const nextPosts = availablePosts.slice(postIndex, postIndex + postsPerLoad);

                nextPosts.forEach(post => {
                    const postCard = document.createElement('article');
                    postCard.className = 'posts-card';
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

                postIndex += nextPosts.length;
                if (postIndex >= availablePosts.length) {
                    loadMoreBtn.disabled = true;
                    loadMoreBtn.style.display = currentTopic === 'all' && postIndex >= posts.length ? 'none' : '';
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

