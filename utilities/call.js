import * as https from 'https';

// eslint-disable-next-line func-style,no-unused-vars,no-empty-function
export default async function makeCall(phoneNumber, code) {
    try {
        console.log(code)
        const postData = JSON.stringify({
            'recipient': phoneNumber,
            'type': 'flashcall',
            'payload': {
                'sender': '74956665610',
                'text': code
            }
        });
        const options = {
            hostname: 'online.sigmasms.ru',
            port: 443,
            path: '/api/sendings',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'c925a695ed921c13590bb2e18c691fbf98d43b04a3a9a5f97581b9b8c2e0c6e9'
            }
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                console.log(data);
            });
        });
        req.on('error', (error) => {
            console.error(error);
        });
        req.write(postData);
        req.end();
        return 'ok';
    } catch (error) {
        console.error(error);
        return 'error';
    }
}
