async function postData() {
	const response = await fetch('https://cors-anywhere.herokuapp.com/www.plussizingguide.com/cgi-bin/ultimate_guide_online.cgi', {
		method: 'POST',
		mode: 'no-cors',
		cache: 'default',
		credentials: 'same-origin',
		headers: {
			'Content-Type': 'text/html',
			'Access-Control-Allow-Origin': 'http://www.plussizingguide.com/cgi-bin/ultimate_guide_online.cgi'
		},
		redirect: 'follow',
		referrerPolicy: 'no-referrer',
		body: JSON.stringify( 
			{
				userName: 'cariboo',
				password: 'CAB67S',
				licenseKey: 'TT27KF71H48MYW'

			}
		)
	});
	return response.text();
}

postData()
  .then(data => {
    console.log(data); // JSON data parsed by `data.json()` call
  });

const PSG_userName = 'cariboo';
const PSG_password = 'CAB67S';
const PSG_licenseKey = 'TT27KF71H48MYW';
const url = 'https://www.plussizingguide.com/cgi-bin/ultimate_guide_online.cgi';
