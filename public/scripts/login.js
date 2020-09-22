const strapiurl = 'http://localhost:1337/'

jQuery(document).ready(function ($) {
    document.getElementById("loginBtn").addEventListener("click", onClickSubmit);
});

async function onClickSubmit() {
    const identifier = await document.getElementById("username").value;
    const password = await document.getElementById("password").value;
    try {
        const { data } = await axios.post( strapiurl + 'auth/local', {
            identifier: identifier,
            password: password,
            });
        if(data) {
            localStorage.setItem('jwt', data.jwt);
            window.location.href = './views/selectcar.html';
        }
    } catch (error) {
        console.log(error);
        localStorage.setItem('jwt', null);
    } 
}
