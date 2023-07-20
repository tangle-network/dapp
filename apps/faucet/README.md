<div align="center">
<a href="https://www.webb.tools/">

![Webb Logo](../../.github/assets/webb_banner_light.png#gh-light-mode-only)
![Webb Logo](../../.github/assets/webb_banner_dark.png#gh-dark-mode-only)
</a>

  </div>

# Webb Faucet

<p align="left">
    <strong>Funding cryptocurrencies (assets) on the Webb Protocol System.</strong>
    <br />
</p>

## Run the Faucet

After setting up the development environment, you can proceed to run the faucet dapp locally by installing the required dependencies, copying the environment variables and running the faucet.

1. Clone this repo

   ```bash
   git clone git@github.com:webb-tools/webb-dapp.git
   ```

2. Install dependencies by `yarn`

   ```bash
   yarn install
   ```

3. Prepare the Twitter Application for Development

To run the faucet app locally, you need to create a new Twitter Application for development purposes. You can find the instructions for doing so [here](https://developer.twitter.com/en/docs/twitter-api/getting-started/getting-access-to-the-twitter-api).

**Notes**:

- For 'App permissions', select 'Read' permissions.
- For 'Type of App', select 'Native App'.
- For 'App info', fill in the 'Website URL' and 'Callback URLs' fields. Set the 'Callback URLs' field to `http://127.0.0.1:4200` and `http://localhost:4200`.

Next, initialize the environment variables by running the following command:

```bash
  cp .env.example .env && cp apps/faucet/.env.local.example apps/faucet/.env.local
```

Replace the placeholder values for `NEXT_PUBLIC_TWITTER_CLIENT_ID` and `TWITTER_CLIENT_SECRET` with your Twitter Client ID and Twitter Client Secret, respectively. You can find these values in your created Twitter Application on the developer portal. Read more about this process [here](https://developer.twitter.com/en/docs/authentication/oauth-1-0a/api-key-and-secret).

Visit `http://localhost:4200/` to see the Webb Faucet UI!

## Run with the Faucet backend

To use the faucet backend, follow the instructions here to set it up.

Then, update the `NEXT_PUBLIC_FAUCET_BACKEND_URL` in the `apps/faucet/.env.local` file to point to the locally running faucet backend.

Happy hacking!

<h2 id="help"> Need help? </h2>

If you need help or you want to additional information please:

- Refer to the [Webb Official Documentation](https://docs.webb.tools/).
- If you have feedback on how to improve the Webb Dapp interface or you have a specific question? Check out the [Webb Dapp Feedback Discussion](https://github.com/webb-tools/feedback/discussions/categories/webb-dapp-feedback).
- If you found a bug please [open an issue](https://github.com/webb-tools/webb-dapp/issues/new/choose) or [join our Discord](https://discord.gg/jUDeFpggrR) server to report it.
