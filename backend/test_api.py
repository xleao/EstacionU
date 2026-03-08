import requests

res = requests.post("http://localhost:8000/catalogs/sectores", json={"nombre": "Test"}, headers={"Authorization": "Bearer BAD_TOKEN"})
print("Status:", res.status_code)
print("Response:", res.text)
