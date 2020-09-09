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
yarn sequelize db:migrate
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
    "name": "Gustavo", //Your name, must be a String
    "email": "Gustavo@email.com", //Your e-mail, must be a String in an email format and must be unique
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
    "name": "Gustavo", //Your name, must be a String
    "email": "Gustavo@email.com", //Your e-mail, must be a String in an email format and must be unique
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
    "email": "Gustavo@email.com", //Your e-mail
    "password": "Senha@123" //Your password
}
```
The API shall return your user information, as well as an unique token, that you'll use to get access to the authenticated routes

# Mills

### List Mills
This route requires authentication, see [Login](#login)

To list all mills send a ```POST``` request to ``` http://localhost:3333/mills ```

The request must contain an authentication header with:
```
    Bearer [Your authentication token]
```
The request body may contain the following:
```
{
    "id": "1", //The ID of the Mill you're looking for
    "name": "Mill01", //The name of the Mill you're looking for
    "author": "Gustavo", //The author of the Mill you're looking for
}
```
There are no mandatory parameters in this request

### Create Mill
This route requires authentication, see [Login](#login)

To create a mill send a ```POST``` request to ``` http://localhost:3333/mills ```

The request must contain an authentication header with:
```
    Bearer [Your authentication token]
```
The request body may contain the following:
```
{
    "name": "Mill01", //The mill name, must be a String
}
```
Keep in mind that all parameters are mandatory in this request

The API shall return the mill's information as a confirmation of success

### Update Mill
This route requires authentication, see [Login](#login)

To update a mill send a ```PUT``` request to ``` http://localhost:3333/mills/:id```

Change the ```:id``` in the URL by the ID of the mill you want to update

The request must contain an authentication header with:
```
    Bearer [Your authentication token]
```
The request body may contain the following:
```
{
    "name": "Mill01", //The new name of the mill
}
```
The API shall return all the updated information from the mill as a confirmation of success

Keep in mind that you can only update mills created by you

### Delete Mill
This route requires authentication, see [Login](#login)

To delete a medicine send a ```DELETE``` request to ``` http://localhost:3333/medicines/:id ```

Change the ```:id``` in the URL by the ID of the mill you want to delete

The request must contain an authentication header with:
```
    Bearer [Your authentication token]
```
The API shall return the information of the deleted medicine as a confirmation of success

Keep in mind that you can only delete mills created by you

# Harvests

### List Harvests
This route requires authentication, see [Login](#login)

To list all harvests send a ```POST``` request to ``` http://localhost:3333/harvests/filter ```

The request must contain an authentication header with:
```
    Bearer [Your authentication token]
```
The request body may contain the following:
```
{
    "id": "1", //The ID of the Harvest you're looking for
    "code": "H01", //The code of the Harvest you're looking for
    "startDateFrom": "09/09/2020", //Look for Harvests starting after this date
    "startDateTo": "09/09/2020", //Look for Harvests starting before this date
    "endDateFrom": "09/09/2020", //Look for Harvests ending after this date
    "endDateTo": "09/09/2020", //Look for Harvests ennding before this date
    "ownerMill": "Mill01", //The name of the Mill that own's the Harvests you're looking for
    "author": "Gustavo", //The author of the Harvest you're looking for
}
```
There are no mandatory parameters in this request

### Create Harvest
This route requires authentication, see [Login](#login)

To create a harvest send a ```POST``` request to ``` http://localhost:3333/harvests/:mill_id ```

Change the ```:mill_id``` in the URL by the ID of the mill that own's your harvest

The request must contain an authentication header with:
```
    Bearer [Your authentication token]
```
The request body must contain the following:
```
{
    "code": "H01", //The harvest code, must be a string
    "start_date": "01/01/2020", //The harvest start date, must be a date formatted string
    "end_date": "01/01/2020", //The harvest end date, must be a date formatted string
}
```
Keep in mind that all parameters are mandatory in this request

The API shall return the prescription's information as a confirmation of success

### Update Harvest

This route requires authentication, see [Login](#login)

To update a prescription send a ```PUT``` request to ``` http://localhost:3333/harvest/:id```

Change the ```:id``` in the URL by the ID of the harvest you want to update

The request must contain an authentication header with:
```
    Bearer [Your authentication token]
```
The request body may contain the following:
```
{
    "code": "H01", //The harvest code, must be a string
    "mill_id": "1", //The ID of the new owner Mill for your harvest
    "start_date": "01/01/2020", //The harvest start date, must be a date formatted string
    "end_date": "01/01/2020", //The harvest end date, must be a date formatted string
}
```
There are no mandatory parameters in this request

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
