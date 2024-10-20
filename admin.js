const signupForm = document.getElementById('signup-form');
const responseText = document.getElementById('response');

// Handle form submission
signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch('/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (res.status === 409) {
            responseText.textContent = 'Team already exists. Please choose a different name.';
        } else if (res.status === 201) {
            responseText.textContent = 'Team registered successfully!';
            signupForm.reset(); // Clear input fields
        } else {
            responseText.textContent = 'Error registering team.';
        }
    } catch (error) {
        console.error('Error registering team:', error);
        responseText.textContent = 'Error registering team.';
    }
});
