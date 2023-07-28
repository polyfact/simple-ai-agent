<h1 align="center">🤖 Simple AI Agent</h1>

<h4 align="center">
    <a href="https://github.com/polyfact/polyfact-node">Made using PolyFact</a>
</h4>

<p align="center">📰 A very simple agent that can search on wikipedia and perform basic calculations 📰</p>

<p align="center"><img src="demo.gif" /></p>

## 🚀 Getting started

To start the agent, clone the repository:

```bash
git clone https://github.com/polyfact/simple-ai-agent.git
```

Get your your polyfact token by signing up with github here: https://app.polyfact.com<br/>
Add your PolyFact Token in the `POLYFACT_TOKEN` environment variable:

```bash
export POLYFACT_TOKEN= # The token displayed on https://app.polyfact.com
```

You can now ask a question to the agent and see its reasoning by calling:

```bash
yarn start "Would getting a mole (unit) of moles (animal) in space in the volume of a cubic football field be enough to create a blackhole ? If not how much energy would it release by expanding ?"
```

## 🧑‍💻 Contributing

This repository is just an example but of course you can still create issues or PR if you find a bug ! You can also contribute to the [SDK](https://github.com/polyfact/polyfact-node) or to the [API](https://github.com/polyfact/polyfact-api-go) !
