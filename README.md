# mytorch.tech

Campus safety help request app for NYU Abu Dhabi (or any other campus!) Check out the app here: [mytorch.tech](https://mytorchtech.herokuapp.com).

Our team created mytorch.tech to resolve issues arising in the legal gray area of alcohol and other types of misconduct at NYU Abu Dhabi. The UAE being a Muslim country forbids residents including NYUAD student the consumption of alcohol with rare exceptions. Some students regardless choose to abuse substances, which puts them and the university’s reputation in danger. Residential education trusts students to be smart about their personal decision, but there are always people who don’t know their limits or can’t control themselves. Most years went by with a few incidents, but last year oblivious freshmen called the ambulance without notifying the school, which resulted in a legally difficult situation. The administration’s solution was to crack down on any dangerous behaviour. Mytorch.tech offers an alternative conflict resolution method, by opening communication channels to resolve conflicts by contacting the person in charge appropriate to the situation in order to avoid unnecessary trouble.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.JS.

- Mongodb, download from official website, and MAKE SURE THAT IT IS RUNNING BY TYPING IN THE TERMINAL ON UBUNTU:

```
sudo service mongod start
```
- Heroku, if you want to install it.

### Installing

A step by step series of examples that tell you have to get a development env running

After cloning it, run

```
npm install
```
to install node modules. After that just type 

```
node server.js
```
and the server should be up and running on localhost:8002.
 

## Built With 
*Click on link to go to tutorials!*

* [Passport.js Google Oauth2](https://github.com/mstade/passport-google-oauth2) - The login framework. Note: you need to set up your Google API console for webhooks. I set mine for localhost:8002.
* [Twilio](https://support.twilio.com/hc/en-us/articles/235288367-Receiving-two-way-SMS-messages-with-Twilio) - SMS framework
* [Mongoose + Mongolab](http://mongoosejs.com/) - Used for the database
* [Pug](https://pugjs.org/api/getting-started.html) - UI templating
* Express - Routing
* [Bootstrap](https://v4-alpha.getbootstrap.com/) - Layout

## Contributing

Please feel free to reach out to any of us, if you would like to contribute by improving mytorch.tech. It is a great service to our school.


## Authors

* **Jihyun Kim** - jihyun@nyu.edu
* **Gabor Csapo** - gabor.csapo@nyu.edu
