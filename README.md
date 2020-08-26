# Granny-Assistant

# Setting Up

To install all dependencies run:
```sh
yarn
```
To set up the database run:
```sh
docker-compose up
```
Make sure to leave this command running

Then, open a second terminal and run:
```sh
yarn knex migrate:latest
yarn knex seed:run
```
Run the NodeJS server by running:
```sh
yarn dev
```
Now you're good to start sending requests

The base URL you're going to use is: ``` http://localhost:3333 ```

# Users

### Create User

This route doesn't require authentication

To create an user send a ``` POST ``` request to ``` http://localhost:3333/users ```

The request body should contain the following:
```
{
    "name": "Assistant", //Your name, must be a String
    "email": "Assistant@email.com", //Your e-mail, must be a String in an email format and must be unique
    "type": "pacient", //The type of user you're creating, must be a string containing either "pacient", or "medic"
    "password": "Senha@123", //Your password, must have at least 8 digits, contain a lower case, an upper case and a special character
    "confirmPassword": "Senha@123" //Must be exactly equal the previous field
}
```
Keep in mind that all parameters are mandatory in this request

The API shall return all the information from your user as a confirmation of success


### List Users
This route requires authentication, see [Login](#login)

To list all users send a ```GET``` request to ``` http://localhost:3333/users ```

The request must contain an authentication header with:
```
    Bearer [Your authentication token]
```

### Update User
This route requires authentication, see [Login](#login)

To update an user send a ```PUT``` request to ``` http://localhost:3333/users ```

The request must contain an authentication header with:
```
    Bearer [Your authentication token]
```
The request body may contain the following:
```
{
    "name": "Assistant", //Your name, must be a String
    "email": "Assistant@email.com", //Your e-mail, must be a String in an email format and must be unique
    "type": "pacient", //The type of user you're creating, must be a string containing either "pacient", or "medic"
    "password": "Senha@123", //Your password, must have at least 8 digits, contain a lower case, an upper case and a special character
    "confirmPassword": "Senha@123" //Must be exactly equal the previous field
}
```
The only mandatory parameter in this request will be ```"confirmPassword"```, but only if ```"password"``` is sent

The API shall return all the updated information from your user as a confirmation of success

### Delete User
This route requires authentication, see [Login](#login)

To delete an user send a ```DELETE``` request to ``` http://localhost:3333/users ```

The request must contain an authentication header with:
```
    Bearer [Your authentication token]
```
The request body should contain the following:
```
{
    "password": "Senha@123", //Your password
}
```
The API shall return an ```"Account deleted"``` message as a confirmation of success

# Login
This  route is used for authentication

To login in the API send a ```POST``` request to ```http://localhost:3333/login```

The request body should contain the following: 
```
{
    "email": "Assistant@email.com", //Your e-mail
    "password": "Senha@123" //Your password
}
```
The API shall return your user information, as well as an unique token, that you'll use to get access to the authenticated routes

# Medicines

### List Medicines
This route requires authentication, see [Login](#login)

To list all medicines send a ```GET``` request to ``` http://localhost:3333/medicines ```

The request must contain an authentication header with:
```
    Bearer [Your authentication token]
```

### Create Medicine
This route requires authentication, see [Login](#login)

To create an medicine send a ```POST``` request to ``` http://localhost:3333/medicines ```

The request must contain an authentication header with:
```
    Bearer [Your authentication token]
```
The request body may contain the following:
```
{
    "name": "Aspirin", //The medicine name, must be a String
    "category": "OTC", //The medicine category, must be one of the following: ['OTC', 'POM', 'CD']
    "type": "tablet", //The type of the medicine, must be one of the following: ['liquid', 'tablet', 'capsule', 'injection']
}
```
Keep in mind that all parameters are mandatory in this request

The API shall return the medicine's information as a confirmation of success

### Update Medicine
This route requires authentication, see [Login](#login)

To update a medicine send a ```PUT``` request to ``` http://localhost:3333/medicines```

The request must contain an authentication header with:
```
    Bearer [Your authentication token]
```
The request body may contain the following:
```
{
    "id": "1", //The ID of the medicine that will be updated
    "name": "Aspirin", //The new name of the medicine
    "category": "OTC", //The medicine category, must be one of the following: ['OTC', 'POM', 'CD']
    "type": "tablet", //The type of the medicine, must be one of the following: ['liquid', 'tablet', 'capsule', 'injection']
}
```
The API shall return all the updated information from the medicine as a confirmation of success

### Delete Medicine
This route requires authentication, see [Login](#login)

To delete a medicine send a ```DELETE``` request to ``` http://localhost:3333/medicines ```

The request must contain an authentication header with:
```
    Bearer [Your authentication token]
```
The request body should contain the following:
```
{
    "id": "1", //The ID of the medicine that will be deleted
}
```
The API shall return the information of the deleted medicine as a confirmation of success

# Prescriptions

### List Prescriptions
This route requires authentication, see [Login](#login)

To list all prescriptions send a ```GET``` request to ``` http://localhost:3333/prescriptions ```

The request must contain an authentication header with:
```
    Bearer [Your authentication token]
```

### Create Prescription
This route requires authentication, see [Login](#login)

To create a prescription send a ```POST``` request to ``` http://localhost:3333/prescriptions ```

The request must contain an authentication header with:
```
    Bearer [Your authentication token]
```
The request body must contain the following:
```
{
    "pacientEmail": "Assistant@email.com", //The email of the pacient for the prescription, must be a string
    "medicineName": "Aspirin", //The name of the prescripted medicine, must be a string
    "treatmentStart": "01/01/2020 08:00:00", //The treatment start date, must be a date formatted string
    "dosage": "1 tablet", //The medicine dosage, must be a string
    "totalDoses": "6", //The total number of doses taken during treatment
    "dosageInterval": "8", //The interval, in hours, between doses
}
```
Keep in mind that all parameters are mandatory in this request

The API shall return the prescription's information as a confirmation of success

### Update Prescription

This route requires authentication, see [Login](#login)

To update a prescription send a ```PUT``` request to ``` http://localhost:3333/prescriptions```

The request must contain an authentication header with:
```
    Bearer [Your authentication token]
```
The request body may contain the following:
```
{
    "prescriptionId": "1", //The ID of the prescription that will be updated
    "pacientEmail": "Assistant@email.com", //The email of the pacient for the prescription, must be a string
    "medicineName": "Aspirin", //The name of the prescripted medicine, must be a string
    "treatmentStart": "01/01/2020 08:00:00", //The treatment start date, must be a date formatted string
    "dosage": "1 tablet", //The medicine dosage, must be a string
    "totalDoses": "6", //The total number of doses taken during treatment
    "dosageInterval": "8", //The interval, in hours, between doses
}
```
The API shall return all the updated information from the prescription as a confirmation of success

### Delete Prescription

This route requires authentication, see [Login](#login)

To delete a prescription send a ```DELETE``` request to ``` http://localhost:3333/prescriptions ```

The request must contain an authentication header with:
```
    Bearer [Your authentication token]
```
The request body should contain the following:
```
{
    "id": "1", //The ID of the prescription that will be deleted
}
```
The API shall return the information of the deleted prescription as a confirmation of success
