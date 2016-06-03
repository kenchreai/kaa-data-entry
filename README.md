#KAA Data Editor

To promote other users to be admins, issue a POST request to the following url: `https://kaa-data-editor.herokuapp.com/api/admins/{{username}}` with your admin token in the request header `'x-access-token'`. 

To obtain your token, issue a POST request to `https://kaa-data-editor.herokuapp.com/api/token` with the JSON payload of:
```
{
  "username": {{ your username }},
  "password": {{ your password }}
}
```
If unsure of the specific username of someone, issue a GET request with your token in the header to `https://kaa-data-editor.herokuapp.com/api/users`.

