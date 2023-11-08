import { error } from '@sveltejs/kit';
import type { RequestEvent } from "./$types";
import * as EmailValidator from 'email-validator';
import { SERVICE_ACCT_EMAIL, PRIVATE_KEY } from '$env/static/private';
import { GoogleSpreadsheet } from "google-spreadsheet";
import { validateCaptcha } from '$lib/captchaValidator';

const SHEET_ID = "1ANWHf_xTo6Fjv9LgMGJ48MqUS0xnj6PwYmE16zwW3ts"

export async function POST({url}: RequestEvent): Promise<Response> {
  console.log("Processing POST request")
  const email = url.searchParams.get("email");
  const token = url.searchParams.get("token");
  console.log(token)

  if (email === null || !EmailValidator.validate(email)) {
    console.error("Email not provided or failed to validate")
    throw error(400, "Please provide a valid email")
  }

  // if (token === null) {
  //   console.error("No recaptcha token provied")
  //   throw error(400, "Please provide a recatpcha token")
  // } else {
  //   const resp = await validateCaptcha(token);
  //   console.log(resp)
  //   // If we should fail...
  //   if (resp.score < 0.6 || resp.action != "submit") {
  //     console.error("Recaptcha token failed to validate")
  //     throw error(500, "Internal server error")
  //   }
  // }

  const doc = new GoogleSpreadsheet(SHEET_ID);

  await doc.useServiceAccountAuth({
    // env var values are copied from service account credentials generated by google
    // see "Authentication" section in docs for more info
    client_email: SERVICE_ACCT_EMAIL,
    private_key: PRIVATE_KEY,
  });

  await doc.loadInfo();

  const sheet = doc.sheetsByIndex[0];
  await sheet.addRow({ email });

  return new Response("Ok");
}