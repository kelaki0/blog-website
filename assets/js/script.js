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