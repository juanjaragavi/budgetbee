const url = "https://api.brevo.com/v3/contacts";
const options = {
  method: "POST",
  headers: {
    accept: "application/json",
    "content-type": "application/json",
    "api-key": process.env.BREVO_API_KEY || "YOUR_BREVO_API_KEY_HERE",
  },
  body: JSON.stringify({
    attributes: { FIRSTNAME: "Juan", COUNTRIES: "United States" },
    updateEnabled: false,
    email: "juan.jaramillo@topnetworks.co",
    ext_id: "budgetbee",
  }),
};

fetch(url, options)
  .then((res) => res.json())
  .then((json) => console.log(json))
  .catch((err) => console.error(err));
