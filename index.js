// Configure the Keycloak adapter
let keycloak = Keycloak({
    url: 'https://keycloak.kheops.online/auth',
    realm: 'StaticLoginConnect',
    clientId: 'loginConnect'
});

function initKeycloak() {
    keycloak.init({flow: 'hybrid', onLoad: 'login-required'});
}

keycloak.onReady = function () {
    updateLabels();
};

function updateLabels() {
    document.getElementById('username').textContent = keycloak.idTokenParsed.preferred_username;
    document.getElementById('email').textContent = keycloak.idTokenParsed.email;
    document.getElementById('name').textContent = keycloak.idTokenParsed.name;
    document.getElementById('given-name').textContent = keycloak.idTokenParsed.given_name;
    document.getElementById('family-name').textContent = keycloak.idTokenParsed.family_name;
    document.getElementById('token').textContent = keycloak.token;
}

function loadStudies() {
    keycloak.updateToken(30).then(function updateStudies () {
        const qidoURL = 'https://test.kheops.online/authorization/studies';

        let req = new XMLHttpRequest();
        req.open('GET', qidoURL, true);
        req.setRequestHeader('Accept', 'application/dicom+json');
        req.setRequestHeader('Authorization', 'Bearer ' + keycloak.token);

        req.onreadystatechange = function () {
            if (req.readyState === 4) {
                if (req.status === 200) {
                    document.getElementById('study-list').textContent = req.responseText;
                } else if (req.status === 403) {
                    alert('Forbidden');
                }
            }
        };

        req.send();
    }).catch(function() {
        alert('Failed to refresh token');
    });
}

function clearStudies() {
    document.getElementById('study-list').textContent = "";
}

