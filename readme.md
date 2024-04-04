# TWNP

## requirements

This application expects that you've installed and setup the [Tuna](https://git.vrsal.cc/alex/tuna) OBS plugin, and that you are using and have connected a Spotify account.

`Python3` or some means of serving the project folder to your LAN (apache, node, go).

## Installing & Running Locally

1. Open Obs64.exe
2. Clone Project and navigate to it's directory within your shell enviroment.
3. Ensure the `HOSTIP` and `HOSTPORT` variables within `/main.js` are set for your envrioment.
4. Within the shell at project root and assuming $PATH access to python run `python3 -m http.server 9001`
5. Access from `127.0.0.1:9001` / `0.0.0.0:9001`
