# Prompt

## Task: Add ConvertKit Subscriber API Endpoint for Quiz Forms

Your primary objective is to create a new API endpoint at `src/pages/api/quiz-submission.ts` that will handle quiz form submissions. This endpoint will execute when a user completes our credit card quiz and submits their information.

Currently, the quiz form has a placeholder API call in the `handleSubmit` function of `src/components/quiz/CreditCardForm.jsx` that redirects users to `/credit-card-recommender-p1`. The new API endpoint you will implement will add the user as a subscriber to a ConvertKit list by making an API request.

### API Request Details

- **Endpoint URL:** `https://api.kit.com/v4/subscribers`
- **Method:** `POST`

#### Example cURL Request

```bash
curl --request POST \
  --url https://api.kit.com/v4/subscribers \
  --header 'Content-Type: application/json' \
  --header 'X-Kit-Api-Key: <api-key>' \
  --data '{
    "first_name": "Juan",
    "email_address": "juanamillo@gmail.com",
    "state": "active",
    "fields": {
        "acepto_politicas_de_tratamiento_de_datos_y_terminos_y_condiciones": "1",
        "beneficio_empresa": null,
        "contacto": null,
        "cual_es_tu_ingreso_mensual": "Under $25,000",
        "cuanto_dinero_necesitas": null,
        "date_created": "2025-07-01 13:27:06",
        "describe_tu_necesidad": null,
        "elige_el_grupo_que_mejor_describe_tu_situacion_actual": null,
        "estas_reportado_en_buro_de_credito": null,
        "flujo_prestamos_2": null,
        "last_name": "Jaramillo",
        "monto_empresa": null,
        "newsletter": null,
        "pais": "Estados Unidos",
        "marca": "Budgetbee",
        "phone_number": null,
        "preferencia_1_cupo_de_credito_alto": null,
        "preferencia_2_sin_buro": null,
        "preferencia_3_millas_y_puntos": null,
        "preferencia_4_credito_inmediato": null,
        "preferencia_5_sin_anualidad": null,
        "preferencia_6_cashback": null,
        "que_es_lo_que_mas_importante_en_una_tarjeta_de_credito": "High credit limit",
        "quickemailverification_free": null,
        "quickemailverification_result": null,
        "quickemailverification_safe_to_send": null,
        "quiz_campana_leads": null,
        "quiz_prestamos": null,
        "quiz_prestamos_2": null,
        "quiz_prestamos_bbva": null,
        "quiz_prestamos_credilikeme": null,
        "quiz_prestamos_discover": null,
        "quiz_prestamos_empresarial_sabadell": null,
        "quiz_prestamos_upstart": null,
        "quiz_prestamo_kueski": null,
        "quiz_tarjetas": "SI",
        "quiz_tarjeta_bbva_azul": null,
        "quiz_tarjeta_citi_double_cash": null,
        "quiz_tarjeta_hsbc_zero": null,
        "quiz_tarjeta_nubank": null,
        "quiz_tarjeta_nubank_2": null,
        "quiz_tarjeta_platacard": null,
        "quiz_tarjeta_stori": null,
        "quiz_tarjeta_visa_signature": null,
        "recovery": null,
        "reingresar_flujo_tarjetas": null,
        "tarjetas_neobancos": null,
        "utm_adgroup": "utm_adgroup",
        "utm_campaign": "22188538750",
        "utm_content": "172989200783",
        "utm_medium": "cpc",
        "utm_source": "adwords",
        "utm_term": "utm_term"
  }
}'
```

### Environment Variables

The required API credentials have been added to the project's environment files (`.env`, `.env.local`, and `.env.production.local`).

```env
BYPASS_QUIZ_COOKIE_VALIDATION=true
KIT_API_KEY=kit_4daf87fb1910a70607639fb737580dcb
KIT_API_URL=https://api.kit.com/v4/subscribers
```

### Implementation Guide

1. **Analyze the Quiz Components:** Carefully examine the functionality of the credit card quiz in `src/components/quiz/CreditCardForm.jsx` and its step components (`src/components/quiz/steps/Step1.jsx`, `Step2.jsx`, `Step3.jsx`). Identify the complete user journey and map all the fields where user data is collected.
2. **Compare with API Payload:** Compare the form fields you identified with the JSON object payload expected by the ConvertKit API.
3. **Create the API Endpoint:** Following the pattern used in `src/pages/api/contact.ts`, create a new API endpoint at `src/pages/api/quiz-submission.ts`. This endpoint should dynamically populate the API request with the data submitted by the user.
4. **Update Quiz Form:** Uncomment and update the fetch call in the `handleSubmit` function of `src/components/quiz/CreditCardForm.jsx` to send data to your new API endpoint.

### Next Steps

Verify and test the new API endpoint to ensure it correctly processes quiz submissions and integrates with ConvertKit. If any issues are found, debug the implementation and fix them accordingly. Check the `astro.config.mjs` file for any necessary configuration, regarding the connection with the ConvertKit API.

### Important Considerations

When constructing the API payload, ensure that the data from the form fields are passed as dynamic values. Any fields in the example payload that do not have a corresponding form field (e.g., `UTM` parameters) should be passed unmodified, using the values from the provided example.

### Current Quiz Form Structure

The quiz form collects the following data:

- **Step 1:** User's credit card preference (mapped to `que_es_lo_que_mas_importante_en_una_tarjeta_de_credito`)
- **Step 2:** User's annual household income (mapped to `cual_es_tu_ingreso_mensual`)
- **Step 3:** User's email, first name, and terms acceptance

### API Endpoint Pattern

Follow the existing Astro API route pattern used in `src/pages/api/contact.ts`:

```typescript
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    // Handle the request

    return new Response(JSON.stringify({ message: "Success" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
```
