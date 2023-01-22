# KAA Data Editor

To promote other users to be admins, issue a POST request to the following url: `https://kenchreai-data-editor.herokuapp.com/api/admins/` with your admin token in the request header `'x-access-token'` and the payload of `{ "username": <username_to_upgrade> }`

To obtain your token, issue a POST request to `https://kenchreai-data-editor.herokuapp.com/api/token` with the JSON payload of:
```
{
  "username": {{ your username }},
  "password": {{ your password }}
}
```

If unsure of the specific username of someone, issue a GET request with your token in the header to `https://kenchreai-data-editor.herokuapp.com/api/users`.


# Docker notes

Build:
```
docker build . -t kaa
```

Run:
```
docker run --env-file .env -p 8080:8080 kaa
```
