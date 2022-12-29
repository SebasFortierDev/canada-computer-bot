# Project to look if an item is in stock online or in store on the Canada Computer website

## Installation
For everything to work, you need to have Node.js installed.

- Clone the repo
- Copy the .env.example file and create a .env with the same variables
- Follow the steps in the "Configuration" section below
- Execute these commands :
  - 'npm install'
  - 'npm start'


## Configuration
In the env file, you must specify these variables

- WEBSITE_IS_IN_ENGLISH=true | false

    Will define if the website is in english or in french

- ITEM_URL_TO_WATCH=theUrlOfTheItemToWatch

    Will define which item is going to be watched. Example : https://www.canadacomputers.com/product_info.php?cPath=8_129&item_id=137820

## Sending SMS
If you want to send a SMS when an item is in stock, you need to configure a Twilio account.
You can create a free trial account easily here : https://www.twilio.com/try-twilio.
After creating your account and setup everything, put your 'Account SID', your 'Auth token' and the phone number generated by Twilio in the .env files and put the 'SEND_SMS_WITH_TWILIO' variable at 'true'.

You also need to define the phone number that is going to receive the SMS in the "SMS_RECIPIENT" variable. Example: +14387075515

You can customize the message that you want to send in the SMS in the 'smsMessage' variable in the index.js file

## Running on a Raspberry pi
If you want to run this script on a Raspberry pi, you need to do the following :

- When creating the browser with 'puppeteer.launch()' we need to specify the executablePath of the Chromium browser. On a Raspberry pi 4, by default I had 'chromium-browser' installed. 

```
      const browser = await puppeteer.launch({
		headless: true,
		executablePath: 'chromium-browser'
	});
```

- You need to have a version of chromium that is compatible with Puppeteer. To see your Chrome version, write 'chrome://version/' in the browser search bar. Your version of Chromium need to match the version of Puppeteer (https://pptr.dev/chromium-support/)
