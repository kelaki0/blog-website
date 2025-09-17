// Dynamic Post Loading
const loadMoreBtn = document.querySelector('#load-more');

const postGrid = document.querySelector('#post-grid');

let postIndex = 5; // Start after intial 5 posts

// fetch posts from json file
fetch('/assets/data/posts.json')
.then(response => {
    if (!response.ok) throw new Error('Failed to load posts');
    return response.json();
})

.then(posts => {
    loadMoreBtn.addEventListener('click', (e) => {
        e.preventDefault(); // prevent default link navigation
        const nextPosts = posts.slice(postIndex, postIndex + 2); // load 2 posts at a time
        nextPosts.forEach(post => {
            const postCard = document.createElement('article');
            postCard.className = 'post-card';
            postCard.innerHTML = `
            <img src = "${post.image}" alt = "${post.alt} loading = "lazy" >
            <h3> ${post.title}</h3>
            <p class="meta">Posted on ${post.date} </p>
            <p> ${post.summary}</p>
            <a href = "/posts/ ${post.topic}.html" class="read-more" aria-label = "Read full ${post.title} post"> Read More </a>
            `;

            postGrid.appendChild(postCard);
        });

        postIndex += 2;
        if (postIndex >= posts.length) {
            loadMoreBtn.style.display = "none"; // hide button when no more posts
        }
    });
})

.catch(error => {
    console.error('Error loading posts:', error);
    loadMoreBtn.textContent = 'Error loading posts';
    loadMoreBtn.disabled = true;
})