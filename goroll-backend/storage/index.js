import axios from 'axios';
import config from '../config/config.js';
import FormData from 'form-data';

const configENV = config;

const ACCOUNT_ID = configENV.cloudflare_account_id;
const API_TOKEN = configENV.cloudflare_api_token;

const CLOUDFLARE_URL = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/images/v1`;

/** @type {import('axios').AxiosRequestConfig} */
const CONFIG = {
    headers: {
        Authorization: `Bearer ${API_TOKEN}`,
    },
};

export async function uploadImage(req, res) {
    const file = req.file;
    if (!file) return res.status(400).send({ message: 'No file uploaded' });
    console.log('File received:', file.originalname, file.size, file.mimetype);

    try {
        const result = await UploadToCloudFlare(file.buffer, file.originalname);
        res.status(200).send(result.data);
    } catch (err) {
        console.log(err);
        return res.status(400).send(err);
    }
}

/**
 * @param {string} fileBuffer
 * @param {string} filename
 * @returns
 */
function UploadToCloudFlare(fileBuffer, filename) {
    const form = new FormData();

    form.append('file', fileBuffer, filename);

    return axios.post(CLOUDFLARE_URL, form, CONFIG);
}
