import { sleep } from "k6";
import { login, makeRequests } from "./helpers.js";
import { K6Config } from "./config.js";

export const options = K6Config.smoke;

export function setup() {
  // Verify login works before starting VUs
  login();
}

export default function () {
  login();
  makeRequests();
  sleep(1);
}
