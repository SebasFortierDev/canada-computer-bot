const puppeteer = require('puppeteer');
require('dotenv').config();

let deliveryStockStatusText = {};
let inStoreStockStatusText = {};

if (process.env.WEBSITE_IS_IN_ENGLISH === 'true') {
    deliveryStockStatusText = {
        OUT_OF_STOCK: "SOLD OUT ONLINE",
        IN_STOCK: "AVAILABLE TO SHIP",
    }

    inStoreStockStatusText = {
        IN_STOCK: "AVAILABLE",
    }
} else {
    deliveryStockStatusText = {
        OUT_OF_STOCK: "RUPTURE DE STOCK EN LIGNE",
        IN_STOCK: "DISPONIBLE POUR LA LIVRAISON",
    }

    inStoreStockStatusText = {
        IN_STOCK: "Disponibilité",
    }
}

const stringToForceWebsiteLanguage = process.env.WEBSITE_IS_IN_ENGLISH === 'true' ? 'en' : 'fr';
const url = process.env.ITEM_URL_TO_WATCH + '&language=' + stringToForceWebsiteLanguage;

/** SMS configuration */
const recipientPhoneNumber = process.env.ITEM_URL_TO_WATCH;
const smsMessage =`L\'item est disponible en ligne ou à Brossard (${url})`;

function main() {
    (async () => {
        const browser = await puppeteer.launch({headless: true});

        const [page] = await browser.pages();

        await page.goto(url);

        await delay(2000); // Waiting for the 'Store pickup' section to load

        const itemIsInStockOnline = await deliveryStockStatus(page);
        const itemIsInStockInStore = await inStoreStockStatus(page);

        console.log("Item is in stock online : " + itemIsInStockOnline.toString())
        console.log("Item is in stock in store : " + itemIsInStockInStore.toString())

        if (itemIsInStockInStore || itemIsInStockOnline) {
            if (process.env.SEND_SMS_WITH_TWILIO === 'true') {
                const accountSid = process.env.TWILIO_ACCOUNT_SID;
                const authToken = process.env.TWILIO_AUTH_TOKEN;
                const client = require('twilio')(accountSid, authToken);

                client.messages
                    .create({
                        body: smsMessage,
                        from: process.env.TWILIO_PHONE_NUMBER,
                        to: recipientPhoneNumber
                    })
                    .then(message => console.log(message.sid))
                    .catch(error => console.log(error));
            }
        }

        await browser.close();
    })();
}

/**
 * Get the text on the site that describe the stock status for the delivery
 *
 * @param page
 * @returns {Promise<boolean>} True if the item is in stock online
 */
async function deliveryStockStatus(page) {
    const onlineInfo = await page.$("#onlineinfo")
    const deliveryStockStatus = (await page.evaluate(onlineInfo => onlineInfo.children[1].textContent, onlineInfo)).trim();

    return onlineDeliveryIsInStock(deliveryStockStatus);
}

/**
 * Verify if the text that describe the stock status for the delivery is the text that indicates that the item is in stock
 *
 * @param deliveryStockStatus The text that describe the stock status
 * @returns {boolean} True if the text indicate that the item is in stock online
 */
function onlineDeliveryIsInStock(deliveryStockStatus) {
    return deliveryStockStatus === deliveryStockStatusText.IN_STOCK
}

/**
 * Get the text on the site that describe the stock status for the in store
 *
 * @param page
 * @returns {Promise<boolean>} True if the item is in stock in store
 */
async function inStoreStockStatus(page) {
    const storeInfo = await page.$("#storeinfo")

    const inStoreStockStatus = (await page.evaluate(storeInfo => storeInfo.innerHTML, storeInfo))

    return inStoreIsInStock(inStoreStockStatus);
}

/**
 * Verify if the text that describe the stock status for the in store is the text that indicates that the item is in stock
 *
 * @param inStockStockStatus The text that describe the stock status
 * @returns {boolean} True if the text indicate that the item is in stock in store
 */
function inStoreIsInStock(inStockStockStatus) {
    return inStockStockStatus.includes(inStoreStockStatusText.IN_STOCK)
}

function delay(time) {
    return new Promise(function(resolve) {
        setTimeout(resolve, time)
    });
}

main();
