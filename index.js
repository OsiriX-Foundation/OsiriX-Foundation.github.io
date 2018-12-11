// Configure the Keycloak adapter
let keycloak = Keycloak({
    url: 'https://keycloak.kheops.online/auth',
    realm: 'StaticLoginConnect',
    clientId: 'loginConnect'
});

let firstStudy = null;

window.onload = function initKeycloak() {
    keycloak.init({flow: 'hybrid', onLoad: 'login-required'});
};

keycloak.onReady = function updateLabels() {
    document.getElementById('username').textContent = keycloak.idTokenParsed.preferred_username;
    document.getElementById('email').textContent = keycloak.idTokenParsed.email;
    document.getElementById('name').textContent = keycloak.idTokenParsed.name;
    document.getElementById('given-name').textContent = keycloak.idTokenParsed.given_name;
    document.getElementById('family-name').textContent = keycloak.idTokenParsed.family_name;
    document.getElementById('token').textContent = keycloak.token;
};

function loadStudies() {
    keycloak.updateToken(30).then(function updateStudies() {
        const qidoURL = 'https://test.kheops.online/studies';

        let req = new XMLHttpRequest();
        req.open('GET', qidoURL, true);
        req.setRequestHeader('Accept', 'application/dicom+json');
        req.setRequestHeader('Authorization', 'Bearer ' + keycloak.token);

        req.onload = function () {
            if (req.status === 200) {
                document.getElementById('study-list').textContent = req.responseText;

                let qido = JSON.parse(req.responseText);
                let firstStudy = qido[0]["0020000D"]["Value"][0];
                let link = document.getElementById('first-study-link');

                link.textContent = firstStudy;
                link.href = "https://ohif.kheops.online/?url=https://test.kheops.online/studies/" + firstStudy + "/ohifmetadata#token=" + keycloak.token;
            } else if (req.status === 403) {
                alert('Forbidden');
            }
        };

        req.send();
    }).catch(function() {
        alert('Failed to refresh token');
    });
}

function loadImage() {
    keycloak.updateToken(30).then(function updateImage() {
        const imageURL = 'https://test.kheops.online/wado?studyUID=2.16.840.1.113669.632.20.121711.10000158860&seriesUID=1.2.276.0.7238010.5.1.3.0.43445.1378269638.1&requestType=WADO&rows=500&columns=500';

        let req = new XMLHttpRequest();
        req.open('GET', imageURL, true);
        req.setRequestHeader('Accept', 'image/jpeg');
        req.setRequestHeader('Authorization', 'Bearer ' + keycloak.token);
        req.responseType = 'arraybuffer';

        req.onload = function () {
            if (req.status === 200) {
                document.getElementById('sample-image').src = 'data:image/jpeg;base64,' + base64ArrayBuffer(req.response);
            } else if (req.status === 401) {
                alert('401 Unauthorized');
            } else if (req.status === 403) {
                alert('403 Forbidden');
            } else {
                alert('Invalid Status: ' + req.status);
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

